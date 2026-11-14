"""
BeatAnalyzer Python Backend Server
Verwendet den nativen Python HTTP-Server (http.server.ThreadingHTTPServer)
100% frei von Pydantic/FastAPI-Abhängigkeitsproblemen, voll kompatibel mit Python 3.9 bis 3.13+
"""

import os
import sys
import json
import tempfile
import mimetypes
import traceback
from http.server import HTTPServer, ThreadingHTTPServer, BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse

# Füge Verzeichnisse zum Suchpfad hinzu
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
DIST_DIR = os.path.join(PROJECT_ROOT, "dist")
sys.path.insert(0, CURRENT_DIR)
sys.path.insert(0, PROJECT_ROOT)

# Initialisiere MIME-Types für modernes React-Frontend
mimetypes.init()
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("application/javascript", ".mjs")
mimetypes.add_type("text/css", ".css")
mimetypes.add_type("image/svg+xml", ".svg")
mimetypes.add_type("application/json", ".json")

# Lade Analyzer
ANALYZER_ERROR = ""   # why analyzer.py could not be loaded (e.g. a broken NumPy in venv)
try:
    from analyzer import analyze_audio_file, engine_status, clamp_protect, BEAT_THIS_AVAILABLE
except Exception as _err:   # the name of an except variable is deleted after the block: keep the text
    ANALYZER_ERROR = str(_err) or type(_err).__name__
    print("=" * 70)
    print(f"[FEHLER] analyzer.py laesst sich nicht laden: {ANALYZER_ERROR}")
    print("[FEHLER] Analysen sind nicht moeglich. Meist ist venv beschaedigt: alle BeatAnalyzer-Fenster")
    print("[FEHLER] schliessen, den Ordner venv loeschen und install_and_run.bat erneut starten.")
    print("=" * 70)
    BEAT_THIS_AVAILABLE = False

    def analyze_audio_file(p, f, smooth=True, protect=0.95):
        raise RuntimeError(f"Analyzer-Fehler (analyzer.py nicht geladen): {ANALYZER_ERROR}")

    def engine_status():
        return {"id": "librosa", "device": None, "gpu": None, "fallbackReason": "analyzer_failed", "model": None}

    def clamp_protect(value):
        return 0.95   # nothing is analysed anyway

import i18n
import resolve_plugin
import settings
import updater


def settings_payload() -> dict:
    """Body of GET /api/settings: chosen language, the language it means, the languages with a file."""
    language = settings.load()["language"]
    return {
        "language": language,
        "resolvedLanguage": i18n.resolve_language(language),
        "languages": [{"code": code, "name": name} for code, name in i18n.available()],
    }

TEMP_DIR = tempfile.mkdtemp(prefix="beatthis_")


def read_app_version():
    try:
        with open(os.path.join(PROJECT_ROOT, "VERSION"), encoding="utf-8") as f:
            return f.read().strip()
    except OSError:
        return "unbekannt"


APP_VERSION = read_app_version()


def extract_uploaded_file(headers, rfile):
    """
    Nativer, robuster Multipart-Form-Data Parser ohne externe Abhängigkeiten.
    Kompatibel mit Python 3.9, 3.10, 3.11, 3.12 und 3.13.
    """
    try:
        content_length = int(headers.get('Content-Length', 0))
    except (ValueError, TypeError):
        return None, None

    if content_length <= 0:
        return None, None

    content_type = headers.get('Content-Type', '')

    # Falls RAW Binary gesendet wurde
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


