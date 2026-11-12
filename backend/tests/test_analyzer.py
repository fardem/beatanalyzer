"""
Tests fuer backend/analyzer.py
Ausfuehren:  python -m unittest discover -s backend/tests -v
"""

import os
import sys
import tempfile
import types
import importlib
import unittest

import numpy as np
import soundfile as sf

# Vorab laden, damit ein torch-Stub im Test scipys Backend-Erkennung nicht stoert
import librosa.onset  # noqa: F401
import librosa.beat  # noqa: F401
import scipy.signal  # noqa: F401

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND_DIR)

SR = 44100


def write_click_track(path, bpm=120.0, seconds=12.0):
    y = np.zeros(int(SR * seconds), dtype=np.float32)
    k = np.arange(int(0.05 * SR))
    for i, t in enumerate(np.arange(0.5, seconds, 60.0 / bpm)):
        n = int(t * SR)
        f = 1500 if i % 4 == 0 else 800
        burst = (0.9 if i % 4 == 0 else 0.5) * np.sin(2 * np.pi * f * k / SR) * np.exp(-k / (0.01 * SR))
        y[n:n + len(k)] += burst[: len(y) - n]
    sf.write(path, y, SR)


def load_analyzer_with_fake_beat_this(fake_inference):
    pkg = types.ModuleType("beat_this")
    pkg.inference = fake_inference
    sys.modules["beat_this"] = pkg
    sys.modules["beat_this.inference"] = fake_inference
    sys.modules.pop("analyzer", None)
    return importlib.import_module("analyzer")


class AnalyzerTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        self.wav = os.path.join(self.tmp, "click.wav")
        write_click_track(self.wav)

    def tearDown(self):
        for name in ("beat_this", "beat_this.inference", "analyzer"):
            sys.modules.pop(name, None)

    def test_fallback_without_beat_this(self):
        sys.modules["beat_this"] = None  # erzwingt ImportError
        sys.modules.pop("analyzer", None)
        analyzer = importlib.import_module("analyzer")
        self.assertFalse(analyzer.BEAT_THIS_AVAILABLE)

        result = analyzer.analyze_audio_file(self.wav, "click.wav")
        self.assertIn("Librosa", result["engine"])
        self.assertAlmostEqual(result["globalBpm"], 120.0, delta=2.0)
        self.assertEqual(result["timeSignature"]["numerator"], 4)

    # --- helpers -------------------------------------------------------------------------------------

    def analyze_without_beat_this(self):
        sys.modules["beat_this"] = None  # erzwingt ImportError
        sys.modules.pop("analyzer", None)
        self.analyzer = importlib.import_module("analyzer")
        return self.analyzer.analyze_audio_file(self.wav, "click.wav")

    def analyze_with_fake(self, init_raises=None, frames_raise=None, calls=None):
        """Analyse with FakeBeatThis (50 frames/s, 600 frames): beat logit 4.0 at every beat (0.5 s, 1.0 s, ...),
        downbeat logit 2.0 one frame after every fourth beat, -4.0 everywhere else."""
        calls = {} if calls is None else calls
        beats = np.arange(0.5, 12.0, 0.5)

        class FakeBeatThis:
            def __init__(self, checkpoint_path="final0", device="cpu", float16=False, dbn=False):
                if init_raises:
                    raise init_raises
                calls["init"] = dict(checkpoint_path=checkpoint_path, device=device)

            def signal2spect(self, signal, sr):
                calls["signal"], calls["sr"] = signal, sr
                return "spect"

            def spect2frames(self, spect):
                if frames_raise:
                    raise frames_raise
                beat = np.full(600, -4.0)
                down = np.full(600, -4.0)
                for i, t in enumerate(beats):
                    beat[int(round(t * 50))] = 4.0
                    if i % 4 == 0:
                        down[int(round(t * 50)) + 1] = 2.0
                return beat, down

            def frames2beats(self, beat_logits, downbeat_logits):
                return beats, beats[::4]

        class ExplodingFile2Beats(FakeBeatThis):
            def __call__(self, audio_path):
                raise AssertionError("File2Beats darf nicht benutzt werden (torchaudio/FFmpeg-Abhaengigkeit)")

        fake = types.ModuleType("beat_this.inference")
        fake.Audio2Beats = FakeBeatThis
        fake.File2Beats = ExplodingFile2Beats

        torch_stub_needed = "torch" not in sys.modules
        if torch_stub_needed:
            torch_stub = types.ModuleType("torch")
            torch_stub.cuda = types.SimpleNamespace(is_available=lambda: False)
            sys.modules["torch"] = torch_stub
        try:
            self.analyzer = load_analyzer_with_fake_beat_this(fake)
            self.assertTrue(self.analyzer.BEAT_THIS_AVAILABLE)
            return self.analyzer.analyze_audio_file(self.wav, "click.wav")
        finally:
            if torch_stub_needed:
                sys.modules.pop("torch", None)

    # --- beat_this ---------------------------------------------------------------------------------

    def test_beat_this_gets_decoded_signal_not_file_path(self):
        calls = {}
        result = self.analyze_with_fake(calls=calls)
        self.assertEqual(result["engine"], "CPJKU beat_this Transformer")
        self.assertEqual(calls["init"]["checkpoint_path"], "final0")
        self.assertIsInstance(calls["signal"], np.ndarray)
        self.assertEqual(calls["signal"].ndim, 1)
        self.assertGreater(calls["sr"], 0)
        self.assertEqual(result["totalBeats"], 23)
        self.assertAlmostEqual(result["globalBpm"], 120.0, delta=0.5)

    def test_confidence_from_model_values(self):
        result = self.analyze_with_fake()
        self.assertEqual(result["beats"][1]["confidence"], 0.982)   # sigmoid(4.0)
        self.assertEqual(result["beats"][0]["confidence"], 0.881)   # Downbeat: sigmoid(2.0), einen Frame daneben

    def test_curves_from_model(self):
        result = self.analyze_with_fake()
        curve = result["activationCurve"]
        self.assertEqual(result["activationSource"], "beat_this")
        self.assertEqual(max(p["beatActivation"] for p in curve), 0.982)
        self.assertEqual(max(p["downbeatActivation"] for p in curve), 0.881)

    def test_downsampling_keeps_peaks(self):
        self.analyze_without_beat_this()
        beat = np.zeros(5000)
        beat[2501] = 0.9
        curve = self.analyzer.activation_curve(beat, None)
        self.assertEqual(len(curve), 1000)
        self.assertEqual(max(p["beatActivation"] for p in curve), 0.9)
        self.assertTrue(all(p["downbeatActivation"] is None for p in curve))
        self.assertEqual(curve[500]["time"], 50.0)

    def test_librosa_has_no_confidence(self):
        result = self.analyze_without_beat_this()
        self.assertTrue(all(b["confidence"] is None for b in result["beats"]))
        self.assertEqual(result["activationSource"], "onset")
        self.assertTrue(all(p["downbeatActivation"] is None for p in result["activationCurve"]))
        self.assertIsNone(self.analyzer.resolve_marker_data(result)["markers"][0]["confidence"])

    def test_meter_and_bar_share(self):
        self.analyze_without_beat_this()
        beats = [i * 0.5 for i in range(40)]
        downs = [beats[i] for i in range(0, 36, 4)] + [beats[36], beats[39]]   # 9 Takte zu 4, einer zu 3
        self.assertEqual(self.analyzer.meter_from_beats(beats, downs), (4, 90))
        self.assertEqual(self.analyzer.meter_from_beats(beats, [0.0]), (4, None))
        self.assertEqual(self.analyzer.meter_from_beats(beats, []), (4, None))

    def test_time_signature_fields(self):
        ts = self.analyze_with_fake()["timeSignature"]
        self.assertEqual(ts, {"numerator": 4, "denominator": 4, "name": "4/4", "barShare": 100})


    # --- engineInfo --------------------------------------------------------------------------------

    def test_engine_info_without_beat_this(self):
        result = self.analyze_without_beat_this()
        self.assertEqual(result["engineInfo"],
                         {"id": "librosa", "device": None, "gpu": None, "fallbackReason": "not_installed"})
        self.assertEqual(self.analyzer.engine_status()["fallbackReason"], "not_installed")

    def test_engine_info_beat_this_on_cpu(self):
        result = self.analyze_with_fake()      # torch-Stub: cuda.is_available() -> False
        self.assertEqual(result["engineInfo"], {"id": "beat_this", "device": "cpu", "gpu": None, "fallbackReason": None})
        self.assertEqual(result["engine"], "CPJKU beat_this Transformer")

    def test_model_load_failed(self):
        result = self.analyze_with_fake(init_raises=RuntimeError("kein Modell"))
        self.assertEqual(result["engineInfo"]["fallbackReason"], "model_load_failed")
        self.assertEqual(result["engineInfo"]["id"], "librosa")
        self.assertEqual(self.analyzer.engine_status()["fallbackReason"], "model_load_failed")

    def test_inference_failed(self):
        result = self.analyze_with_fake(frames_raise=RuntimeError("CUDA out of memory"))
        self.assertEqual(result["engineInfo"]["fallbackReason"], "inference_failed")
        self.assertEqual(result["engine"], "Librosa MIR (Fallback)")

    def test_marker_json_carries_engine(self):
        result = self.analyze_with_fake()
        self.assertEqual(self.analyzer.resolve_marker_data(result)["engine"], result["engineInfo"])
        del result["engineInfo"]
        self.assertNotIn("engine", self.analyzer.resolve_marker_data(result))


if __name__ == "__main__":
    unittest.main()
