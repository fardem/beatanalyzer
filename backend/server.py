"""
BeatAnalyzer Python Backend Server
Uses the built-in Python HTTP server (http.server.ThreadingHTTPServer):
no Pydantic/FastAPI dependencies, works with Python 3.9 to 3.13+
"""

import os
import re
import sys
import json
import tempfile
import mimetypes
import traceback
import threading
import webbrowser
from http.server import HTTPServer, ThreadingHTTPServer, BaseHTTPRequestHandler
from urllib.parse import parse_qs, unquote, urlparse

# add the folders to the module search path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
DIST_DIR = os.path.join(PROJECT_ROOT, "dist")
sys.path.insert(0, CURRENT_DIR)
sys.path.insert(0, PROJECT_ROOT)

# MIME types for the React frontend
mimetypes.init()
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("application/javascript", ".mjs")
mimetypes.add_type("text/css", ".css")
mimetypes.add_type("image/svg+xml", ".svg")
mimetypes.add_type("application/json", ".json")

# load the analyzer
ANALYZER_ERROR = ""   # why analyzer.py could not be loaded (e.g. a broken NumPy in venv)
try:
    from analyzer import (
        analyze_audio_file,
        engine_status,
        clamp_protect,
        normalize_model,
        ffmpeg_available,
        BEAT_THIS_AVAILABLE,
        MD_BEAT_THIS_AVAILABLE,
    )
except Exception as _err:   # the name of an except variable is deleted after the block: keep the text
    ANALYZER_ERROR = str(_err) or type(_err).__name__
    print("=" * 70)
    print(f"[ERROR] analyzer.py cannot be loaded: {ANALYZER_ERROR}")
    print("[ERROR] No analysis possible. Usually the venv is broken: close all BeatAnalyzer windows,")
    print("[ERROR] delete the folder venv and run install_and_run.bat again.")
    print("=" * 70)
    BEAT_THIS_AVAILABLE = False
    MD_BEAT_THIS_AVAILABLE = False

    def analyze_audio_file(p, f, smooth=True, protect=0.95, model="beat_this"):
        raise RuntimeError(f"Analyzer error (analyzer.py not loaded): {ANALYZER_ERROR}")

    def engine_status(model="beat_this"):
        return {"id": "librosa", "device": None, "gpu": None, "fallbackReason": "analyzer_failed", "model": None}

    def clamp_protect(value):
        return 0.95   # nothing is analysed anyway

    def normalize_model(value):
        return "md_beat_this" if value == "md_beat_this" else "beat_this"

    def ffmpeg_available():
        return False

import ffmpeg_utils
import i18n
import resolve_plugin
import settings
import updater

ffmpeg_utils.apply_ffmpeg_dir(settings.load().get("ffmpegDir"))


def settings_payload() -> dict:
    """Body of GET /api/settings: language settings and optional custom ffmpeg directory."""
    cfg = settings.load()
    language = cfg["language"]
    ffmpeg_dir = str(cfg.get("ffmpegDir") or "")
    ff = ffmpeg_utils.apply_ffmpeg_dir(ffmpeg_dir)
    return {
        "language": language,
        "resolvedLanguage": i18n.resolve_language(language),
        "languages": [{"code": code, "name": name} for code, name in i18n.available()],
        "ffmpegDir": ffmpeg_dir,
        "ffmpegAvailable": ff["available"],
        "ffmpegPath": ff["path"],
        "ffmpegSource": ff["source"],
    }

TEMP_DIR = tempfile.mkdtemp(prefix="beatthis_")


def read_app_version():
    try:
        with open(os.path.join(PROJECT_ROOT, "VERSION"), encoding="utf-8") as f:
            return f.read().strip()
    except OSError:
        return "unbekannt"


APP_VERSION = read_app_version()


MAX_UPLOAD_BYTES = 2 * 1024 ** 3   # 2 GB: a two-hour WAV fits; anything larger is refused before reading
LOOPBACK_HOSTS = ("localhost", "127.0.0.1", "[::1]")


class PayloadTooLargeError(Exception):
    pass


def request_allowed(origin, host) -> bool:
    """
    Only the web app of this server may change something. The server listens on 127.0.0.1, but any website open in
    the browser can still send requests to it; and a foreign name pointing to 127.0.0.1 (DNS rebinding) arrives
    with that name as Host. So: the Host must be a loopback name, and a request with an Origin (every browser POST)
    must come from exactly this host and port. No Origin = a local tool (curl, command line).
    """
    if not host:
        return False
    hostname = host.rsplit(":", 1)[0] if not host.endswith("]") else host
    if hostname not in LOOPBACK_HOSTS:
        return False
    if not origin:
        return True
    parsed = urlparse(origin)
    return parsed.scheme == "http" and parsed.netloc == host


