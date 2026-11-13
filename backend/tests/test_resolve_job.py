"""Tests for backend/resolve_job.py (analysis job started from the Resolve script)."""

import json
import os
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import resolve_job  # noqa: E402

RESULT = {
    "metadata": {"fileName": "Müller Song.mp3", "duration": 3.0},
    "globalBpm": 120.0,
    "timeSignature": {"numerator": 4, "denominator": 4, "name": "4/4", "barShare": 100},
    "beats": [{"time": 0.5 * i, "beatInBar": i % 4 + 1, "barIndex": i // 4 + 1, "isDownbeat": i % 4 == 0,
               "confidence": 0.9, "instantBpm": 120.0} for i in range(6)],
    "engineInfo": {"id": "beat_this", "device": "cpu", "gpu": None, "fallbackReason": None},
}


def read_kv(path):
    out = {}
    for line in Path(path).read_text(encoding="utf-8").splitlines():
        if "=" in line:
            k, v = line.split("=", 1)
            out[k.strip()] = v.strip()
    return out


class ResolveJobTests(unittest.TestCase):
    def setUp(self):
        self.dir = Path(tempfile.mkdtemp()) / "2026-11-13-0800-ä1"
        self.dir.mkdir()
        self.audio = self.dir.parent / "Şarkı – Müller.mp3"
        self.audio.write_bytes(b"x")
        self.calls = []

    def write_job(self, **extra):
        lines = ["format=beatanalyzer-resolve-job/1", f"audio={self.audio}", "lang=de"]
        lines += [f"{k}={v}" for k, v in extra.items()]
        (self.dir / "job.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")

    def fake(self, path, name, smooth=True, protect=0.95):
        self.calls.append((path, name, smooth, protect))
        return RESULT

    def test_ok_writes_markers_and_done(self):
        self.write_job(smooth=1, protect=0.95)
        self.assertEqual(resolve_job.run_job(str(self.dir), analyze=self.fake), "ok")
        done = read_kv(self.dir / "done.txt")
        self.assertEqual(done["state"], "ok")
        self.assertEqual(done["markers"], "markers.json")
        data = json.loads((self.dir / "markers.json").read_text(encoding="utf-8"))
        self.assertEqual(data["format"], "beatthis-resolve-markers/1")
        self.assertEqual(len(data["markers"]), 6)
        self.assertEqual(read_kv(self.dir / "progress.txt")["step"], "write")
        self.assertEqual(self.calls[0][0], str(self.audio))
        self.assertEqual(self.calls[0][1], "Şarkı – Müller.mp3")

    def test_passes_smooth_and_protect(self):
        self.write_job(smooth=0, protect=0.7)
        resolve_job.run_job(str(self.dir), analyze=self.fake)
        self.assertEqual(self.calls[0][2:], (False, 0.7))

    def test_default_is_smoothing_at_090(self):
        self.write_job()
        resolve_job.run_job(str(self.dir), analyze=self.fake)
        self.assertEqual(self.calls[0][2:], (True, 0.95))

    def test_error_writes_message(self):
        self.write_job()

        def boom(*a, **k):
            raise RuntimeError("kaputt")
        self.assertEqual(resolve_job.run_job(str(self.dir), analyze=boom), "error")
        done = read_kv(self.dir / "done.txt")
        self.assertEqual(done["state"], "error")
        self.assertIn("kaputt", done["message"])
        self.assertFalse((self.dir / "markers.json").exists())

    def test_cancel_before_analysis(self):
        self.write_job()
        (self.dir / "cancel.txt").write_text("", encoding="utf-8")
        self.assertEqual(resolve_job.run_job(str(self.dir), analyze=self.fake), "cancelled")
        self.assertEqual(read_kv(self.dir / "done.txt")["state"], "cancelled")
        self.assertEqual(self.calls, [])

    def test_cancel_after_analysis(self):
        self.write_job()

        def slow(*a, **k):
            (self.dir / "cancel.txt").write_text("", encoding="utf-8")
            return RESULT
        self.assertEqual(resolve_job.run_job(str(self.dir), analyze=slow), "cancelled")
        self.assertFalse((self.dir / "markers.json").exists())

    def test_done_is_written_atomically(self):
        self.write_job()
        resolve_job.run_job(str(self.dir), analyze=self.fake)
        self.assertEqual(sorted(p.name for p in self.dir.iterdir() if p.name.endswith(".tmp")), [])

    def test_bad_job_file(self):
        (self.dir / "job.txt").write_text("format=beatanalyzer-resolve-job/1\n", encoding="utf-8")
        self.assertEqual(resolve_job.run_job(str(self.dir), analyze=self.fake), "error")
        self.assertEqual(read_kv(self.dir / "done.txt")["state"], "error")

    def test_missing_audio_file(self):
        self.audio.unlink()
        self.write_job()
        self.assertEqual(resolve_job.run_job(str(self.dir), analyze=self.fake), "error")
        self.assertIn("Şarkı", read_kv(self.dir / "done.txt")["message"])

    def test_message_stays_on_one_line(self):
        self.write_job()

        def boom(*a, **k):
            raise RuntimeError("Zeile 1\nZeile 2")
        resolve_job.run_job(str(self.dir), analyze=boom)
        self.assertIn("Zeile 1 Zeile 2", read_kv(self.dir / "done.txt")["message"])


if __name__ == "__main__":
    unittest.main()
