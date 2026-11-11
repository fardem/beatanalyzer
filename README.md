# BeatThis – Beat- & Downbeat-Analyzer

Lokale Web-App zur Beat-, Downbeat-, Tempo- und Taktart-Erkennung für MP3, WAV, AAC und FLAC.
Backend in Python (CPJKU *beat_this* Transformer, Librosa als Fallback), Frontend in React/Vite.

## Windows

Siehe [README_WINDOWS.md](README_WINDOWS.md) – kurz: `install_and_run.bat` doppelklicken,
danach reicht `start.bat`. Das Frontend liegt fertig gebaut in `dist/`, Node.js ist nicht nötig.

Download: <https://github.com/fardem/beatanalyzer/releases/latest/download/BeatThis.zip> – entpacken, dann `install_and_run.bat`.

## DaVinci Resolve

Beat-Marker am Audio-Clip über das Skript `resolve/BeatThis_Markers.lua`. Installation und Ablauf: [README_WINDOWS.md](README_WINDOWS.md#-beat-marker-in-davinci-resolve).

## Update

Button *Update* im Header der App oder `update.bat`. Grundlage ist das neueste GitHub-Release (`BeatThis.zip`).
Ein Release entsteht, wenn ein Tag mit der Version aus `VERSION` gepusht wird (z. B. `0.0.2`).

## Linux / macOS

```bash
./install_and_run.sh
```

Der Server läuft danach auf <http://localhost:8000>.

## Frontend neu bauen (nur bei Änderungen in `src/`)

```bash
npm install
npm run build
```

## Tests (Backend)

```bash
venv/bin/python -m unittest discover -s backend/tests -v
```

## CLI

```bash
python backend/analyze_cli.py song.mp3 --export-csv beats.csv
```
