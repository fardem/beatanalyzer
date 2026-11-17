#!/usr/bin/env bash
# BeatAnalyzer Linux/macOS Installation & Runner
set -e

echo "======================================================================"
echo "         BeatAnalyzer - CPJKU beat_this Setup (Linux / macOS)"
echo "======================================================================"

if ! command -v python3 &> /dev/null; then
    echo "[ERROR] python3 not found. Please install Python 3.9 or newer."
    exit 1
fi

if [ ! -d "venv" ]; then
    echo "[1/4] Creating the Python environment in venv/ ..."
    python3 -m venv venv
fi

echo "[2/4] Activating venv..."
source venv/bin/activate

echo "[3/4] Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt || pip install fastapi uvicorn[standard] python-multipart pydantic numpy scipy librosa soundfile torch torchaudio

if [ ! -f "dist/index.html" ] && command -v npm &> /dev/null; then
    echo "[4/4] Building the frontend..."
    npm install
    npm run build
fi

python3 backend/resolve_plugin.py auto || true

echo "======================================================================"
echo " Starting the server on http://localhost:8000 ..."
echo "======================================================================"

# the server opens the browser as soon as it is ready
python3 backend/server.py --open-browser
