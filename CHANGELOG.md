# Changelog

## [0.0.2] – 2026-11-11

### Hinzugefügt
- DaVinci Resolve: Export „Marker-JSON“ und Skript `resolve/BeatThis_Markers.lua`. Das Skript setzt einen Marker pro Beat auf den Audio-Clip im Media Pool (Red = Downbeat, Cyan = Beat). Ziel ist der im Media Pool ausgewählte Clip, ohne Auswahl der Clip mit dem Dateinamen aus der JSON. Ein neuer Lauf ersetzt die Marker des letzten Laufs.
- Installation des Resolve-Skripts direkt aus der App (Export → DaVinci Resolve) und automatisch durch `install_and_run.bat`, wenn Resolve installiert ist.
- Update von GitHub: Hinweis mit Update-Button im Header, `update.bat`, `backend/updater.py`. Ersetzte Dateien kommen nach `update-backup/<alte Version>/`.
- GitHub Actions: `release.yml` hängt `BeatThis.zip` an jedes Release eines Versions-Tags, `tests.yml` prüft Backend, Frontend und `dist/`.
- CLI: `--export-resolve`, `--only-downbeats`.

- `LICENSE` (MIT), Abschnitt „Lizenz“ und „Credits“ in der README mit Hinweis und Zitat zu CPJKU beat_this.
- Der Frontend-Build schreibt die Lizenzen der gebündelten Pakete nach `dist/.vite/license.md`.

### Entfernt
- Reste aus Google AI Studio: `metadata.json`, `.env.example` und die nicht benutzten Pakete `@google/genai`, `express`, `dotenv`, `tsx`, `motion`.
- EDL- und CSV-Marker-Export für DaVinci Resolve. Die EDL legte Marker auf die Timeline statt auf den Clip und passte nur bei Clip-Start 01:00:00:00 und gleicher Bildrate.

## [0.0.1] – 2026-11-11

Erste versionierte Fassung.

### Hinzugefügt
- Projekt `beatanalyzer4` importiert: Python-Backend (CPJKU beat_this / Librosa-Fallback), React/Vite-Frontend, CLI, Windows-Batchskripte
- `VERSION`-Datei; Version erscheint im Server-Banner und in `/api/health`
- Backend-Tests (`backend/tests`)

### Behoben
- Installation unter Python 3.13 (Windows): `numpy<2` entfernt
- `install_and_run.bat`: Paketversionen quotiert (`>` war Umleitung), CRLF-Zeilenenden
- `npm install`: esbuild-Konflikt mit Vite 8
- beat_this über `Audio2Beats` mit dekodiertem Signal (keine FFmpeg/TorchCodec-Abhängigkeit)
- Fertig gebautes Frontend in `dist/` mitgeliefert
