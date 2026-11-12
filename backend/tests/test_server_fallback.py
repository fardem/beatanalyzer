"""backend/server.py when analyzer.py cannot be imported (e.g. a broken numpy in venv)."""

import importlib
import sys
import unittest
from pathlib import Path

BACKEND = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND))


class ServerFallbackTests(unittest.TestCase):
    def setUp(self):
        self.saved = {k: sys.modules.get(k) for k in ("analyzer", "server")}
        sys.modules["analyzer"] = None          # import analyzer -> ImportError
        sys.modules.pop("server", None)
        self.server = importlib.import_module("server")

    def tearDown(self):
        for k, v in self.saved.items():
            if v is None:
                sys.modules.pop(k, None)
            else:
                sys.modules[k] = v

    def test_analysis_reports_why_the_analyzer_is_missing(self):
        with self.assertRaises(RuntimeError) as ctx:
            self.server.analyze_audio_file("x.wav", "x.wav", smooth=True, protect=0.85)   # as handle_analyze calls it
        self.assertIn("analyzer", str(ctx.exception).lower())

    def test_health_names_the_broken_analyzer(self):
        info = self.server.engine_status()
        self.assertEqual(info["id"], "librosa")
        self.assertEqual(info["fallbackReason"], "analyzer_failed")
        self.assertTrue(self.server.ANALYZER_ERROR)


if __name__ == "__main__":
    unittest.main()
