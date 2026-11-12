# Changelog

## [0.1.2] – 2026-11-12

### Behoben
- Resolve-Dialog: Die Zeile „Analyse-Programm: in der JSON nicht angegeben …“ bekommt jetzt die Höhe, die sie braucht (war auf eine Zeile beschränkt und abgeschnitten).

## [0.1.1] – 2026-11-12

### Hinzugefügt
- Takte glätten bei Analysen mit beat_this: beat_this setzt jeden Downbeat einzeln, an unsicheren Stellen (Intro, Break, Build-up) entstanden so Takte mit 2 oder 3 Beats. BeatAnalyzer legt jetzt ein gleichmäßiges Taktraster darüber und setzt es nur dort neu an, wo das Modell über etwa zwei Takte klar eine andere „1“ hört. Die Beats selbst bleiben unverändert, die Confidence bleibt der Wert des Modells – ein vom Raster ergänzter Downbeat zeigt also eine niedrige Confidence. Nicht geglättet wird, wenn weniger als die Hälfte der Takte des Modells regelmäßig ist.
- Web-App: Häkchen „Takte glätten“ an der Kachel Taktart (standardmäßig an, Umschalten analysiert den Song neu); die Kachel zeigt, wie viele Beats neu eingeteilt wurden. Der Anteil „… % der Takte“ bezieht sich auf das Modell vor dem Glätten.
- Web-App: Häkchen „Mitlaufen“ an der Beat-Tabelle (standardmäßig an): Beim Abspielen blättert die Tabelle selbst auf die Seite des laufenden Beats, die Zeile des aktuellen Beats bleibt markiert, bis der nächste kommt. Bei „Nur Downbeats“ wird der aktuelle Takt markiert. Wer selbst blättert, schaltet das Mitlaufen ab.
- Kommandozeile `--no-smooth-bars`, Server `POST /api/analyze?smoothBars=0`, Ergebnisfeld `barSmoothing`.
- Einen Downbeat, den das Modell sehr sicher hört (ab 85 %), überstimmt das Raster nie – auch nicht am Songanfang.
- Nach einem Neuansatz zählen die Zählzeiten ab der neuen „1“ weiter (ein Takt aus zwei Beats heißt „1 2“, nicht „1 4“); nur der Auftakt vor der ersten „1“ behält seinen Platz im Raster (z. B. „3 4“).
- Web-App: Während der neuen Analyse ist das Häkchen gesperrt und zeigt den Fortschritt; schlägt sie fehl, bleibt das bisherige Ergebnis stehen, das Häkchen springt zurück und der Fehler steht an der Kachel (kein stilles Ausweichen auf die Browser-Analyse).

### Behoben
- Resolve-Dialog: Lange Hinweise (z. B. „Kein Clip gefunden …“ mit langem Dateinamen) wurden oben und unten abgeschnitten. Der Dialog schätzt die nötigen Zeilen jetzt mit Wortumbruch und etwas breiteren Zeichen.

## [0.1.0] – 2026-11-12

### Hinzugefügt
- Sprachdateien `lang/en.json`, `lang/de.json`, `lang/tr.json` (Englisch, Deutsch, Türkisch). Die türkischen Texte sind noch zu prüfen.
- Einstellungsdatei `settings.json` im BeatAnalyzer-Ordner mit der Sprache (Vorgabe „wie das System“, sonst Englisch). Der Server liest und schreibt sie über `/api/settings`.
- Angaben zum Analyse-Programm (`engineInfo`: beat_this oder librosa, CUDA oder CPU, Grafikkarte, Grund für den Ersatz) im Ergebnis, in der Marker-JSON und in `/api/health`.

