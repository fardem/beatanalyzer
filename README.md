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

## Lizenz

BeatThis steht unter der [MIT-Lizenz](LICENSE).

## Credits

**CPJKU beat_this** – Beat- und Downbeat-Erkennung, Johannes Kepler Universität Linz,
<https://github.com/CPJKU/beat_this>. Code und Modellgewichte stehen unter der MIT-Lizenz.
BeatThis enthält weder Code noch Modellgewichte von beat_this: `install_and_run.bat` installiert
das Paket von GitHub, beat_this lädt das Modell `final0` beim ersten Start selbst herunter.

Hinweis von beat_this: Einige der Trainingsdaten sind urheberrechtlich geschützt oder stehen unter
eingeschränkten Creative-Commons-Lizenzen. Ob das deine Nutzung betrifft, musst du selbst prüfen.

Wenn du beat_this in einer wissenschaftlichen Arbeit verwendest, zitiere bitte:

```bibtex
@inproceedings{foscarin2024beatthis,
    author = {Francesco Foscarin and Jan Schl{\"u}ter and Gerhard Widmer},
    title = {Beat this! Accurate beat tracking without {DBN} postprocessing},
    year = 2024,
    month = nov,
    booktitle = {Proceedings of the 25th International Society for Music Information Retrieval Conference (ISMIR)},
    address = {San Francisco, CA, United States},
}
```

Weitere Bibliotheken, die per pip installiert werden: PyTorch (BSD-3-Clause), librosa (ISC),
NumPy und SciPy (BSD-3-Clause), soundfile (BSD-3-Clause). Das Frontend in `dist/` enthält React,
React DOM, scheduler (MIT) und lucide-react (ISC); ihre Lizenztexte stehen in
[`dist/.vite/license.md`](dist/.vite/license.md).
