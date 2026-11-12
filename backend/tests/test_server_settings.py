"""Tests for /api/settings and /api/health of backend/server.py over a real HTTP connection."""

import json
import sys
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from http.server import ThreadingHTTPServer
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import resolve_plugin  # noqa: E402
import server  # noqa: E402
import settings  # noqa: E402


class ServerSettingsTests(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        self._settings_file = settings.SETTINGS_FILE
        settings.SETTINGS_FILE = self.tmp / "settings.json"
        self.env = {"APPDATA": str(self.tmp / "AppData"), "ProgramFiles": str(self.tmp / "Programs")}
        # the server writes the Resolve script with the default folder: keep it out of the real Resolve folder
        self._scripts_dir = resolve_plugin.scripts_dir
        resolve_plugin.scripts_dir = lambda env=None, platform=None: self.tmp / "Resolve" / "Utility"
        self.httpd = ThreadingHTTPServer(("127.0.0.1", 0), server.BeatThisRequestHandler)
        threading.Thread(target=self.httpd.serve_forever, daemon=True).start()
        self.base = f"http://127.0.0.1:{self.httpd.server_address[1]}"

    def tearDown(self):
        self.httpd.shutdown()
        self.httpd.server_close()
        settings.SETTINGS_FILE = self._settings_file
        resolve_plugin.scripts_dir = self._scripts_dir

    def request(self, path, body=None):
        data = json.dumps(body).encode("utf-8") if body is not None else None
        req = urllib.request.Request(self.base + path, data=data, method="POST" if data else "GET",
                                     headers={"Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                return resp.status, json.loads(resp.read())
        except urllib.error.HTTPError as err:
            return err.code, json.loads(err.read())

    def test_get_settings(self):
        status, data = self.request("/api/settings")
        self.assertEqual(status, 200)
        self.assertEqual(data["language"], "auto")
        self.assertIn(data["resolvedLanguage"], ("en", "de", "tr"))
        self.assertEqual(data["languages"], [{"code": "en", "name": "English"}, {"code": "de", "name": "Deutsch"},
                                             {"code": "tr", "name": "Türkçe"}])

    def test_post_language(self):
        status, data = self.request("/api/settings", {"language": "tr"})
        self.assertEqual(status, 200)
        self.assertEqual((data["language"], data["resolvedLanguage"]), ("tr", "tr"))
        self.assertIn("pluginUpdated", data)
        self.assertEqual(settings.load()["language"], "tr")

    def test_post_language_touches_only_the_test_resolve_folder(self):
        target = resolve_plugin.install(env=self.env)
        self.assertTrue(str(target).startswith(str(self.tmp)), target)   # never the real Resolve folder
        status, data = self.request("/api/settings", {"language": "tr"})
        self.assertTrue(data["pluginUpdated"])
        self.assertIn('lang = "tr"', target.read_text(encoding="utf-8"))

    def test_post_invalid_language(self):
        status, data = self.request("/api/settings", {"language": "xx"})
        self.assertEqual(status, 400)
        self.assertIn("xx", data["error"])
        self.assertEqual(settings.load()["language"], "auto")

    def test_post_broken_body(self):
        req = urllib.request.Request(self.base + "/api/settings", data=b"{kaputt", method="POST")
        with self.assertRaises(urllib.error.HTTPError) as ctx:
            urllib.request.urlopen(req, timeout=10)
        self.assertEqual(ctx.exception.code, 400)

    def post_audio(self, query=""):
        boundary = "BeatAnalyzerTest"
        body = (f"--{boundary}\r\nContent-Disposition: form-data; name=\"audio\"; filename=\"a.wav\"\r\n"
                f"Content-Type: audio/wav\r\n\r\n").encode() + b"RIFF0000" + f"\r\n--{boundary}--\r\n".encode()
        req = urllib.request.Request(self.base + "/api/analyze" + query, data=body, method="POST",
                                     headers={"Content-Type": f"multipart/form-data; boundary={boundary}"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status

    def test_analyze_passes_smooth_bars(self):
        calls = []
        original = server.analyze_audio_file
        server.analyze_audio_file = lambda p, f, smooth=True, protect=0.85: calls.append((smooth, protect)) or {"ok": 1}
        try:
            self.post_audio()
            self.post_audio("?smoothBars=0")
            self.post_audio("?protect=0.9")
            self.post_audio("?protect=abc")
            self.post_audio("?protect=5")
        finally:
            server.analyze_audio_file = original
        self.assertEqual(calls, [(True, 0.85), (False, 0.85), (True, 0.9), (True, 0.85), (True, 1.0)])

    def test_health_has_engine_info(self):
        status, data = self.request("/api/health")
        self.assertEqual(status, 200)
        self.assertEqual(set(data["engineInfo"]), {"id", "device", "gpu", "fallbackReason"})


if __name__ == "__main__":
    unittest.main()
