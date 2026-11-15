"""Tests for backend/ffmpeg_utils.py and /api/settings ffmpegDir handling."""

import json
import os
import shutil
import stat
import sys
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from http.server import ThreadingHTTPServer
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import ffmpeg_utils  # noqa: E402
import resolve_plugin  # noqa: E402
import server  # noqa: E402
import settings  # noqa: E402


def create_fake_ffmpeg(folder: Path) -> Path:
    folder.mkdir(parents=True, exist_ok=True)
    exe = folder / ("ffmpeg.exe" if os.name == "nt" else "ffmpeg")
    if os.name == "nt":
        exe.write_text("@echo off\necho ffmpeg version fake\n", encoding="utf-8")
    else:
        exe.write_text("#!/bin/sh\necho 'ffmpeg version fake'\nexit 0\n", encoding="utf-8")
        exe.chmod(exe.stat().st_mode | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)
    return exe


class FfmpegUtilsTests(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        self.old_path = os.environ.get("PATH", "")

    def tearDown(self):
        os.environ["PATH"] = self.old_path

    def test_finds_ffmpeg_directly_or_in_bin_subfolder(self):
        root = self.tmp / "ff_pack"
        exe = create_fake_ffmpeg(root / "bin")
        found_exe, found_dir = ffmpeg_utils.find_ffmpeg_in_dir(str(root))
        self.assertEqual(found_exe, str(exe))
        self.assertEqual(found_dir, str(root / "bin"))

        # Quoted input from Explorer "Copy as path"
        found_exe2, found_dir2 = ffmpeg_utils.find_ffmpeg_in_dir(f'"{root / "bin"}"')
        self.assertEqual(found_exe2, str(exe))
        self.assertEqual(found_dir2, str(root / "bin"))

    def test_validate_and_apply_updates_process_path_and_resets(self):
        ff_dir = self.tmp / "custom_ff"
        exe = create_fake_ffmpeg(ff_dir)
        normalized, status = ffmpeg_utils.validate_and_resolve_ffmpeg_dir(str(ff_dir))
        self.assertEqual(normalized, str(ff_dir))
        self.assertTrue(status["available"])
        self.assertEqual(status["source"], "custom")
        self.assertEqual(status["path"], str(exe))
        self.assertEqual(shutil.which("ffmpeg"), str(exe))

        # Resetting clears custom directory from PATH
        cleared, reset_status = ffmpeg_utils.validate_and_resolve_ffmpeg_dir("")
        self.assertEqual(cleared, "")
        self.assertNotEqual(reset_status["source"], "custom")

    def test_missing_directory_raises_value_error(self):
        with self.assertRaises(ValueError):
            ffmpeg_utils.validate_and_resolve_ffmpeg_dir(str(self.tmp / "does_not_exist"))


class ServerFfmpegSettingsTests(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        self._settings_file = settings.SETTINGS_FILE
        settings.SETTINGS_FILE = self.tmp / "settings.json"
        self._scripts_dir = resolve_plugin.scripts_dir
        resolve_plugin.scripts_dir = lambda env=None, platform=None: self.tmp / "Resolve" / "Utility"
        self.old_path = os.environ.get("PATH", "")
        self.httpd = ThreadingHTTPServer(("127.0.0.1", 0), server.BeatThisRequestHandler)
        threading.Thread(target=self.httpd.serve_forever, daemon=True).start()
        self.base = f"http://127.0.0.1:{self.httpd.server_address[1]}"

    def tearDown(self):
        self.httpd.shutdown()
        self.httpd.server_close()
        settings.SETTINGS_FILE = self._settings_file
        resolve_plugin.scripts_dir = self._scripts_dir
        os.environ["PATH"] = self.old_path

    def request(self, path, body=None):
        data = json.dumps(body).encode("utf-8") if body is not None else None
        req = urllib.request.Request(
            self.base + path,
            data=data,
            method="POST" if data is not None else "GET",
            headers={"Content-Type": "application/json"},
        )
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                return resp.status, json.loads(resp.read())
        except urllib.error.HTTPError as err:
            return err.code, json.loads(err.read())

    def test_post_ffmpeg_dir_saves_and_exposes_in_health(self):
        ff_pack = self.tmp / "ffmpeg_bundle"
        exe = create_fake_ffmpeg(ff_pack / "bin")
        status, data = self.request("/api/settings", {"ffmpegDir": str(ff_pack)})
        self.assertEqual(status, 200)
        self.assertEqual(data["ffmpegDir"], str(ff_pack / "bin"))
        self.assertTrue(data["ffmpegAvailable"])
        self.assertEqual(data["ffmpegPath"], str(exe))
        self.assertEqual(data["ffmpegSource"], "custom")
        self.assertEqual(settings.load()["ffmpegDir"], str(ff_pack / "bin"))

        h_status, health = self.request("/api/health")
        self.assertEqual(h_status, 200)
        self.assertTrue(health["ffmpeg_available"])
        self.assertEqual(health["ffmpeg_path"], str(exe))
        self.assertEqual(health["ffmpeg_source"], "custom")

    def test_post_invalid_ffmpeg_dir_returns_400(self):
        empty_dir = self.tmp / "empty"
        empty_dir.mkdir()
        status, data = self.request("/api/settings", {"ffmpegDir": str(empty_dir)})
        self.assertEqual(status, 400)
        self.assertIn("ffmpeg", data["error"].lower())
        self.assertEqual(settings.load().get("ffmpegDir", ""), "")


if __name__ == "__main__":
    unittest.main()
