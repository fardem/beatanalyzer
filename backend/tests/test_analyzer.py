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

    def test_beat_this_gets_decoded_signal_not_file_path(self):
        calls = {}

        class FakeAudio2Beats:
            def __init__(self, checkpoint_path="final0", device="cpu", float16=False, dbn=False):
                calls["init"] = dict(checkpoint_path=checkpoint_path, device=device)

            def __call__(self, signal, sr):
                calls["signal"] = signal
                calls["sr"] = sr
                beats = np.arange(0.5, 12.0, 0.5)
                return beats, beats[::4]

        class ExplodingFile2Beats(FakeAudio2Beats):
            def __call__(self, audio_path):
                raise AssertionError("File2Beats darf nicht benutzt werden (torchaudio/FFmpeg-Abhaengigkeit)")

        fake = types.ModuleType("beat_this.inference")
        fake.Audio2Beats = FakeAudio2Beats
        fake.File2Beats = ExplodingFile2Beats

        torch_stub_needed = "torch" not in sys.modules
        if torch_stub_needed:
            torch_stub = types.ModuleType("torch")
            torch_stub.cuda = types.SimpleNamespace(is_available=lambda: False)
            sys.modules["torch"] = torch_stub
        try:
            analyzer = load_analyzer_with_fake_beat_this(fake)
            self.assertTrue(analyzer.BEAT_THIS_AVAILABLE)
            result = analyzer.analyze_audio_file(self.wav, "click.wav")
        finally:
            if torch_stub_needed:
                sys.modules.pop("torch", None)

        self.assertEqual(result["engine"], "CPJKU beat_this Transformer")
        self.assertEqual(calls["init"]["checkpoint_path"], "final0")
        self.assertIsInstance(calls["signal"], np.ndarray)
        self.assertEqual(calls["signal"].ndim, 1)
        self.assertGreater(calls["sr"], 0)
        self.assertEqual(result["totalBeats"], 23)
        self.assertAlmostEqual(result["globalBpm"], 120.0, delta=0.5)


if __name__ == "__main__":
    unittest.main()
