"""Tests for backend/model_check.py (load the beat_this model once, say why if that fails)."""

import os
import sys
import unittest
import urllib.error

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import model_check  # noqa: E402


def beat_this_style_failure():
    """As beat_this.inference.load_checkpoint does: any download error becomes a ValueError without cause."""
    try:
        raise urllib.error.URLError("[Errno 11001] getaddrinfo failed")
    except Exception:
        raise ValueError("Could not load the checkpoint given the provided name", "final0")


class ModelCheckTests(unittest.TestCase):
    def test_ok(self):
        ok, text = model_check.check(load=lambda: {"state_dict": {}})
        self.assertTrue(ok)
        self.assertIn("final0", text)

    def test_failure_shows_the_real_cause_and_where_the_file_goes(self):
        ok, text = model_check.check(load=beat_this_style_failure)
        self.assertFalse(ok)
        self.assertIn("getaddrinfo failed", text)                       # the cause beat_this hides
        self.assertIn("beat_this-final0.ckpt", text)
        self.assertIn("checkpoints", text)                              # the cache folder
        self.assertIn("https://cloud.cp.jku.at/public.php/dav/files/7ik4RrBKTS273gp/final0.ckpt", text)

    def test_cause_of_walks_to_the_innermost_error(self):
        try:
            beat_this_style_failure()
        except ValueError as e:
            self.assertIn("URLError", model_check.cause_of(e))

    def test_without_beat_this(self):
        def missing():
            raise ModuleNotFoundError("No module named 'beat_this'")
        ok, text = model_check.check(load=missing)
        self.assertFalse(ok)
        self.assertIn("No module named 'beat_this'", text)

    def test_main_exit_code(self):
        self.assertEqual(model_check.main(load=lambda: {}), 0)
        self.assertEqual(model_check.main(load=beat_this_style_failure), 1)


if __name__ == "__main__":
    unittest.main()
