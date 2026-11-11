# Changelog

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
