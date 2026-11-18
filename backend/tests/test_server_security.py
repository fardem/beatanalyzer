"""Security of the local server: requests from other websites, upload names, temp files, size limit."""

import json
import os
import sys
import threading
import unittest
import urllib.error
import urllib.request
from http.server import ThreadingHTTPServer
from pathlib import Path
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import server  # noqa: E402


class TestRequestAllowed(unittest.TestCase):
    def test_same_origin_localhost(self):
        self.assertTrue(server.request_allowed("http://localhost:8000", "localhost:8000"))
        self.assertTrue(server.request_allowed("http://127.0.0.1:8000", "127.0.0.1:8000"))
        self.assertTrue(server.request_allowed("http://[::1]:8000", "[::1]:8000"))

    def test_no_origin_is_a_local_tool(self):          # curl, command line, same-origin GET
        self.assertTrue(server.request_allowed(None, "localhost:8000"))
        self.assertTrue(server.request_allowed("", "127.0.0.1:8000"))

    def test_foreign_website_refused(self):
        self.assertFalse(server.request_allowed("https://evil.example", "localhost:8000"))
        self.assertFalse(server.request_allowed("http://localhost:3000", "localhost:8000"))
        self.assertFalse(server.request_allowed("null", "localhost:8000"))

    def test_dns_rebinding_refused(self):              # the Host must be a loopback name
        self.assertFalse(server.request_allowed(None, "evil.example:8000"))
        self.assertFalse(server.request_allowed("http://evil.example:8000", "evil.example:8000"))
        self.assertFalse(server.request_allowed(None, None))


class TestUploadNames(unittest.TestCase):
    def test_display_name_keeps_unicode_and_spaces(self):
        self.assertEqual(server.display_name("Küçük Sevgilim (Remix).mp3"), "Küçük Sevgilim (Remix).mp3")

    def test_display_name_drops_path_parts(self):
        self.assertEqual(server.display_name("..\\..\\Startup\\evil.bat"), "evil.bat")
        self.assertEqual(server.display_name("../../etc/x.wav"), "x.wav")
        self.assertEqual(server.display_name(""), "audio")
        self.assertEqual(server.display_name("a\x00b\n.wav"), "ab.wav")

    def test_temp_path_stays_in_temp_dir_and_is_unique(self):
        a = server.temp_upload_path("..\\..\\evil.bat")
        b = server.temp_upload_path("song.MP3")
        c = server.temp_upload_path("song.mp3")
        try:
            for p in (a, b, c):
                self.assertEqual(os.path.dirname(os.path.abspath(p)), os.path.abspath(server.TEMP_DIR))
            self.assertTrue(b.endswith(".mp3"))
            self.assertNotEqual(b, c)
            self.assertFalse(server.temp_upload_path("x.weird-ext!").endswith("!"))
        finally:
            for p in (a, b, c):
                if os.path.exists(p):
                    os.remove(p)


class TestAnalyzeEndpoint(unittest.TestCase):
    def setUp(self):
        self.httpd = ThreadingHTTPServer(("127.0.0.1", 0), server.BeatThisRequestHandler)
        threading.Thread(target=self.httpd.serve_forever, daemon=True).start()
        self.port = self.httpd.server_address[1]

    def tearDown(self):
        self.httpd.shutdown()
        self.httpd.server_close()

    def post(self, filename, origin=None, length=None, path="/api/analyze"):
        boundary = "XyZ"
        body = (f"--{boundary}\r\nContent-Disposition: form-data; name=\"audio\"; filename=\"{filename}\"\r\n"
                f"Content-Type: audio/wav\r\n\r\n").encode("utf-8") + b"RIFFdata" + f"\r\n--{boundary}--\r\n".encode()
        headers = {"Content-Type": f"multipart/form-data; boundary={boundary}"}
        if origin:
            headers["Origin"] = origin
        req = urllib.request.Request(f"http://127.0.0.1:{self.port}{path}", data=body, method="POST", headers=headers)
        if length is not None:
            req.add_unredirected_header("Content-Length", str(length))
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                return resp.status, json.loads(resp.read())
        except urllib.error.HTTPError as err:
            return err.code, json.loads(err.read() or b"{}")

    def test_song_name_unchanged(self):
        seen = {}

        def fake(path, name, **kw):
            seen["path"] = path
            return {"metadata": {"fileName": name}, "globalBpm": 120}

        with mock.patch.object(server, "analyze_audio_file", fake, create=True):
            status, data = self.post("Küçük Sevgilim (Remix).wav", origin=f"http://127.0.0.1:{self.port}")
        self.assertEqual(status, 200)
        self.assertEqual(data["metadata"]["fileName"], "Küçük Sevgilim (Remix).wav")
        self.assertEqual(os.path.dirname(seen["path"]), os.path.abspath(server.TEMP_DIR))

    def test_other_website_refused(self):
        for path in ("/api/analyze", "/api/update/apply", "/api/resolve/install", "/api/settings"):
            status, _ = self.post("a.wav", origin="https://evil.example", path=path)
            self.assertEqual(status, 403, path)

    def test_too_large_refused(self):
        with mock.patch.object(server, "MAX_UPLOAD_BYTES", 10):
            status, data = self.post("a.wav", origin=f"http://127.0.0.1:{self.port}")
        self.assertEqual(status, 413)
        self.assertIn("larger", data.get("error", ""))


if __name__ == "__main__":
    unittest.main()