def display_name(raw) -> str:
    """The song's file name as the user knows it (umlauts, spaces, brackets stay – Resolve finds the clip by it);
    only folder parts and control characters are dropped."""
    name = re.split(r"[\\/]", str(raw or ""))[-1]
    name = "".join(ch for ch in name if ch >= " " and ch != "\x7f").strip()[:255]
    return name or "audio"


def temp_upload_path(name: str) -> str:
    """A new, unique file in TEMP_DIR for an upload; from the name only a plain extension is taken over."""
    ext = os.path.splitext(display_name(name))[1].lower()
    if not re.fullmatch(r"\.[a-z0-9]{1,5}", ext):
        ext = ""
    fd, path = tempfile.mkstemp(dir=TEMP_DIR, prefix="track_", suffix=ext)
    os.close(fd)
    return path


def extract_uploaded_file(headers, rfile):
    """
    Multipart form-data parser without external dependencies.
    Works with Python 3.9 to 3.13. Refuses bodies larger than MAX_UPLOAD_BYTES before reading them.
    """
    try:
        content_length = int(headers.get('Content-Length', 0))
    except (ValueError, TypeError):
        return None, None

    if content_length <= 0:
        return None, None
    if content_length > MAX_UPLOAD_BYTES:
        raise PayloadTooLargeError("The file is larger than 2 GB.")

    content_type = headers.get('Content-Type', '')

    # raw binary body (no multipart)
    if 'boundary=' not in content_type:
        raw_body = rfile.read(content_length)
        return raw_body, "upload_audio.wav"

    # Multipart Boundary extrahieren
    boundary = content_type.split('boundary=')[1].strip()
    if boundary.startswith('"') and boundary.endswith('"'):
        boundary = boundary[1:-1]
    boundary_bytes = boundary.encode('utf-8')

    raw_data = rfile.read(content_length)
    parts = raw_data.split(b'--' + boundary_bytes)

    for part in parts:
        if b'Content-Disposition' in part and b'filename=' in part:
            header_end = part.find(b'\r\n\r\n')
            if header_end != -1:
                header_text = part[:header_end].decode('utf-8', errors='ignore')
                filename = "uploaded_track.mp3"
                for line in header_text.splitlines():
                    if 'filename=' in line:
                        fn_part = line.split('filename=')[1].strip()
                        if fn_part.startswith('"'):
                            filename = fn_part.split('"')[1]
                        else:
                            filename = fn_part.split(';')[0].strip()

                content = part[header_end + 4:]
                if content.endswith(b'\r\n'):
                    content = content[:-2]
                if content.endswith(b'--\r\n'):
                    content = content[:-4]
                return content, filename

    return None, None


# shown instead of the web app when dist/ is missing (a git checkout without "npm run build")
NOT_BUILT_HTML = """<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>BeatAnalyzer</title>
<style>body{font-family:system-ui,sans-serif;background:#020617;color:#e2e8f0;max-width:40rem;margin:4rem auto;padding:0 1rem}
code{background:#1e293b;padding:.1rem .35rem;border-radius:.25rem}</style></head>
<body><h1>BeatAnalyzer</h1>
<p>The web app is not built. Run <code>npm install</code> and <code>npm run build</code> in the BeatAnalyzer folder,
or get the release ZIP, which contains it. The analysis server itself is running.</p></body></html>"""


class BeatThisRequestHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # also called by send_error with a status code as first argument – only request lines are of interest
        if args and isinstance(args[0], str) and ("GET /api" in args[0] or "POST /api" in args[0]):
            print(f"[BeatAnalyzer Server] {self.address_string()} - {args[0]}")

    def send_cors_headers(self):
        # only the web app of this server (same origin) – never "*": any website could use the server otherwise
        origin = self.headers.get("Origin")
        if origin and request_allowed(origin, self.headers.get("Host")):
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def refuse_foreign(self) -> bool:
        """Answers 403 for a request from another website (or a foreign Host); True when refused."""
        if request_allowed(self.headers.get("Origin"), self.headers.get("Host")):
            return False
        self.send_error_json(403, "Request from another website refused.")
        return True

    def do_OPTIONS(self):
        if self.refuse_foreign():
            return
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()

    def do_GET(self):
        if self.refuse_foreign():   # a foreign Host (DNS rebinding) may not read anything
            return
        parsed = urlparse(self.path)
        path = parsed.path

        # 1. API Health Check
        if path == "/api/health":
            cuda_avail = False
            try:
                import torch
                cuda_avail = torch.cuda.is_available()
            except Exception:
                pass

            md_status = engine_status("md_beat_this")
            md_installed = md_status["id"] == "md_beat_this"
            cfg = settings.load()
            ffmpeg_dir = str(cfg.get("ffmpegDir") or "")
            ff = ffmpeg_utils.apply_ffmpeg_dir(ffmpeg_dir)
            response_data = {
                "status": "online",
                "beat_this_installed": BEAT_THIS_AVAILABLE,
                "md_beat_this_installed": md_installed,
                "ffmpeg_available": ff["available"],
                "ffmpeg_path": ff["path"],
                "ffmpeg_dir": ffmpeg_dir,
                "ffmpeg_source": ff["source"],
                "cuda_available": cuda_avail,
                "engine": "CPJKU beat_this Transformer" if BEAT_THIS_AVAILABLE else "Librosa MIR Fallback",
                "engineInfo": engine_status(),
                "models": {
                    "beat_this": engine_status("beat_this"),
                    "md_beat_this": md_status,
                },
                "version": APP_VERSION,
                "python_version": sys.version.split()[0]
            }
            body = json.dumps(response_data).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(body)
            return

        if path == "/api/resolve/status":
            self.send_json(200, resolve_plugin.status())
            return

        if path == "/api/settings":
            self.send_json(200, settings_payload())
            return

        if path == "/api/update/check":
            info = updater.check()
            info.pop("zip", None)
            self.send_json(200, info)
            return

        # 2. static frontend files (from dist/, if built)
        index_file = os.path.join(DIST_DIR, "index.html")
        if os.path.isdir(DIST_DIR) and os.path.exists(index_file):
            clean_path = unquote(path).lstrip("/")
            file_path = os.path.realpath(os.path.join(DIST_DIR, clean_path))
            inside = os.path.commonpath([file_path, os.path.realpath(DIST_DIR)]) == os.path.realpath(DIST_DIR)
            if clean_path and not inside:   # "/../" – never a file outside dist/
                self.send_error(404, "Not found")
                return

            if clean_path and os.path.exists(file_path) and os.path.isfile(file_path):
                self.serve_static_file(file_path)
                return

            self.serve_static_file(index_file)
            return

        # 3. the web app is not built
        body = NOT_BUILT_HTML.encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(body)

    def serve_static_file(self, file_path):
        mime_type, _ = mimetypes.guess_type(file_path)
        if not mime_type:
            mime_type = "application/octet-stream"
        if file_path.endswith(".js"):
            mime_type = "application/javascript; charset=utf-8"
        elif file_path.endswith(".css"):
            mime_type = "text/css; charset=utf-8"
        elif file_path.endswith(".html"):
            mime_type = "text/html; charset=utf-8"

        try:
            with open(file_path, "rb") as f:
                content = f.read()
            self.send_response(200)
            self.send_header("Content-Type", mime_type)
            self.send_header("Content-Length", str(len(content)))
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self.send_error(500, f"Error loading the file: {e}")

    def do_POST(self):
        if self.refuse_foreign():
            return
        parsed = urlparse(self.path)
        if parsed.path == "/api/analyze":
            self.handle_analyze()
        elif parsed.path == "/api/resolve/install":
            self.handle_resolve_install()
        elif parsed.path == "/api/update/apply":
            self.handle_update()
        elif parsed.path == "/api/settings":
            self.handle_settings()
        else:
            self.send_error(404, "Endpoint not found")

    def handle_analyze(self):
        try:
            try:
                file_bytes, filename = extract_uploaded_file(self.headers, self.rfile)
            except PayloadTooLargeError as err:
                self.close_connection = True   # the body was not read
                self.send_error_json(413, str(err))
                return
            if not file_bytes:
                self.send_error_json(400, "No valid audio file received.")
                return
            filename = display_name(filename)   # shown and exported as is; the temp file gets its own name

            print(f"[BeatAnalyzer Server] Analysing: {filename} ({len(file_bytes)} bytes)...")

            temp_path = temp_upload_path(filename)
            with open(temp_path, "wb") as f_out:
                f_out.write(file_bytes)

            try:
                query = parse_qs(urlparse(self.path).query)
                smooth = query.get("smoothBars", ["1"])[0] != "0"
                protect = clamp_protect(query.get("protect", [None])[0])
                model = normalize_model(query.get("model", ["beat_this"])[0])
                if model != "beat_this":
                    result = analyze_audio_file(temp_path, filename, smooth=smooth, protect=protect, model=model)
                else:
                    result = analyze_audio_file(temp_path, filename, smooth=smooth, protect=protect)
                body = json.dumps(result).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Content-Length", str(len(body)))
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(body)
                print(f"[BeatAnalyzer Server] Analysis done: {filename} ({result.get('globalBpm')} BPM)")
            finally:
                if os.path.exists(temp_path):
                    try:
                        os.remove(temp_path)
                    except Exception:
                        pass
        except Exception as e:
            traceback.print_exc()
            self.send_error_json(500, f"Audio analysis failed: {str(e)}")

    def handle_resolve_install(self):
        try:
            target = resolve_plugin.install()
            print(f"[BeatAnalyzer Server] Resolve script installed: {target}")
            self.send_json(200, resolve_plugin.status())
        except Exception as e:
            traceback.print_exc()
            self.send_error_json(500, f"Installation failed: {e}")

    def handle_update(self):
        try:
            result = updater.update()
            self.send_json(200, {"updated": result["updated"], "version": result["version"],
                                 "message": result["message"]})
        except updater.UpdateError as e:
            self.send_error_json(409, str(e))
        except Exception as e:
            traceback.print_exc()
            self.send_error_json(500, f"Update failed: {e}")

    def handle_settings(self):
        """POST {"language"?: ..., "ffmpegDir"?: ...}: validate, persist, and apply settings."""
        try:
            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length).decode("utf-8") or "{}")
            if not isinstance(body, dict) or ("language" not in body and "ffmpegDir" not in body):
                raise ValueError('Expected: {"language": "auto" | "en" | "de" | "tr"} or {"ffmpegDir": "..."}')

            if "language" in body and str(body["language"]) not in settings.LANGUAGE_CHOICES:
                raise ValueError(f"Unknown language: {body['language']!r} (allowed: {', '.join(settings.LANGUAGE_CHOICES)})")

            if "ffmpegDir" in body:
                normalized_dir, _ = ffmpeg_utils.validate_and_resolve_ffmpeg_dir(body["ffmpegDir"])
                settings.save({"ffmpegDir": normalized_dir})

            plugin_updated = False
            if "language" in body:
                result = resolve_plugin.set_language(str(body["language"]))
                plugin_updated = bool(result.get("pluginUpdated"))
        except ValueError as e:   # json.JSONDecodeError is a ValueError
            self.send_error_json(400, str(e))
            return
        except Exception as e:
            traceback.print_exc()
            self.send_error_json(500, f"Settings not saved: {e}")
            return
        self.send_json(200, {**settings_payload(), "pluginUpdated": plugin_updated})

    def send_json(self, status_code, data):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(body)

    def send_error_json(self, status_code, message):
        body = json.dumps({"error": message, "detail": message}).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(body)


