# Teilprojekt 3: Analyse direkt aus Resolve – Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Im Resolve-Fenster einen ausgewählten Audio-Clip direkt analysieren (ohne Server und Web-App), mit Regler „Glätten“; Marker zusätzlich auf den Clip in der Timeline; dazu die feste Höhe der Kachel Taktart in der Web-App.

**Architecture:** Das Lua-Skript schreibt einen Auftragsordner mit `job.txt`, startet `pythonw.exe backend\resolve_job.py <Ordner>` unsichtbar und fragt per Timer `progress.txt`/`done.txt` ab. `resolve_job.py` ruft `analyze_audio_file` und schreibt `markers.json` im Format der Marker-JSON. Danach läuft derselbe Weg wie beim JSON-Laden (`M.start`), mit festgehaltenem Ziel-Clip. Timeline-Marker setzt ein zusätzlicher Schritt im bestehenden Job auf die Timeline-Clips des Songs.

**Tech Stack:** LuaJIT (Fusion UIManager, ffi), Python 3.10–3.13 (unittest, lupa für Lua-Tests), React/TypeScript (Playwright-Prüfung).

**Spec:** `docs/superpowers/specs/2026-11-12-resolve-dialog-und-sprachen-design.md` (Abschnitte 6, 7, 7.3, 11) und Entscheidungen des Nutzers vom 2026-11-13 (unten).

## Global Constraints

