#!/usr/bin/env bash
# BeatAnalyzer Linux/macOS Installation & Runner
set -e

echo "======================================================================"
echo "         BeatAnalyzer - CPJKU beat_this Setup (Linux / macOS)"
echo "======================================================================"

if ! command -v python3 &> /dev/null; then
    echo "[FEHLER] python3 wurde nicht gefunden. Bitte installiere Python 3.9+."
    exit 1
fi

if [ ! -d "venv" ]; then
    echo "[1/4] Erstelle isolierte Python-Umgebung in venv/ ..."
    python3 -m venv venv
fi

echo "[2/4] Aktiviere venv..."
source venv/bin/activate

echo "[3/4] Installiere Dependencies..."
pip install --upgrade pip
pip install -r requirements.txt || pip install fastapi uvicorn[standard] python-multipart pydantic numpy scipy librosa soundfile torch torchaudio

if [ ! -f "dist/index.html" ] && command -v npm &> /dev/null; then
    echo "[4/4] Baue Frontend..."
    npm install
    npm run build
fi

python3 backend/resolve_plugin.py auto || true

echo "======================================================================"
echo " Starte Server auf http://localhost:8000 ..."
echo "======================================================================"

# Open browser if possible
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:8000 &
elif command -v open &> /dev/null; then
    open http://localhost:8000 &
fi

python3 backend/server.py
