# Changelog

## [0.1.0] – in Arbeit

### Hinzugefügt
- Sprachdateien `lang/en.json`, `lang/de.json`, `lang/tr.json` (Englisch, Deutsch, Türkisch). Die türkischen Texte sind noch zu prüfen.
- Einstellungsdatei `settings.json` im BeatAnalyzer-Ordner mit der Sprache (Vorgabe „wie das System“, sonst Englisch). Der Server liest und schreibt sie über `/api/settings`.
- Angaben zum Analyse-Programm (`engineInfo`: beat_this oder librosa, CUDA oder CPU, Grafikkarte, Grund für den Ersatz) im Ergebnis, in der Marker-JSON und in `/api/health`.

### Geändert
- Resolve-Skript: Marker und Subtitles erscheinen in der eingestellten Sprache, z. B. „Takt 24 – Beat 1“, „89,6 BPM“, „Confidence 75 %“. Beat, Downbeat und Confidence bleiben in allen Sprachen englisch, der Trenner ist „–“. Downbeat-Marker heißen „Takt 1“ / „Bar 1“ / „Ölçü 1“.
- Resolve-Skript: Das installierte Skript enthält Sprache, BeatAnalyzer-Ordner und Texte. Der Server gleicht es beim Start und bei einem Sprachwechsel ab; *In Resolve aktualisieren* zeigt ein veraltetes Skript an.
- Confidence pro Beat kommt jetzt von beat_this (Wahrscheinlichkeit des Modells, immer über 50 %), statt fester 95 % bzw. 88 %. Ohne beat_this steht „–“.
- Die Kurven der Web-App zeigen bei beat_this dessen Wahrscheinlichkeiten pro Frame. Ohne beat_this ist es die Onset-Stärke, eine Downbeat-Kurve gibt es dann nicht.
- Taktart: statt einer festen Confidence von 95 % der Anteil der Takte mit dieser Beat-Anzahl („96 % der Takte“). Der Name der Taktart ist nur noch „4/4“ (ohne „(Standard)“, „(Walzer)“).

## [0.0.5] – 2026-11-12

### Geändert
- Das Programm heißt **BeatAnalyzer** (vorher BeatThis): Oberfläche, Browser-Tab, Batch-Fenster, Server-Meldungen, README.
- Resolve-Skript heißt `BeatAnalyzer_Markers.lua`, Media-Pool-Ordner und Untertitelspur heißen **BeatAnalyzer** bzw. „BeatAnalyzer - <Song>“. Ein neuer Lauf löscht auch die alte Spur „BeatThis - <Song>“.
- Release-Datei heißt `BeatAnalyzer.zip`. Umgebungsvariable für private Repositories: `BEATANALYZER_GITHUB_TOKEN` (`BEATTHIS_GITHUB_TOKEN` gilt weiter).

### Übergang von 0.0.4
- Jedes Release enthält zusätzlich `BeatThis.zip`, weil der Updater bis 0.0.4 diese Datei sucht.
- `resolve/BeatThis_Markers.lua` bleibt als Übergangsskript: Der Updater bis 0.0.4 installiert es, und es startet `BeatAnalyzer_Markers.lua`. *In Resolve aktualisieren* installiert das neue Skript und entfernt das alte aus Resolve.
- Unverändert und damit weiter gültig: Kennung der Marker-JSON und der Marker, sodass alte JSONs funktionieren und alte Marker ersetzt werden.

## [0.0.4] – 2026-11-11

### Hinzugefügt
- Resolve-Skript: legt zusätzlich eine Untertiteldatei mit dem Namen des Songs an (`<Song>.srt`, neben der Marker-JSON) und importiert sie in den Media-Pool-Ordner `BeatThis`. Ein Untertitel pro Beat, bis zum nächsten Beat, mit vier Zeilen: Typ (`Downbeat (1)` / `Beat 2`), `Takt 24 - Beat 1`, `01:02.880 - 89.6 BPM`, `Konfidenz 75%`. Der erste Untertitel läuft von 0 s bis zum ersten Beat, damit die Zeiten passen, wenn die SRT am Anfang des Clips liegt. Ein neuer Lauf ersetzt den Untertitel-Clip des letzten Laufs.
- Resolve-Skript: Ist eine Timeline offen, in der der Song auf einer Audiospur liegt, kommen die Untertitel auf die Untertitelspur „BeatThis - <Song>“, genau unter das erste Vorkommen des Songs. Berücksichtigt werden Startposition und vorne abgeschnittener Teil des Clips; Beats außerhalb des sichtbaren Teils fallen weg. Ein neuer Lauf löscht diese Spur und legt sie neu an. Andere Untertitelspuren bleiben, werden aber deaktiviert, weil Resolve nur eine aktive Untertitelspur erlaubt. Danach prüft das Skript, ob der erste Untertitel am erwarteten Frame liegt.
- `resolve/tools/probe_timeline.lua`: Prüfskript für Resolve. Misst Position und Trim des Clips, legt zwei Test-Untertitel an, vergleicht mit den erwarteten Frames und räumt danach auf.
- Marker-JSON: Konfidenz pro Beat (`confidence`).

## [0.0.3] – 2026-11-11

### Behoben
- Resolve-Skript: `GetSelectedClips()` lieferte in Resolve Studio 21.2 neben dem ausgewählten Clip einen Eintrag ohne Clip-Methoden. Das Skript zählte ihn als Clip („2 clip(s): ?, …“), meldete 359 übersprungene Marker und warnte fälschlich, der Clip passe nicht zur JSON. Einträge ohne `AddMarker` werden jetzt ignoriert und im Log mit Typ genannt.
- Resolve-Skript: Dieselbe Meldung „API not available“ steht höchstens dreimal im Log.

## [0.0.2] – 2026-11-11

### Hinzugefügt
- DaVinci Resolve: Export „Marker-JSON“ und Skript `resolve/BeatThis_Markers.lua`. Das Skript setzt einen Marker pro Beat auf den Audio-Clip im Media Pool (Red = Downbeat, Cyan = Beat). Ziel ist der im Media Pool ausgewählte Clip, ohne Auswahl der Clip mit dem Dateinamen aus der JSON. Ein neuer Lauf ersetzt die Marker des letzten Laufs.
- Installation des Resolve-Skripts direkt aus der App (Export → DaVinci Resolve) und automatisch durch `install_and_run.bat`, wenn Resolve installiert ist.
- Update von GitHub: Hinweis mit Update-Button im Header, `update.bat`, `backend/updater.py`. Ersetzte Dateien kommen nach `update-backup/<alte Version>/`.
- GitHub Actions: `release.yml` hängt `BeatThis.zip` an jedes Release eines Versions-Tags, `tests.yml` prüft Backend, Frontend und `dist/`.
- CLI: `--export-resolve`, `--only-downbeats`.
- `LICENSE` (MIT), Abschnitt „Lizenz“ und „Credits“ in der README mit Hinweis und Zitat zu CPJKU beat_this.
- Der Frontend-Build schreibt die Lizenzen der gebündelten Pakete nach `dist/.vite/license.md`.
- README neu geschrieben, mit Bildschirmfotos (`docs/images/`); `README_WINDOWS.md` ist darin aufgegangen.

### Behoben
- Updater: Eine `requirements.txt` mit CRLF-Zeilenenden galt als geändert und löste ein unnötiges `pip install` aus.

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