# Autarke, vollständige Web-Benutzeroberfläche (funktioniert auch wenn dist/ nicht gebaut wurde!)
STANDALONE_HTML = """<!DOCTYPE html>
<html lang="de">
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
            <div class="badge-engine" id="engineBadge">Python Server aktiv</div>
        </header>

        <!-- Dropzone -->
        <div class="dropzone" id="dropzone">
            <input type="file" id="fileInput" accept=".mp3,.wav,.aac,.flac,.ogg,.m4a,audio/*" style="display:none">
            <div id="dropPrompt">
                <div style="font-size: 32px; margin-bottom: 8px;">📂</div>
                <h3>Musikdatei hier ablegen oder klicken</h3>
                <p>Unterstützt MP3, WAV, AAC und FLAC für automatische Beat- und Downbeat-Erkennung</p>
                <div class="formats">
                    <span class="format-tag">MP3</span>
                    <span class="format-tag">WAV</span>
                    <span class="format-tag">AAC / M4A</span>
                    <span class="format-tag">FLAC</span>
                </div>
            </div>
            <div id="loadingState" class="hidden">
                <div class="spinner"></div>
                <h3 id="loadingText">Audiodatei wird analysiert...</h3>
                <p>CPJKU beat_this Transformer berechnet Beats & Downbeats...</p>
            </div>
        </div>

        <!-- Analyse-Ergebnisse (wird nach Upload sichtbar) -->
        <div id="resultsView" class="hidden" style="display:flex; flex-direction:column; gap:20px;">
            <!-- Metrics -->
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="title">Globales Tempo</div>
                    <div class="val" id="valBpm">--</div>
                    <div class="sub">BPM (Beats per Minute)</div>
                </div>
                <div class="metric-card">
                    <div class="title">Taktart (Meter)</div>
                    <div class="val" id="valMeter">4/4</div>
                    <div class="sub" id="valMeterName">Common Time</div>
                </div>
                <div class="metric-card">
                    <div class="title">Takte (Downbeats)</div>
                    <div class="val" id="valBars" style="color:#f43f5e;">--</div>
                    <div class="sub" id="valTotalBeats">-- Beats gesamt</div>
                </div>
                <div class="metric-card">
                    <div class="title">Tempo-Stabilität</div>
                    <div class="val" id="valStability">--%</div>
                    <div class="sub">Präzision</div>
                </div>
                <div class="metric-card">
                    <div class="title">Audiodatei</div>
                    <div class="val" id="valDuration" style="font-size:1.3rem;">--</div>
                    <div class="sub" id="valFormat">AUDIO</div>
                </div>
            </div>

            <!-- Waveform Canvas -->
            <div class="canvas-card">
                <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:0.75rem; color:#94a3b8;">
                    <span>Wellenform & Beat Grid (Rot = Taktanfang / Eins, Cyan = Beats)</span>
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
                    <span id="ledLabel">Bereit</span>
                </div>

                <div style="display:flex; align-items:center; gap:8px; font-size:0.8rem; color:#94a3b8;">
                    <label><input type="checkbox" id="chkMetronome" checked> Metronom-Klick</label>
                    <input type="range" id="volMetronome" min="0" max="1" step="0.05" value="0.7" style="width:70px;">
                </div>
            </div>

            <!-- DaVinci Resolve & DAW Export Panel -->
            <div class="export-card">
                <div class="export-header">
                    <div>
                        <h3 style="font-size:1rem; color:#fff; display:flex; align-items:center; gap:8px;">
                            🎬 Export für DaVinci Resolve & DAWs
                        </h3>
                        <p style="font-size:0.75rem; color:#94a3b8;">Marker als Clip-Marker im Media Pool</p>
                    </div>
                </div>

                <div class="export-grid">
                    <!-- DaVinci Resolve marker JSON -->
                    <div class="export-box" style="border-color:#be123c;">
                        <div>
                            <h4><span style="color:#f43f5e;">🔴</span> DaVinci Resolve Marker (JSON)</h4>
                            <p>Fuer das Skript <em>BeatAnalyzer_Markers.lua</em>: Clip im Media Pool waehlen, dann <em>Workspace → Scripts → BeatAnalyzer_Markers</em>.</p>
                        </div>
                        <button class="btn-dl" id="btnDlResolve">Resolve Marker-JSON (.json)</button>
                    </div>

                    <!-- Audacity Labels -->
                    <div class="export-box">
                        <div>
                            <h4>📄 Audacity Textspur</h4>
                            <p>In Audacity: <em>Spuren → Textspuren importieren</em>.</p>
                        </div>
                        <button class="btn-dl btn-dl-cyan" id="btnDlAudacity">Audacity Labels (.txt)</button>
                    </div>

                    <!-- JSON -->
                    <div class="export-box">
                        <div>
                            <h4>💻 CPJKU beat_this JSON</h4>
                            <p>Vollständige strukturierte Beats, Downbeats und BPM.</p>
                        </div>
                        <button class="btn-dl btn-dl-cyan" id="btnDlJson">JSON Daten (.json)</button>
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
                if (!res.ok) throw new Error("Server-Analysefehler: " + res.statusText);
                currentResult = await res.json();

                // Dekodiere Audio im Browser für Player
                if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const arrayBuf = await file.arrayBuffer();
                audioBuffer = await audioContext.decodeAudioData(arrayBuf);

                displayResults(currentResult);
            } catch (err) {
                alert("Fehler bei der Analyse: " + err.message);
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
            document.getElementById('valTotalBeats').innerText = data.totalBeats + " Beats gesamt";
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

            // Wellenform
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

        // Seeking auf Canvas
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
                label.innerText = 'Takt ' + beat.barIndex + ' (EINS)';
                label.style.color = '#f43f5e';
            } else {
                led.className = 'led-dot flash-beat';
                label.innerText = 'Takt ' + beat.barIndex + ' • Beat ' + beat.beatInBar;
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
                const lbl = b.isDownbeat ? "[Takt " + b.barIndex + "] 1" : b.barIndex + "." + b.beatInBar;
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
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")

    def do_OPTIONS(self):
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

            response_data = {
                "status": "online",
                "beat_this_installed": BEAT_THIS_AVAILABLE,
                "cuda_available": cuda_avail,
                "engine": "CPJKU beat_this Transformer" if BEAT_THIS_AVAILABLE else "Librosa MIR Fallback",
                "engineInfo": engine_status(),
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

        # 2. Statische Frontend-Dateien (aus dist/, falls kompiliert)
        index_file = os.path.join(DIST_DIR, "index.html")
        if os.path.isdir(DIST_DIR) and os.path.exists(index_file):
            clean_path = path.lstrip("/")
            file_path = os.path.join(DIST_DIR, clean_path)

            if clean_path and os.path.exists(file_path) and os.path.isfile(file_path):
                self.serve_static_file(file_path)
                return

            self.serve_static_file(index_file)
            return

        # 3. Vollständige integrierte Web-Oberfläche (sofort nutzbar!)
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
            self.send_error(500, f"Fehler beim Laden der Datei: {e}")

    def do_POST(self):
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
            self.send_error(404, "Endpoint nicht gefunden")

    def handle_analyze(self):
        try:
            file_bytes, filename = extract_uploaded_file(self.headers, self.rfile)
            if not file_bytes:
                self.send_error_json(400, "Keine gültige Audiodatei empfangen.")
                return

            print(f"[BeatAnalyzer Server] Starte Analyse für: {filename} ({len(file_bytes)} Bytes)...")

            temp_path = os.path.join(TEMP_DIR, f"track_{os.getpid()}_{filename}")
            with open(temp_path, "wb") as f_out:
                f_out.write(file_bytes)

            try:
                query = parse_qs(urlparse(self.path).query)
                smooth = query.get("smoothBars", ["1"])[0] != "0"
                protect = clamp_protect(query.get("protect", [None])[0])
                result = analyze_audio_file(temp_path, filename, smooth=smooth, protect=protect)
                body = json.dumps(result).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Content-Length", str(len(body)))
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(body)
                print(f"[BeatAnalyzer Server] Analyse erfolgreich für: {filename} ({result.get('globalBpm')} BPM)")
            finally:
                if os.path.exists(temp_path):
                    try:
                        os.remove(temp_path)
                    except Exception:
                        pass
        except Exception as e:
            traceback.print_exc()
            self.send_error_json(500, f"Fehler bei Audioanalyse: {str(e)}")

    def handle_resolve_install(self):
        try:
            target = resolve_plugin.install()
            print(f"[BeatAnalyzer Server] Resolve-Skript installiert: {target}")
            self.send_json(200, resolve_plugin.status())
        except Exception as e:
            traceback.print_exc()
            self.send_error_json(500, f"Installation fehlgeschlagen: {e}")

    def handle_update(self):
        try:
            result = updater.update()
            self.send_json(200, {"updated": result["updated"], "version": result["version"],
                                 "message": result["message"]})
        except updater.UpdateError as e:
            self.send_error_json(409, str(e))
        except Exception as e:
            traceback.print_exc()
            self.send_error_json(500, f"Update fehlgeschlagen: {e}")

    def handle_settings(self):
        """POST {"language": "de"}: save it and bring an installed Resolve script up to date."""
        try:
            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length).decode("utf-8") or "{}")
            if not isinstance(body, dict) or "language" not in body:
                raise ValueError('Erwartet: {"language": "auto" | "en" | "de" | "tr"}')
            result = resolve_plugin.set_language(str(body["language"]))
        except ValueError as e:   # json.JSONDecodeError is a ValueError
            self.send_error_json(400, str(e))
            return
        except Exception as e:
            traceback.print_exc()
            self.send_error_json(500, f"Einstellungen nicht gespeichert: {e}")
            return
        self.send_json(200, {**settings_payload(), "pluginUpdated": result["pluginUpdated"]})

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


def main():
    port = int(os.environ.get("PORT", 8000))
    server_address = ("127.0.0.1", port)
    
    ServerClass = ThreadingHTTPServer if hasattr(sys.modules['http.server'], 'ThreadingHTTPServer') else HTTPServer
    httpd = ServerClass(server_address, BeatThisRequestHandler)

    print("======================================================================")
    print("      BeatAnalyzer - Lokaler Audio-Analyzer Server gestartet")
    print("======================================================================")
    print(f" URL:            http://localhost:{port}")
    print(f" Version:        {APP_VERSION}")
    print(f" Python Version: {sys.version.split()[0]}")
    if ANALYZER_ERROR:
        print(" Analyse:        NICHT MOEGLICH - analyzer.py nicht geladen (siehe oben)")
    elif BEAT_THIS_AVAILABLE:
        print(" Analyse:        CPJKU beat_this")
    else:
        print(" Analyse:        librosa - beat_this ist NICHT installiert (install_and_run.bat erneut starten)")
    print("======================================================================")
    print(" Server laeuft. Druecke STRG + C zum Beenden.")
    print("======================================================================")

    try:
        path = resolve_plugin.status()["path"]
        if resolve_plugin.ensure_current():
            print(f"[Resolve] Skript an Sprache und Ordner angepasst: {path}")
    except Exception as err:
        print(f"[Resolve] Skript nicht abgeglichen: {err}")

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer wird heruntergefahren...")
    finally:
        httpd.server_close()
        print("Server beendet.")


if __name__ == "__main__":
    main()
