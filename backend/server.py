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
from urllib.parse import parse_qs, urlparse

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


# self-contained fallback page (works even when dist/ was not built)
STANDALONE_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BeatAnalyzer - CPJKU beat_this Audio Analyzer</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        body { background: #030712; color: #f8fafc; min-height: 100vh; padding: 20px; }
        .container { max-width: 1100px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }
        header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 16px; border-bottom: 1px solid #1e293b; }
        .logo { display: flex; align-items: center; gap: 12px; }
        .logo-icon { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #06b6d4, #6366f1); display: flex; align-items: center; justify-content: center; font-size: 20px; }
        .logo h1 { font-size: 1.25rem; font-weight: 800; color: #fff; }
        .logo span { font-size: 0.75rem; color: #38bdf8; background: #082f49; padding: 2px 8px; border-radius: 9999px; border: 1px solid #0369a1; }
        .badge-engine { font-size: 0.75rem; color: #a5b4fc; background: #1e1b4b; padding: 4px 10px; border-radius: 6px; border: 1px solid #3730a3; }
        .dropzone { border: 2px dashed #334155; border-radius: 16px; padding: 40px 20px; text-align: center; background: #0b1120; cursor: pointer; transition: all 0.2s; }
        .dropzone:hover, .dropzone.dragover { border-color: #38bdf8; background: #0c192e; }
        .dropzone h3 { font-size: 1.1rem; color: #fff; margin-bottom: 6px; }
        .dropzone p { font-size: 0.85rem; color: #94a3b8; }
        .formats { display: flex; justify-content: center; gap: 8px; margin-top: 14px; }
        .format-tag { font-size: 0.7rem; font-weight: 700; color: #cbd5e1; background: #1e293b; padding: 3px 8px; border-radius: 4px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; }
        .metric-card { background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 14px; }
        .metric-card .title { font-size: 0.75rem; color: #94a3b8; margin-bottom: 4px; }
        .metric-card .val { font-size: 1.6rem; font-weight: 800; color: #fff; }
        .metric-card .sub { font-size: 0.75rem; color: #38bdf8; margin-top: 2px; }
        .canvas-card { background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 16px; position: relative; }
        canvas { width: 100%; height: 180px; display: block; border-radius: 8px; background: #020617; cursor: crosshair; }
        .player-bar { background: #0f172a; border: 1px solid #1e293b; border-radius: 14px; padding: 14px 20px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 14px; }
        .controls { display: flex; align-items: center; gap: 10px; }
        .btn-play { width: 44px; height: 44px; border-radius: 12px; border: none; background: linear-gradient(135deg, #06b6d4, #6366f1); color: #fff; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.1s; }
        .btn-play:active { transform: scale(0.95); }
        .btn-action { padding: 6px 12px; background: #1e293b; border: 1px solid #334155; color: #cbd5e1; border-radius: 8px; font-size: 0.8rem; cursor: pointer; }
        .btn-action:hover { background: #334155; color: #fff; }
        .beat-led { display: flex; align-items: center; gap: 8px; background: #020617; padding: 6px 14px; border-radius: 10px; border: 1px solid #1e293b; font-size: 0.85rem; font-weight: 700; font-mono: monospace; }
        .led-dot { width: 10px; height: 10px; border-radius: 50%; background: #334155; transition: background 0.05s; }
        .led-dot.flash-beat { background: #38bdf8; box-shadow: 0 0 10px #38bdf8; }
        .led-dot.flash-down { background: #f43f5e; box-shadow: 0 0 12px #f43f5e; }
        .export-card { background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 18px; }
        .export-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .export-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
        .export-box { background: #020617; border: 1px solid #1e293b; border-radius: 10px; padding: 12px; display: flex; flex-direction: column; justify-content: space-between; gap: 10px; }
        .export-box h4 { font-size: 0.85rem; color: #fff; display: flex; align-items: center; gap: 6px; }
        .export-box p { font-size: 0.75rem; color: #94a3b8; }
        .btn-dl { background: linear-gradient(135deg, #e11d48, #6366f1); border: none; color: #fff; padding: 8px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; cursor: pointer; text-align: center; }
        .btn-dl-cyan { background: linear-gradient(135deg, #0284c7, #2563eb); }
        .hidden { display: none !important; }
        .spinner { border: 3px solid #1e293b; border-top-color: #38bdf8; border-radius: 50%; width: 28px; height: 28px; animation: spin 0.8s linear infinite; margin: 0 auto 10px auto; }
        @keyframes spin { to { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <div class="logo">
                <div class="logo-icon">🎵</div>
                <div>
                    <h1>BeatAnalyzer <span>CPJKU Transformer</span></h1>
                </div>
            </div>
            <div class="badge-engine" id="engineBadge">Python server active</div>
        </header>

        <!-- Dropzone -->
        <div class="dropzone" id="dropzone">
            <input type="file" id="fileInput" accept=".mp3,.wav,.aac,.flac,.ogg,.m4a,audio/*" style="display:none">
            <div id="dropPrompt">
                <div style="font-size: 32px; margin-bottom: 8px;">📂</div>
                <h3>Drop a music file here or click</h3>
                <p>Supports MP3, WAV, AAC and FLAC for beat and downbeat detection</p>
                <div class="formats">
                    <span class="format-tag">MP3</span>
                    <span class="format-tag">WAV</span>
                    <span class="format-tag">AAC / M4A</span>
                    <span class="format-tag">FLAC</span>
                </div>
            </div>
            <div id="loadingState" class="hidden">
                <div class="spinner"></div>
                <h3 id="loadingText">Analysing the audio file...</h3>
                <p>CPJKU beat_this computes beats and downbeats...</p>
            </div>
        </div>

        <!-- analysis results (visible after the upload) -->
        <div id="resultsView" class="hidden" style="display:flex; flex-direction:column; gap:20px;">
            <!-- Metrics -->
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="title">Tempo</div>
                    <div class="val" id="valBpm">--</div>
                    <div class="sub">BPM (Beats per Minute)</div>
                </div>
                <div class="metric-card">
                    <div class="title">Time signature</div>
                    <div class="val" id="valMeter">4/4</div>
                    <div class="sub" id="valMeterName">Common Time</div>
                </div>
                <div class="metric-card">
                    <div class="title">Bars</div>
                    <div class="val" id="valBars" style="color:#f43f5e;">--</div>
                    <div class="sub" id="valTotalBeats">-- beats in total</div>
                </div>
                <div class="metric-card">
                    <div class="title">Tempo stability</div>
                    <div class="val" id="valStability">--%</div>
                    <div class="sub">steadiness</div>
                </div>
                <div class="metric-card">
                    <div class="title">Audio file</div>
                    <div class="val" id="valDuration" style="font-size:1.3rem;">--</div>
                    <div class="sub" id="valFormat">AUDIO</div>
                </div>
            </div>

            <!-- Waveform Canvas -->
            <div class="canvas-card">
                <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:0.75rem; color:#94a3b8;">
                    <span>Waveform & beat grid (red = downbeat, cyan = beats)</span>
                    <span id="hoverTime">00:00.0</span>
                </div>
                <canvas id="waveCanvas"></canvas>
            </div>

            <!-- Player Bar -->
            <div class="player-bar">
                <div class="controls">
                    <button class="btn-play" id="btnPlay">▶</button>
                    <button class="btn-action" id="btnRewind">↺ 0s</button>
                    <span id="timeDisplay" style="font-family:monospace; font-size:0.85rem; color:#cbd5e1;">00:00 / 00:00</span>
                </div>

                <div class="beat-led">
                    <div class="led-dot" id="ledDot"></div>
                    <span id="ledLabel">Ready</span>
                </div>

                <div style="display:flex; align-items:center; gap:8px; font-size:0.8rem; color:#94a3b8;">
                    <label><input type="checkbox" id="chkMetronome" checked> Metronome click</label>
                    <input type="range" id="volMetronome" min="0" max="1" step="0.05" value="0.7" style="width:70px;">
                </div>
            </div>

            <!-- DaVinci Resolve & DAW Export Panel -->
            <div class="export-card">
                <div class="export-header">
                    <div>
                        <h3 style="font-size:1rem; color:#fff; display:flex; align-items:center; gap:8px;">
                            🎬 Export for DaVinci Resolve & DAWs
                        </h3>
                        <p style="font-size:0.75rem; color:#94a3b8;">Markers on the clip in the Media Pool</p>
                    </div>
                </div>

                <div class="export-grid">
                    <!-- DaVinci Resolve marker JSON -->
                    <div class="export-box" style="border-color:#be123c;">
                        <div>
                            <h4><span style="color:#f43f5e;">🔴</span> DaVinci Resolve Marker (JSON)</h4>
                            <p>For the script <em>BeatAnalyzer_Markers.lua</em>: select the clip in the Media Pool, then <em>Workspace → Scripts → BeatAnalyzer_Markers</em>.</p>
                        </div>
                        <button class="btn-dl" id="btnDlResolve">Resolve marker JSON (.json)</button>
                    </div>

                    <!-- Audacity Labels -->
                    <div class="export-box">
                        <div>
                            <h4>📄 Audacity label track</h4>
                            <p>In Audacity: <em>File → Import → Labels</em>.</p>
                        </div>
                        <button class="btn-dl btn-dl-cyan" id="btnDlAudacity">Audacity Labels (.txt)</button>
                    </div>

                    <!-- JSON -->
                    <div class="export-box">
                        <div>
                            <h4>💻 CPJKU beat_this JSON</h4>
                            <p>All beats, downbeats and BPM.</p>
                        </div>
                        <button class="btn-dl btn-dl-cyan" id="btnDlJson">JSON data (.json)</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        let currentResult = null;
        let audioContext = null;
        let audioBuffer = null;
        let sourceNode = null;
        let isPlaying = false;
        let startTime = 0;
        let pauseOffset = 0;
        let animId = null;
        let nextBeatIdx = 0;

        const dropzone = document.getElementById('dropzone');
        const fileInput = document.getElementById('fileInput');
        const dropPrompt = document.getElementById('dropPrompt');
        const loadingState = document.getElementById('loadingState');
        const resultsView = document.getElementById('resultsView');
        const canvas = document.getElementById('waveCanvas');
        const ctx = canvas.getContext('2d');

        // Drag & Drop
        dropzone.onclick = () => fileInput.click();
        dropzone.ondragover = (e) => { e.preventDefault(); dropzone.classList.add('dragover'); };
        dropzone.ondragleave = () => dropzone.classList.remove('dragover');
        dropzone.ondrop = (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
        };
        fileInput.onchange = (e) => { if (e.target.files.length) handleFile(e.target.files[0]); };

        async function handleFile(file) {
            dropPrompt.classList.add('hidden');
            loadingState.classList.remove('hidden');

            try {
                // Sende an lokalen Python Backend Server
                const formData = new FormData();
                formData.append('audio', file, file.name);

                const res = await fetch('/api/analyze', { method: 'POST', body: formData });
                if (!res.ok) throw new Error("Server analysis error: " + res.statusText);
                currentResult = await res.json();

                // decode the audio in the browser for the player
                if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const arrayBuf = await file.arrayBuffer();
                audioBuffer = await audioContext.decodeAudioData(arrayBuf);

                displayResults(currentResult);
            } catch (err) {
                alert("Analysis failed: " + err.message);
                dropPrompt.classList.remove('hidden');
                loadingState.classList.add('hidden');
            }
        }

        function displayResults(data) {
            loadingState.classList.add('hidden');
            resultsView.classList.remove('hidden');

            document.getElementById('valBpm').innerText = data.globalBpm.toFixed(1);
            document.getElementById('valMeter').innerText = data.timeSignature.numerator + "/" + data.timeSignature.denominator;
            document.getElementById('valMeterName').innerText = data.timeSignature.name;
            document.getElementById('valBars').innerText = data.totalBars;
            document.getElementById('valTotalBeats').innerText = data.totalBeats + " beats in total";
            document.getElementById('valStability').innerText = data.tempoStability + "%";

            const dur = data.metadata.duration;
            const m = Math.floor(dur / 60);
            const s = Math.floor(dur % 60);
            document.getElementById('valDuration').innerText = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
            document.getElementById('valFormat').innerText = data.metadata.format;
            document.getElementById('engineBadge').innerText = data.engine || "CPJKU beat_this aktiv";

            resizeCanvas();
            drawWaveform();
        }

        function resizeCanvas() {
            canvas.width = canvas.parentElement.clientWidth * window.devicePixelRatio;
            canvas.height = 180 * window.devicePixelRatio;
        }
        window.onresize = () => { if (currentResult) { resizeCanvas(); drawWaveform(); } };

        function drawWaveform(playheadSec = 0) {
            if (!currentResult) return;
            const w = canvas.width;
            const h = canvas.height;
            ctx.clearRect(0, 0, w, h);

            // Hintergrund
            ctx.fillStyle = '#020617';
            ctx.fillRect(0, 0, w, h);

            const dur = currentResult.metadata.duration || 1;
            const peaks = currentResult.waveformPeaks || [];
            const numBuckets = peaks.length / 2;
            const midY = h * 0.5;

            // waveform
            ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
            for (let i = 0; i < numBuckets; i++) {
                const x = (i / numBuckets) * w;
                const minV = peaks[i * 2];
                const maxV = peaks[i * 2 + 1];
                const barH = Math.max(1, (maxV - minV) * (h * 0.4));
                ctx.fillRect(x, midY - barH / 2, Math.max(1, w / numBuckets), barH);
            }

            // Beat Marker Linien
            currentResult.beats.forEach(b => {
                const x = (b.time / dur) * w;
                if (b.isDownbeat) {
                    ctx.strokeStyle = '#f43f5e';
                    ctx.lineWidth = 2.5 * window.devicePixelRatio;
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, h);
                    ctx.stroke();

                    // Taktflag
                    ctx.fillStyle = '#f43f5e';
                    ctx.fillRect(x, 0, 32 * window.devicePixelRatio, 14 * window.devicePixelRatio);
                    ctx.fillStyle = '#fff';
                    ctx.font = 'bold ' + (9 * window.devicePixelRatio) + 'px sans-serif';
                    ctx.fillText('T' + b.barIndex, x + 2, 10 * window.devicePixelRatio);
                } else {
                    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
                    ctx.lineWidth = 1 * window.devicePixelRatio;
                    ctx.beginPath();
                    ctx.moveTo(x, 15 * window.devicePixelRatio);
                    ctx.lineTo(x, h);
                    ctx.stroke();
                }
            });

            // Playhead Cursor
            const playX = (playheadSec / dur) * w;
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 2 * window.devicePixelRatio;
            ctx.beginPath();
            ctx.moveTo(playX, 0);
            ctx.lineTo(playX, h);
            ctx.stroke();
        }

        // seeking on the canvas
        canvas.onclick = (e) => {
            if (!audioBuffer) return;
            const rect = canvas.getBoundingClientRect();
            const frac = (e.clientX - rect.left) / rect.width;
            const targetSec = frac * audioBuffer.duration;
            seekTo(targetSec);
        };

        function seekTo(sec) {
            pauseOffset = Math.max(0, Math.min(sec, audioBuffer.duration));
            updateNextBeatIndex(pauseOffset);
            if (isPlaying) {
                stopSource();
                playAudio(pauseOffset);
            } else {
                drawWaveform(pauseOffset);
                updateTimeDisplay(pauseOffset);
            }
        }

        // Player Controls
        const btnPlay = document.getElementById('btnPlay');
        btnPlay.onclick = () => {
            if (isPlaying) pauseAudio();
            else playAudio(pauseOffset);
        };
        document.getElementById('btnRewind').onclick = () => seekTo(0);

        function playAudio(fromSec = 0) {
            if (!audioBuffer) return;
            if (audioContext.state === 'suspended') audioContext.resume();

            sourceNode = audioContext.createBufferSource();
            sourceNode.buffer = audioBuffer;
            sourceNode.connect(audioContext.destination);

            startTime = audioContext.currentTime - fromSec;
            sourceNode.start(0, fromSec);
            isPlaying = true;
            btnPlay.innerText = '⏸';
            updateNextBeatIndex(fromSec);

            sourceNode.onended = () => {
                if (getCurrentSec() >= audioBuffer.duration - 0.2) {
                    pauseAudio();
                    pauseOffset = 0;
                    seekTo(0);
                }
            };
            loop();
        }

        function pauseAudio() {
            if (!isPlaying) return;
            pauseOffset = getCurrentSec();
            stopSource();
            isPlaying = false;
            btnPlay.innerText = '▶';
            cancelAnimationFrame(animId);
        }

        function stopSource() {
            if (sourceNode) {
                try { sourceNode.stop(); sourceNode.disconnect(); } catch(e){}
                sourceNode = null;
            }
        }

        function getCurrentSec() {
            return isPlaying ? Math.max(0, audioContext.currentTime - startTime) : pauseOffset;
        }

        function updateTimeDisplay(sec) {
            const curM = Math.floor(sec / 60);
            const curS = Math.floor(sec % 60);
            const totalDur = audioBuffer ? audioBuffer.duration : 0;
            const totM = Math.floor(totalDur / 60);
            const totS = Math.floor(totalDur % 60);
            document.getElementById('timeDisplay').innerText = 
                (curM < 10 ? '0' : '') + curM + ':' + (curS < 10 ? '0' : '') + curS + ' / ' +
                (totM < 10 ? '0' : '') + totM + ':' + (totS < 10 ? '0' : '') + totS;
        }

        function updateNextBeatIndex(curSec) {
            if (!currentResult) return;
            let idx = 0;
            while (idx < currentResult.beats.length && currentResult.beats[idx].time < curSec - 0.03) {
                idx++;
            }
            nextBeatIdx = idx;
        }

        function loop() {
            if (!isPlaying) return;
            const cur = getCurrentSec();
            drawWaveform(cur);
            updateTimeDisplay(cur);

            // Metronom Klick & LED
            if (currentResult && nextBeatIdx < currentResult.beats.length) {
                const b = currentResult.beats[nextBeatIdx];
                if (cur >= b.time - 0.03) {
                    triggerBeatHit(b);
                    nextBeatIdx++;
                }
            }
            animId = requestAnimationFrame(loop);
        }

        function triggerBeatHit(beat) {
            const led = document.getElementById('ledDot');
            const label = document.getElementById('ledLabel');

            if (beat.isDownbeat) {
                led.className = 'led-dot flash-down';
                label.innerText = 'Bar ' + beat.barIndex + ' · Downbeat';
                label.style.color = '#f43f5e';
            } else {
                led.className = 'led-dot flash-beat';
                label.innerText = 'Bar ' + beat.barIndex + ' · Beat ' + beat.beatInBar;
                label.style.color = '#38bdf8';
            }
            setTimeout(() => { led.className = 'led-dot'; }, 120);

            // Synthesizer Klick
            if (document.getElementById('chkMetronome').checked && audioContext) {
                playClick(beat.isDownbeat);
            }
        }

        function playClick(isDownbeat) {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            const vol = parseFloat(document.getElementById('volMetronome').value) || 0.7;

            osc.frequency.setValueAtTime(isDownbeat ? 1280 : 850, audioContext.currentTime);
            osc.frequency.exponentialRampToValueAtTime(isDownbeat ? 400 : 300, audioContext.currentTime + 0.03);

            gain.gain.setValueAtTime(vol * (isDownbeat ? 1.0 : 0.6), audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.03);

            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.start();
            osc.stop(audioContext.currentTime + 0.03);
        }

        // Export Buttons
        document.getElementById('btnDlResolve').onclick = () => {
            if (!currentResult) return;
            const baseName = currentResult.metadata.fileName.replace(/\\.[^/.]+$/, "");
            const data = {
                format: "beatthis-resolve-markers/1",
                fileName: currentResult.metadata.fileName,
                duration: currentResult.metadata.duration,
                globalBpm: currentResult.globalBpm,
                timeSignature: currentResult.timeSignature.name,
                markers: currentResult.beats.map(b => ({
                    time: b.time, type: b.isDownbeat ? "downbeat" : "beat",
                    bar: b.barIndex, beat: b.beatInBar, bpm: b.instantBpm, confidence: b.confidence
                }))
            };
            downloadFile(JSON.stringify(data, null, 2), baseName + "_resolve_markers.json", "application/json");
        };

        document.getElementById('btnDlAudacity').onclick = () => {
            if (!currentResult) return;
            const baseName = currentResult.metadata.fileName.replace(/\\.[^/.]+$/, "");
            let txt = "";
            currentResult.beats.forEach(b => {
                const lbl = b.isDownbeat ? "[Bar " + b.barIndex + "] 1" : b.barIndex + "." + b.beatInBar;
                txt += b.time.toFixed(6) + "\\t" + b.time.toFixed(6) + "\\t" + lbl + "\\n";
            });
            downloadFile(txt, baseName + "_audacity.txt", "text/plain");
        };

        document.getElementById('btnDlJson').onclick = () => {
            if (!currentResult) return;
            const baseName = currentResult.metadata.fileName.replace(/\\.[^/.]+$/, "");
            downloadFile(JSON.stringify(currentResult, null, 2), baseName + "_beat_this.json", "application/json");
        };

        function downloadFile(content, filename, type) {
            const blob = new Blob([content], { type });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        }
    </script>
</body>
</html>"""


class BeatThisRequestHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        if "GET /api" in args[0] or "POST /api" in args[0]:
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
            clean_path = path.lstrip("/")
            file_path = os.path.join(DIST_DIR, clean_path)

            if clean_path and os.path.exists(file_path) and os.path.isfile(file_path):
                self.serve_static_file(file_path)
                return

            self.serve_static_file(index_file)
            return

        # 3. the built-in fallback page
        body = STANDALONE_HTML.encode("utf-8")
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
