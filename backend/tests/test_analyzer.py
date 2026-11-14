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

    def analyze_with_fake(self, init_raises=None, frames_raise=None, calls=None, no_downbeats=False,
                          extra_downbeat_at=None, smooth=True, extra_logit=0.5,
                          protect=None):
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
                calls["frames"] = calls.get("frames", 0) + 1
                if frames_raise and not calls.get("stop_raising"):
                    raise frames_raise
                beat = np.full(600, -4.0)
                down = np.full(600, -4.0)
                for i, t in enumerate(beats):
                    beat[int(round(t * 50))] = 4.0
                    if i % 4 == 0:
                        down[int(round(t * 50)) + 1] = 2.0
                if extra_downbeat_at is not None:          # doubtful extra downbeat reported by the model
                    down[int(round(extra_downbeat_at * 50))] = extra_logit
                return beat, down

            def frames2beats(self, beat_logits, downbeat_logits):
                downs = [] if no_downbeats else list(beats[::4])
                if extra_downbeat_at is not None:
                    downs = sorted(downs + [extra_downbeat_at])
                return beats, np.array(downs)

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
            kw = {} if protect is None else {"protect": protect}
            return self.analyzer.analyze_audio_file(self.wav, "click.wav", smooth=smooth, **kw)
        finally:
            if torch_stub_needed:
                sys.modules.pop("torch", None)

    # --- beat_this ---------------------------------------------------------------------------------

    def test_model_load_failure_logs_the_real_cause(self):
        # seen at the user: beat_this hides the reason of a failed download behind "Could not load the checkpoint"
        import contextlib, io, urllib.error

        def hidden():
            try:
                raise urllib.error.URLError("getaddrinfo failed")
            except Exception:
                raise ValueError("Could not load the checkpoint given the provided name", "final0")
        out = io.StringIO()
        with contextlib.redirect_stdout(out):
            self.analyze_with_fake(init_raises=None)
            self.analyzer.predictor_instance = None

            class Failing:
                def __init__(self, *a, **k):
                    hidden()
            self.analyzer.Audio2Beats = Failing
            torch_stub = types.ModuleType("torch")
            torch_stub.cuda = types.SimpleNamespace(is_available=lambda: False)
            had_torch = sys.modules.get("torch")
            sys.modules["torch"] = had_torch or torch_stub
            try:
                self.assertIsNone(self.analyzer.get_predictor())
            finally:
                if had_torch is None:
                    sys.modules.pop("torch", None)
        self.assertIn("getaddrinfo failed", out.getvalue())

    def test_model_load_failure_falls_back_even_if_the_cause_cannot_be_read(self):
        self.analyze_with_fake()
        self.analyzer.predictor_instance = None

        class Failing:
            def __init__(self, *a, **k):
                raise ValueError("Could not load the checkpoint given the provided name", "final0")
        self.analyzer.Audio2Beats = Failing
        torch_stub = types.ModuleType("torch")
        torch_stub.cuda = types.SimpleNamespace(is_available=lambda: False)
        had_torch, had_check = sys.modules.get("torch"), sys.modules.get("model_check", "missing")
        sys.modules["torch"] = had_torch or torch_stub
        sys.modules["model_check"] = None                       # import fails inside the error handler
        try:
            self.assertIsNone(self.analyzer.get_predictor())    # no exception: the analysis falls back
        finally:
            if had_torch is None:
                sys.modules.pop("torch", None)
            if had_check == "missing":
                sys.modules.pop("model_check", None)
            else:
                sys.modules["model_check"] = had_check

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


    def test_beat_this_without_downbeats(self):
        result = self.analyze_with_fake(no_downbeats=True)
        self.assertEqual(result["timeSignature"], {"numerator": 4, "denominator": 4, "name": "4/4", "barShare": None})
        self.assertTrue(result["beats"][0]["isDownbeat"])
        self.assertEqual(result["beats"][0]["confidence"], 0.982)   # forced downbeat: beat probability

    def test_librosa_has_no_bar_share(self):
        self.assertIsNone(self.analyze_without_beat_this()["timeSignature"]["barShare"])

    def test_health_does_not_start_cuda(self):
        calls = []
        torch_stub = types.ModuleType("torch")
        torch_stub.cuda = types.SimpleNamespace(
            is_available=lambda: True, is_initialized=lambda: False,
            get_device_name=lambda i: calls.append(i) or "RTX Test")
        sys.modules["torch"] = torch_stub
        try:
            fake = types.ModuleType("beat_this.inference")
            fake.Audio2Beats = object
            analyzer = load_analyzer_with_fake_beat_this(fake)
            self.assertEqual(analyzer.engine_status(), {"id": "beat_this", "device": "cuda", "gpu": None,
                                                        "fallbackReason": None, "model": analyzer.MODELS["beat_this"]})
            self.assertEqual(calls, [])
            torch_stub.cuda.is_initialized = lambda: True
            self.assertEqual(analyzer.engine_status()["gpu"], "RTX Test")
        finally:
            sys.modules.pop("torch", None)

    def test_analysis_smooths_a_doubtful_bar(self):
        result = self.analyze_with_fake(extra_downbeat_at=1.5)   # extra doubtful downbeat (logit 0.5) at beat 2
        self.assertTrue(result["barSmoothing"]["applied"])
        self.assertEqual(result["barSmoothing"]["changedBeats"], 1)
        self.assertEqual(result["barSmoothing"]["meter"], 4)
        self.assertTrue(all(b["beatInBar"] == (i % 4) + 1 for i, b in enumerate(result["beats"])))
        self.assertEqual([b["barIndex"] for b in result["beats"][:9]], [1, 1, 1, 1, 2, 2, 2, 2, 3])
        self.assertLess(result["timeSignature"]["barShare"], 100)    # share before smoothing
        self.assertEqual(result["beats"][2]["confidence"], 0.982)    # no downbeat now: beat value
        self.assertEqual(result["totalBars"], len(result["downbeats"]))

    def test_analysis_without_smoothing_keeps_the_model(self):
        result = self.analyze_with_fake(extra_downbeat_at=1.5, smooth=False)
        self.assertFalse(result["barSmoothing"]["applied"])
        self.assertTrue(result["beats"][2]["isDownbeat"])            # beat at 1.5 s stays a downbeat

    def test_beat_numbers_count_on_after_a_short_bar(self):
        # a clear extra downbeat (logit 4) at 1.5 s: bars of 2 beats then 4; numbers must be 1 2 | 1 2 3 4
        # protect 0.85: the model's own downbeats (logit 2 = 0.88) stay too; with the default 0.95 the grid may
        # turn the first two beats into a pickup, which is not what this test is about
        result = self.analyze_with_fake(extra_downbeat_at=1.5, extra_logit=4.0, protect=0.85)
        self.assertEqual([b["beatInBar"] for b in result["beats"][:6]], [1, 2, 1, 2, 1, 2])
        self.assertTrue(result["beats"][2]["isDownbeat"])

    # --- second run on the same file: only the smoothing is computed again ----------------------------

    def test_second_run_on_same_file_skips_the_model(self):
        calls = {}
        first = self.analyze_with_fake(calls=calls, extra_downbeat_at=1.5, extra_logit=4.0)
        loose = self.analyzer.analyze_audio_file(self.wav, "click.wav", protect=1.0)
        self.assertEqual(self.analyzer.PROTECT_CONF, 0.95)                    # default: "Glätten" 90 %
        again = self.analyzer.analyze_audio_file(self.wav, "click.wav")
        self.assertEqual(calls["frames"], 1)                                  # beat_this ran once
        self.assertEqual(first["barSmoothing"]["protect"], 0.95)
        self.assertEqual(loose["barSmoothing"]["protect"], 1.0)
        self.assertNotEqual([b["isDownbeat"] for b in loose["beats"]], [b["isDownbeat"] for b in first["beats"]])
        self.assertEqual(again["beats"], first["beats"])                      # same value, same result

    def test_other_file_content_runs_the_model_again(self):
        calls = {}
        self.analyze_with_fake(calls=calls)
        write_click_track(self.wav, bpm=100)                                  # same name, other content
        self.analyzer.analyze_audio_file(self.wav, "click.wav")
        self.assertEqual(calls["frames"], 2)

    def test_failed_model_run_is_not_cached(self):
        calls = {}
        first = self.analyze_with_fake(calls=calls, frames_raise=RuntimeError("boom"))
        self.assertEqual(first["engineInfo"]["id"], "librosa")
        calls["stop_raising"] = True
        second = self.analyzer.analyze_audio_file(self.wav, "click.wav")
        self.assertEqual(second["engineInfo"]["id"], "beat_this")
        self.assertEqual(calls["frames"], 2)

    def test_cache_replaced_during_a_run_is_not_mixed(self):
        # two requests at once (ThreadingHTTPServer): another file's analysis finishes in the middle of this run
        calls = {}
        first = self.analyze_with_fake(calls=calls)
        analyzer = self.analyzer
        other = os.path.join(self.tmp, "other.wav")
        write_click_track(other, bpm=100)
        original = analyzer.engine_info
        state = {"done": False}

        def other_request_finishes(*a, **k):
            if not state["done"]:
                state["done"] = True
                real_run = analyzer.run_beat_this

                def other_beats(predictor, y, sr):                 # the other song has other beats
                    beats, downs, bp, dp = real_run(predictor, y, sr)
                    return [b + 0.1 for b in beats], [d + 0.1 for d in downs], bp, dp
                analyzer.run_beat_this = other_beats
                try:
                    analyzer.analyze_audio_file(other, "other.wav")
                finally:
                    analyzer.run_beat_this = real_run
            return original(*a, **k)
        analyzer.engine_info = other_request_finishes
        try:
            result = analyzer.analyze_audio_file(self.wav, "click.wav")
        finally:
            analyzer.engine_info = original
        self.assertTrue(state["done"])
        self.assertEqual(result["beats"], first["beats"])        # this file's cached data, not the other one's
        self.assertEqual(result["metadata"]["duration"], first["metadata"]["duration"])

    def test_librosa_is_not_smoothed(self):
        self.assertEqual(self.analyze_without_beat_this()["barSmoothing"],
                         {"applied": False, "meter": 4, "changedBeats": 0, "reanchors": 0, "protect": 0.95})

    # --- engineInfo --------------------------------------------------------------------------------

    def test_engine_info_without_beat_this(self):
        result = self.analyze_without_beat_this()
        self.assertEqual(result["engineInfo"],
                         {"id": "librosa", "device": None, "gpu": None, "fallbackReason": "not_installed",
                          "model": {"name": "librosa", "license": "ISC", "commercial": True}})
        self.assertEqual(self.analyzer.engine_status()["fallbackReason"], "not_installed")

    def test_engine_info_beat_this_on_cpu(self):
        result = self.analyze_with_fake()      # torch-Stub: cuda.is_available() -> False
        self.assertEqual(result["engineInfo"], {"id": "beat_this", "device": "cpu", "gpu": None, "fallbackReason": None,
                                                "model": {"name": "beat_this", "license": "MIT", "commercial": True}})
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
        self.assertEqual(self.analyzer.resolve_marker_data(result)["engine"]["model"]["license"], "MIT")
        del result["engineInfo"]
        self.assertNotIn("engine", self.analyzer.resolve_marker_data(result))


if __name__ == "__main__":
    unittest.main()