### Geändert
- Resolve-Skript: eigenes Fenster statt sofortigem Dateidialog. JSON wählen; das Fenster zeigt den Ziel-Clip im Media Pool mit Laufzeit, warnt bei anderem Dateinamen oder wenn die Laufzeit des Clips um 0,5 s oder mehr von der analysierten Datei abweicht, und zeigt das Analyse-Programm. Ohne Ziel-Clip bleibt OK gesperrt.
- Resolve-Skript: Häkchen „Subtitle Track in der Timeline anlegen“ mit Erklärung, die sich nach Häkchen und offener Timeline richtet.
- Resolve-Skript: Markerfarben pro Zählzeit (Downbeat, Beat 2, 3, 4, übrige), jeweils auch „kein Marker“. Die Subtitles enthalten immer alle Beats.
- Resolve-Skript: Nach OK zeigt das Fenster die Schritte mit Fortschritt („240 / 512“) und bleibt gesperrt, bis alles fertig ist; das X wird so lange ignoriert. Der Subtitle Track kommt in die Timeline, die beim OK offen war.
- Resolve-Skript: Knopf „BeatAnalyzer-Marker entfernen“ mit Nachfrage (eigene Marker, Subtitle Track, Subtitle im Ordner BeatAnalyzer; Marker von Hand bleiben).
- Resolve-Skript: Das Fenster merkt sich Ordner der letzten JSON, Häkchen, Farben und Fenstergröße in `resolve_temp/plugin.txt`.
- Resolve-Skript: Die SRT-Dateien entstehen in einem Arbeitsordner unter `resolve_temp/` und werden nach dem Import gelöscht, nicht mehr neben der JSON. Im Ordner BeatAnalyzer im Media Pool liegt nur noch `<Song>.srt`; `<Song> (Timeline).srt` wird nach dem Platzieren entfernt.
- Resolve-Skript: Meldungen in der eingestellten Sprache.
- Resolve-Skript: Marker und Subtitles erscheinen in der eingestellten Sprache, z. B. „Takt 24 – Beat 1“, „89,6 BPM“, „Confidence 75 %“. Beat, Downbeat und Confidence bleiben in allen Sprachen englisch, der Trenner ist „–“. Downbeat-Marker heißen „Takt 1“ / „Bar 1“ / „Ölçü 1“.
- Resolve-Skript: Das installierte Skript enthält Sprache, BeatAnalyzer-Ordner und Texte. Der Server gleicht es beim Start und bei einem Sprachwechsel ab; *In Resolve aktualisieren* zeigt ein veraltetes Skript an.
- Confidence pro Beat kommt jetzt von beat_this (Wahrscheinlichkeit des Modells, immer über 50 %), statt fester 95 % bzw. 88 %. Ohne beat_this steht „–“.
- Die Kurven der Web-App zeigen bei beat_this dessen Wahrscheinlichkeiten pro Frame. Ohne beat_this ist es die Onset-Stärke, eine Downbeat-Kurve gibt es dann nicht.
- Taktart: statt einer festen Confidence von 95 % der Anteil der Takte mit dieser Beat-Anzahl („96 % der Takte“), nur mit beat_this; ohne beat_this „–“. Der Name der Taktart ist nur noch „4/4“ (ohne „(Standard)“, „(Walzer)“).
- Ein installiertes Resolve-Skript wird bei gleicher Version nur im Konfigurationsblock angepasst; eigene Änderungen, z. B. der Farben oben im Skript, bleiben erhalten.
- Resolve-Fenster: Die JSON-Zeile zeigt den Dateinamen, der volle Pfad steht im Tooltip. Das Fenster ist mindestens 600 × 640 groß; Zeilen für Warnungen und Analyse-Programm erscheinen nur, wenn sie etwas zeigen. Steht in der JSON kein Analyse-Programm, sagt das Fenster das.
- Server: Die Startmeldung sagt klar, womit analysiert wird (beat_this, librosa oder gar nicht). `/api/health` meldet zusätzlich den Grund `analyzer_failed`.
- `install_and_run.bat`: Lassen sich NumPy, SciPy, librosa oder soundfile nicht laden, bricht die Installation mit Anleitung ab. Fehlt beat_this, kommt eine deutliche Warnung mit den häufigen Ursachen (Git fehlt, kein Internet, laufender Server), statt still mit librosa weiterzumachen. Ohne Git steht ein Hinweis mit Download-Link da. Am Anfang steht der Hinweis, laufende BeatAnalyzer-Fenster vorher zu schließen.

### Behoben
- Windows-Batch-Dateien: Ein `&` in Titel- und Textzeilen wurde als Befehl ausgeführt („Die Datei "mit" kann nicht gefunden werden“). Klammern in Textzeilen innerhalb von Blöcken beendeten den Block vorzeitig; `install_and_run.bat` legte dadurch die Umgebung `venv` bei jedem Start neu an.
- Server: Ließ sich `analyzer.py` nicht laden (z. B. wegen einer beschädigten NumPy-Installation), endete jede Analyse mit `NameError: err`; die eigentliche Ursache ging verloren.
- Resolve-Skript: Laufzeit des Clips aus „Duration“, wenn Resolve bei Audio-Clips keine Frame-Anzahl liefert (vorher „· ?“).
- Resolve-Skript: Der alte Subtitle Track wird vor dem neuen Import gelöscht. Weil Resolve einen noch benutzten Clip nicht löscht, sammelten sich sonst bei jedem Lauf `<Song> (Timeline).srt`-Clips im Media Pool.
- Resolve-Skript unter Windows: Dateien und Ordner mit Umlauten im Pfad werden über die Unicode-Funktionen gelöscht und angelegt; vorher blieb beim Löschen eine Datei geöffnet und der Arbeitsordner liegen.
- Resolve-Skript: Der Zwischen-Clip `<Song> (Timeline).srt` wird auf jedem Weg entfernt, auch wenn der Subtitle Track nicht angelegt werden kann; scheitert das Entfernen, nennt das Ergebnis den Clip.
- Resolve-Skript: „BeatAnalyzer-Marker entfernen“ ohne gewählte JSON wirkt nur auf ausgewählte Clips, nicht auf Einträge ohne Dateinamen (z. B. Timelines).
- Resolve-Skript: Schließt Resolve das Fenster während der Arbeit trotzdem, endet das Skript nach getaner Arbeit, statt unsichtbar weiterzulaufen.
- Längenwarnung zeigt Zehntelsekunden, wenn beide Laufzeiten sonst gleich aussähen.
- `/api/health` startet CUDA nicht mehr nur, um den Namen der Grafikkarte zu lesen; die erste Analyse nach dem Start lief sonst unter Umständen im Browser statt mit beat_this.

### Bekannt, kommt in einer späteren Version
- Die Web-App dekodiert die Datei zuerst im Browser und rechnet ohne Rückmeldung im Browser weiter, wenn der Server nicht antwortet oder die Analyse dort scheitert. Die Oberfläche der Web-App ist noch nur deutsch.
- Das README beschreibt noch den Ablauf von 0.0.5 (SRT neben der JSON, „Nur Downbeats“ im Export).
- Analyse direkt aus Resolve ohne JSON.

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