def open_browser(url):
    try:
        webbrowser.open(url)
    except Exception as err:   # no browser (e.g. a server without desktop): the URL is in the banner
        print(f"Browser not opened: {err}")


def main():
    port = int(os.environ.get("PORT", 8000))
    server_address = ("127.0.0.1", port)
    
    ServerClass = ThreadingHTTPServer if hasattr(sys.modules['http.server'], 'ThreadingHTTPServer') else HTTPServer
    httpd = ServerClass(server_address, BeatThisRequestHandler)

    print("======================================================================")
    print("      BeatAnalyzer - local analysis server started")
    print("======================================================================")
    print(f" URL:            http://localhost:{port}")
    print(f" Version:        {APP_VERSION}")
    print(f" Python Version: {sys.version.split()[0]}")
    if ANALYZER_ERROR:
        print(" Analysis:       NOT POSSIBLE - analyzer.py not loaded (see above)")
    elif BEAT_THIS_AVAILABLE:
        print(" Analysis:       CPJKU beat_this")
        torch = sys.modules.get("torch")   # loaded with beat_this; torch.version.cuda does not start CUDA
        if torch is not None:
            cuda = getattr(torch.version, "cuda", None)
            build = f"CUDA {cuda} build" if cuda else "CPU build - for GPU speed run install_and_run.bat again"
            print(f" PyTorch:        {torch.__version__} ({build})")
    else:
        print(" Analysis:       librosa - beat_this is NOT installed (run install_and_run.bat again)")
    print("======================================================================")
    print(" Server running. Press CTRL + C to stop.")
    print("======================================================================")

    try:
        path = resolve_plugin.status()["path"]
        if resolve_plugin.ensure_current():
            print(f"[Resolve] Script adapted to language and folder: {path}")
    except Exception as err:
        print(f"[Resolve] Script not adapted: {err}")

    # --open-browser (start.bat, install_and_run): open the web app only now that the server listens. Before, the
    # scripts opened the browser at once and it showed an empty page while torch and the model were loading.
    if "--open-browser" in sys.argv[1:]:
        url = f"http://localhost:{port}"
        threading.Thread(target=open_browser, args=(url,), daemon=True).start()

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down the server...")
    finally:
        httpd.server_close()
        print("Server stopped.")


if __name__ == "__main__":
    main()