- Zwei Wege oben im Fenster: „Ausgewählten Clip analysieren“ und „JSON laden“ (Spec 6.2). Fusion-UI hat keine Radio-Buttons: zwei sich gegenseitig ausschließende Häkchen.
- **Regler „Glätten“ im Resolve-Fenster:** 0–100 %, 0 % = aus, 100 % = voll geglättet, **Standard 90 %**, gemerkt in `resolve_temp/plugin.txt` (Nutzer 2026-11-13). Umrechnung wie Web-App: Schutz = 0,5 + Wert/200 (90 % → 0,95). Nur beim Weg „Clip analysieren“ aktiv.
- **Marker auch auf dem Clip in der Timeline**, immer wenn der Song in der beim OK offenen Timeline liegt; Zeitpunkt relativ zum Anfang des Timeline-Clips mit Versatz durch getrimmten Anfang; „BeatAnalyzer-Marker entfernen“ entfernt sie mit; Marker von Hand bleiben (Spec 7.3, Empfehlung angenommen).
- Auftragsordner `<BeatAnalyzer>\resolve_temp\<Datum-Zeit>-<Zufall>\`; `job.txt` UTF-8 mit `format=beatanalyzer-resolve-job/1`, `audio=`, `lang=`, `smooth=0|1`, `protect=`; `done.txt` über temporäre Datei + Umbenennen; `cancel.txt` zum Abbrechen; Zeitgrenzen 60 s ohne `progress.txt`, 10 min ohne `done.txt`; Auftragsordner älter als ein Tag beim Start löschen (Spec 7.1/7.2).
- Abbrechen nur während der Analyse; bis dahin ist im Projekt nichts verändert (Spec 6.2).
- Alle neuen Texte in `lang/en.json`, `lang/de.json`, `lang/tr.json`; Resolve-Begriffe und Beat/Downbeat/Confidence englisch; Vorlage im Repo englisch (`python backend/resolve_plugin.py template`, Test prüft).
- **Standard überall 90 %** (Nutzer 2026-11-13): Web-App-Regler, Resolve-Fenster, und dazu passend Schutz 0,95 als Vorgabe in `analyzer.PROTECT_CONF`, `clamp_protect` (nicht lesbarer Wert), Server und CLI `--protect`.
- Web-App: Kachel Taktart ändert ihre Höhe beim Verstellen nicht (Infobereich immer 2 Zeilen hoch, Fortschritts-/Fehlerzeile ändert die Höhe nicht).
- Version 0.1.5, Changelog, Release Notes `docs/releases/0.1.5.md` (ab 0.1.4), Test-Liste `docs/resolve-test-tp3.md`, `dist/` neu bauen.

## Review Focus

1. Clip im Media Pool ohne Dateipfad (z. B. Timeline, Compound Clip) oder mehrere ausgewählt → Weg „Clip analysieren“ gesperrt mit Hinweis, kein Auftrag.
2. Pfade mit Umlauten/Leerzeichen (Song und BeatAnalyzer-Ordner) → Auftrag läuft, nichts bleibt liegen.
3. Abbrechen oder Fenster-X während der Analyse → kein Marker, kein Subtitle, Auftragsordner wird aufgeräumt.
4. Song liegt mehrfach in der Timeline, einmal vorne getrimmt → jeder Timeline-Clip bekommt Marker an der richtigen Stelle, nur innerhalb seines sichtbaren Bereichs.
5. Python endet mit Fehler (`state=error`) oder schreibt nie `progress.txt` → Meldung nach Spec 11.1, nichts im Projekt verändert.

---

### Task 1: `backend/resolve_job.py`

**Files:** Create `backend/resolve_job.py`; Test `backend/tests/test_resolve_job.py`

**Interfaces:**
- Produces: `run_job(job_dir: str, analyze=analyze_audio_file) -> str` (gibt `state` zurück: `ok|error|cancelled`); CLI `python backend/resolve_job.py <job_dir>`. Schreibt `progress.txt` (`step=model|analyze|write`), `markers.json` (= `resolve_marker_data(result)`), `done.txt` (`state=…`, `markers=markers.json`, `message=…`).

- [ ] **Step 1: Tests** (Analyzer ersetzt): `test_ok_writes_markers_and_done` (markers.json gültig, done `state=ok`), `test_passes_smooth_and_protect` (`smooth=0` → `smooth=False`; `protect=0.95`), `test_error_writes_message` (Analyzer wirft → `state=error`, `message=` mit Text, kein markers.json), `test_cancel_between_steps` (`cancel.txt` vorhanden → `state=cancelled`), `test_done_is_written_atomically` (keine `done.txt.tmp` übrig), `test_bad_job_file` (fehlendes `audio=` → `state=error`), `test_umlaut_paths`.
- [ ] **Step 2:** FAIL (Modul fehlt).
- [ ] **Step 3:** Implementieren; `lang` setzt die Sprache für Fehlermeldungen über `i18n`.
- [ ] **Step 4:** Suite grün. **Step 5:** Commit.

### Task 2: Lua – Auftrag schreiben, starten, abfragen (ohne Oberfläche)

**Files:** Modify `resolve/BeatAnalyzer_Markers.lua`; Test `backend/tests/test_resolve_script.py`

**Interfaces:**
- Produces: `M.slider_to_protect(v) -> number`; `M.new_job(audio_path, opts) -> job_dir | nil, err` (schreibt `job.txt`); `M.launch(job_dir) -> ok, err` (ShellExecuteW über ffi, Ersatz `os.execute`); `M.poll(job_dir, started, now) -> { state = "running"|"ok"|"error"|"cancelled"|"no_start"|"timeout", step, markers_path, message }`; `M.cancel(job_dir)`; `M.cleanup_jobs(now)` (älter als 1 Tag); `M.analysis_target(media_pool) -> clip | nil, reason` (genau ein Clip mit `File Path`).

- [ ] **Step 1: Tests:** Umrechnung (0 → aus, 90 → 0.95, 100 → 1.0); `job.txt`-Inhalt inkl. Umlaut-Pfad; `poll` für alle Zustände inkl. 60 s ohne progress und 10 min ohne done; `cleanup_jobs` löscht nur alte Ordner; `analysis_target` bei 0, 1, 2 ausgewählten Clips und Clip ohne Dateipfad; `launch` ruft im Mock den Ersatzweg mit `pythonw.exe`-Pfad aus dem Konfigurationsblock.
- [ ] **Step 2:** FAIL. **Step 3:** Implementieren. **Step 4:** grün. **Step 5:** Commit.

### Task 3: Lua – Marker auf Timeline-Clips

**Files:** Modify `resolve/BeatAnalyzer_Markers.lua` (Job-Phase nach den Media-Pool-Markern, `removal_targets`/`M.remove`, `M.explanation`); Mock in `backend/tests/test_resolve_script.py` um `TimelineItem:AddMarker/GetMarkers/DeleteMarkerByCustomData/GetLeftOffset/GetStart/GetEnd` erweitern; Texte in `lang/*.json`.

**Interfaces:**
- Produces: `M.timeline_items(tl, clips) -> { item, … }` (alle Audio- und Video-Clips des Songs); Marker-Frame im Item = Marker-Frame im Clip − `GetLeftOffset()`, nur wenn 0 ≤ Frame < Dauer des Items; gleicher `customData`-Tag; Ergebnis meldet „n Marker auf k Clips in der Timeline“.

- [ ] **Step 1: Tests:** Song einmal ungetrimmt, einmal mit LeftOffset 50 → Frames verschoben, außerhalb liegende fehlen; kein Song in der Timeline → keine Timeline-Marker; Entfernen löscht Timeline-Marker mit Tag, fremde bleiben; Erklärungstext nennt die Timeline-Marker; gleiche Marker wie bisher im Media Pool.
- [ ] **Step 2:** FAIL. **Step 3:** Implementieren (in Häppchen wie `M.CHUNK`). **Step 4:** grün. **Step 5:** Commit.

### Task 4: Lua – Fenster: zwei Wege, Regler „Glätten“, Analyse-Schritt mit Abbrechen

**Files:** Modify `resolve/BeatAnalyzer_Markers.lua` (`M.main`, `M.load_settings`/`M.save_settings`), `lang/*.json`, Vorlage; Test `backend/tests/test_resolve_dialog.py`

**Interfaces:**
- Consumes: Task 2 (`new_job`, `launch`, `poll`, `cancel`, `cleanup_jobs`, `analysis_target`, `slider_to_protect`), Task 3, bestehendes `M.start(path, opts)` mit neuem `opts.clips` (festgehaltener Ziel-Clip).
- Produces: Einstellung `smooth_slider` (Standard 90) in `plugin.txt`; Häkchen `WayAnalyze`/`WayJson`; Regler `Smooth` (ui:Slider 0–100) mit Wertanzeige; Knopf `Cancel`.

- [ ] **Step 1: Tests** (UI-Mock): Weg-Häkchen schließen sich aus; Weg „analysieren“ zeigt Clip-Zeile aus der Auswahl, OK gesperrt ohne gültigen Clip; Regler Standard 90, wird gespeichert; OK startet Auftrag (`job.txt` mit `protect=0.95`), Schritt 1 zeigt Fortschritt aus `progress.txt`; `done.txt` ok → Marker wie beim JSON-Weg auf genau dem festgehaltenen Clip; Abbrechen → `cancel.txt`, Rückkehr zur Auswahl, keine Marker; `state=error` → Meldung, keine Marker; X während der Analyse = Abbrechen; JSON-Weg unverändert (bestehende Tests grün).
- [ ] **Step 2:** FAIL. **Step 3:** Implementieren; Höhen mit `fit()` wie bisher. **Step 4:** grün inkl. Vorlagen-Test. **Step 5:** Commit.

### Task 5: Web-App – Kachel Taktart mit fester Höhe, Standard 90 %

**Files:** Modify `src/components/MetricsCards.tsx`, `src/App.tsx` (Vorgabe Schutz 0,95), Tooltip „Standard: 90 %“; `backend/analyzer.py` (`PROTECT_CONF = 0.95`), `backend/analyze_cli.py` (Vorgabe), Tests mit bisheriger Vorgabe 0,85 anpassen; Prüfung Playwright im Scratchpad

- [ ] **Step 1:** Prüfskript: Regler startet bei 90 %, erste Analyse schickt `protect=0.95`; Python-Test: Vorgabe von `analyze_audio_file`, `clamp_protect('abc')` und CLI ist 0,95. Höhe der Kachel bei „nicht geglättet“, bei zwei Zeilen und während der Neuberechnung (Fortschrittszeile) sowie mit Fehlerzeile identisch.
- [ ] **Step 2:** gegen aktuellen Build → FAIL. **Step 3:** Infobereich mit fester Mindesthöhe (2 Zeilen), Fortschritt/Fehler in einem Bereich fester Höhe (einzeilig, Rest im Tooltip). **Step 4:** PASS, `npm run lint`. **Step 5:** Commit.

### Task 6: Abschluss

- [ ] Version 0.1.5 (VERSION, package.json, package-lock.json, beide Lua-Skripte, README), CHANGELOG, `docs/releases/0.1.5.md`, `docs/resolve-test-tp3.md` (Liste zum Abhaken: beide Wege, Abbrechen, X, Umlaute, getrimmter Timeline-Clip, Entfernen, Zeitgrenzen, Regler), `npm run build` bis `dist/` stabil, Suite grün; Commit.
