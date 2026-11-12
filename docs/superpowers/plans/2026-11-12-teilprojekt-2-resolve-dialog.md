# Teilprojekt 2 „Resolve-Dialog mit dem JSON-Weg“ – Umsetzungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Das Resolve-Skript bekommt ein eigenes Fenster: JSON wählen, Ziel-Clip und Timeline prüfen, Häkchen mit Erklärung, Markerfarben pro Zählzeit, gesperrte Arbeit mit Fortschritt, Ergebnis, „BeatAnalyzer-Marker entfernen“ und gemerkte Einstellungen; SRT-Dateien nur noch im Arbeitsordner, im Media Pool nur die vollständige SRT.

**Architecture:** `resolve/BeatAnalyzer_Markers.lua` bleibt eine Datei. Die Logik (Prüfen, Farben, Ablauf in Schritten, Entfernen, Einstellungen) liegt in Funktionen am Modul `M` und ist ohne Fenster testbar. Das Fenster in `M.main()` ruft nur diese Funktionen auf; ein Timer (50 ms) aktualisiert in der Auswahl einmal pro Sekunde und arbeitet während der Arbeit die Marker in Häppchen ab. Alle Texte kommen aus dem Bereich `plugin` der Sprachdateien.

**Tech Stack:** LuaJIT in DaVinci Resolve Studio 21.2 (Fusion UIManager), Tests mit Python `unittest` und `lupa` gegen einen Resolve-Nachbau.

**Spec:** `docs/superpowers/specs/2026-11-12-resolve-dialog-und-sprachen-design.md` (Abschnitte 6, 11; Begriffe Abschnitt 3; Teilprojekt 2 in Abschnitt 5)

## Global Constraints

- Begriffe: Resolve-Begriffe englisch (Media Pool, Timeline, Marker, Subtitle, Subtitle Track); Beat, Downbeat, Confidence englisch; „Media Pool“ getrennt, keine zusammengesetzten Wörter damit („Ordner **BeatAnalyzer** im Media Pool“).
- Alle sichtbaren Texte über `T("plugin.…")`; jeder neue Schlüssel steht in `lang/en.json`, `lang/de.json`, `lang/tr.json` (Türkisch nach Glossar, `_meta.review` bleibt). Nach jeder Änderung an `lang/*.json`: `venv/bin/python backend/resolve_plugin.py template` (Test `test_repo_script_carries_english_template`).
- Markerfarben von Resolve, genau diese 16: Blue, Cyan, Green, Yellow, Red, Pink, Purple, Fuchsia, Rose, Lavender, Sky, Mint, Lemon, Sand, Cocoa, Cream. Vorgabe: Downbeat Red, alle anderen Cyan.
- Längenprüfung ab 0,5 s Unterschied (Warnung, Start bleibt möglich).
- Unverändert: Marker-Kennung `beatthis`, Track-Präfix `BeatAnalyzer - `, Ordner `BeatAnalyzer`, Format-Kennung der JSON, `local VERSION`.
- Die Subtitles enthalten immer alle Beats, auch bei „kein Marker“.
- Kein Abbrechen während der Arbeit (das kommt mit der Analyse in Teilprojekt 3).
- Tests: `venv/bin/python -m unittest discover -s backend/tests`; Lua-Tests brauchen `lupa`.

## Review Focus

1. **Song mit Umlauten im Dateinamen** (`Müller Song.wav`): SRT im Arbeitsordner wird geschrieben, importiert und danach gelöscht; unter Windows über `_wremove`. → Task 2.
2. **Timeline wird während der Arbeit gewechselt:** Der Subtitle Track landet in der Timeline, die beim Klick auf OK offen war. → Task 4.
3. **X während der Arbeit:** Fenster bleibt offen, Arbeit läuft zu Ende. → Task 8.
4. **`plugin.txt` kaputt oder mit unbekannter Farbe:** Vorgaben statt Fehler. → Task 7.
5. **Taktart mit mehr als 4 Zählzeiten (6/8, 7/8) und 3/4:** Zählzeit 5 und mehr nimmt „übrige“; bei 3/4 bleibt Beat 4 ungenutzt. → Task 3.

---

### Task 1: Meldungen über Texte

**Files:**
- Modify: `lang/en.json`, `lang/de.json`, `lang/tr.json` (neuer Bereich `plugin`)
- Modify: `resolve/BeatAnalyzer_Markers.lua` (`validate`, `place_in_timeline`, `M.apply`, `show`)
- Test: `backend/tests/test_resolve_script.py`

**Interfaces:**
- Consumes: `M.T`, `BA`-Block (Teilprojekt 1).
- Produces: Schlüssel `plugin.msg_*`. Englisch = die heutigen englischen Meldungen, damit sich die bestehenden Tests nicht ändern:

| Schlüssel | Englisch | Deutsch |
|---|---|---|
| `msg_not_json` | The file is not a BeatAnalyzer marker JSON. | Die Datei ist keine Marker-JSON von BeatAnalyzer. |
| `msg_bad_format` | Unknown format '{format}', expected '{expected}'. Export the file in BeatAnalyzer under Export -> DaVinci Resolve. | Unbekanntes Format „{format}“, erwartet „{expected}“. Die Datei in BeatAnalyzer unter Exportieren → DaVinci Resolve exportieren. |
| `msg_no_markers` | The JSON contains no markers. | Die JSON enthält keine Marker. |
| `msg_cannot_read` | Cannot read the file: {path} | Datei nicht lesbar: {path} |
| `msg_no_project` | No project is open. | Kein Projekt offen. |
| `msg_no_clip` | No clip found. Select the audio clip in the media pool, or import '{file}' into the media pool. | Kein Clip gefunden. Den Audio-Clip im Media Pool auswählen oder „{file}“ in den Media Pool importieren. |
| `msg_markers` | {n} markers on {clips} clip(s): {names} | {n} Marker auf {clips} Clip(s): {names} |
| `msg_skipped` | {n} markers skipped (outside the clip or not accepted by Resolve). | {n} Marker übersprungen (außerhalb des Clips oder von Resolve abgelehnt). |
| `msg_other_file` | Note: the selected clip is not '{file}' from the JSON. | Hinweis: Der ausgewählte Clip ist nicht „{file}“ aus der JSON. |
| `msg_srt_ok` | Subtitles: {srt} in media pool bin '{bin}' | Subtitle: {srt} im Ordner {bin} im Media Pool |
| `msg_srt_write` | Subtitles: cannot write {path} | Subtitle: {path} lässt sich nicht schreiben |
| `msg_srt_import` | Subtitles: {why} - import {path} by hand | Subtitle: {why} – {path} von Hand importieren |
| `msg_bin_missing` | media pool bin '{bin}' not available | Ordner {bin} im Media Pool nicht verfügbar |
| `msg_not_imported` | Resolve did not import {path} | Resolve hat {path} nicht importiert |
| `msg_tl_empty` | Timeline: no beats in the part of the song that is in the timeline. | Timeline: Im Teil des Songs, der in der Timeline liegt, gibt es keine Beats. |
| `msg_tl_write` | Timeline: cannot write {path} | Timeline: {path} lässt sich nicht schreiben |
| `msg_tl_import` | Timeline: {why} | Timeline: {why} |
| `msg_tl_add` | Timeline: cannot add a subtitle track. | Timeline: Subtitle Track lässt sich nicht anlegen. |
| `msg_tl_activate` | Timeline: cannot activate the new subtitle track. | Timeline: Der neue Subtitle Track lässt sich nicht aktivieren. |
| `msg_tl_none_placed` | Timeline: Resolve placed no subtitles. | Timeline: Resolve hat keine Subtitles platziert. |
| `msg_tl_ok` | Timeline: {n} subtitles on track ST{track} '{name}'{replaced} | Timeline: {n} Subtitles auf Track ST{track} „{name}“{replaced} |
| `msg_tl_replaced` |  (old track replaced) |  (alter Track ersetzt) |
| `msg_tl_count` | Timeline: placed {placed} subtitles, the SRT has {count}. | Timeline: {placed} Subtitles platziert, die SRT hat {count}. |
| `msg_tl_offset` | Timeline: first subtitle at frame {actual}, expected {expected} (difference {diff} frames). Please run resolve/tools/probe_timeline.lua and send the console output. | Timeline: Erster Subtitle bei Frame {actual}, erwartet {expected} (Unterschied {diff} Frames). Bitte resolve/tools/probe_timeline.lua ausführen und die Ausgabe der Console schicken. |

Konsolenzeilen über `log()` bleiben englisch.

- [ ] **Step 1: Test schreiben** – `test_german_messages`: `load_lang("de")`, `run_apply()` → `msg` beginnt mit `"8 Marker auf 1 Clip(s): Song"`; mit Auswahl `other` (wie `test_selected_clip_wins_and_note_about_other_file`) enthält `msg` `"Hinweis: Der ausgewählte Clip ist nicht „Müller Song.wav“ aus der JSON."`; `M.apply` mit Datei ohne `format` → `msg` beginnt mit `"Unbekanntes Format"`.
- [ ] **Step 2: Fehlschlag sehen** – Run: `venv/bin/python -m unittest discover -s backend/tests -p "test_resolve_script.py"` → FAIL (englischer Text statt deutscher)
- [ ] **Step 3: Schlüssel in die drei Sprachdateien, Meldungen im Skript über `T`, Vorlage neu schreiben** (`backend/resolve_plugin.py template`)
- [ ] **Step 4: Alle Tests laufen lassen** → OK (bestehende englische Erwartungen unverändert grün)
- [ ] **Step 5: Commit** – `git commit -m "Resolve-Skript: Meldungen über die Sprachdateien"`

---

### Task 2: Arbeitsordner für die SRT-Dateien, Zwischen-Clip löschen

**Files:**
- Modify: `resolve/BeatAnalyzer_Markers.lua` (Dateien `:300-400`, `srt_path`, `import_subtitles`, `place_in_timeline`, `M.apply`)
- Test: `backend/tests/test_resolve_script.py`

**Interfaces:**
- Produces:
  - `M.work_dir() -> string|nil` – legt `<BA.home>/resolve_temp/<JJJJMMTT-hhmmss>-<4 Ziffern>/` an (ohne `BA.home`: Temp-Ordner des Systems aus `TEMP`, `TMP`, sonst `/tmp`), Trenner `\` unter Windows, sonst `/`; anlegen über `bmd.createdir`, sonst `os.execute` (`mkdir "…"` unter Windows, `mkdir -p "…"` sonst); `nil`, wenn es scheitert
  - `M.remove_file(path) -> boolean` – unter Windows mit Nicht-ASCII über `_wremove` (ffi, wie `wide_open`), sonst `os.remove`
  - `M.remove_dir(path) -> boolean` – `bmd.removedir`, sonst `os.remove` (leerer Ordner)
  - `M.apply(path, opts)`: beide SRTs entstehen im Arbeitsordner (nicht mehr neben der JSON); nach erfolgreichem Platzieren wird der Clip `<Song> (Timeline).srt` mit `DeleteClips` aus dem Media Pool gelöscht; nach erfolgreichem Import beider Dateien werden Dateien und Arbeitsordner gelöscht; scheitert ein Import, bleiben Datei und Ordner liegen und die Meldung nennt den Pfad
  - `opts.work_dir` (string) ersetzt `M.work_dir()` – nur für Tests

- [ ] **Step 1: Tests anpassen und schreiben** (Konfiguration mit `home = self.tmp` laden, damit der Arbeitsordner unter `self.tmp/resolve_temp` liegt):
  - `test_subtitles_are_written_and_imported_with_song_name`: SRT-Text aus dem Mock lesen (`MOCK.imported`-Pfad, Datei existiert zum Zeitpunkt des Imports – Mock liest den Text beim Import mit `PY_READ` in `c.text`), danach: `self.assertFalse((self.tmp / "Müller Song.srt").exists())`, kein Ordner unter `self.tmp / "resolve_temp"` mehr vorhanden
  - `test_timeline_subtitles_under_the_song`: `sorted(self.bin_clips()) == ["Müller Song.srt"]` (statt beider Clips), Subtitles stehen weiter in der Timeline (Starts wie bisher)
  - neu `test_failed_import_keeps_the_file`: Mock-Import liefert `{}` → `msg` enthält `"import"` und den Pfad; Datei existiert noch
- [ ] **Step 2: Fehlschlag sehen** → FAIL (SRT liegt neben der JSON, beide Clips im Ordner)
- [ ] **Step 3: Umsetzen** – der Mock speichert beim `ImportMedia` den Dateitext (`c.text = PY_READ(p)`), `AppendToTimeline` liest `c.text` statt der Datei
- [ ] **Step 4: Alle Tests laufen lassen** → OK
- [ ] **Step 5: Commit** – `git commit -m "Resolve-Skript: SRT nur im Arbeitsordner, Zwischen-Clip wird gelöscht"`

---

### Task 3: Markerfarben pro Zählzeit

**Files:**
- Modify: `resolve/BeatAnalyzer_Markers.lua` (Einstellungen oben, `mark_clip`)
- Test: `backend/tests/test_resolve_script.py`

**Interfaces:**
- Produces:
  - `M.MARKER_COLORS` – die 16 Farben in der Reihenfolge aus den Global Constraints
  - `M.NO_MARKER = "none"`
  - `M.DEFAULT_COLORS = { downbeat = "Red", beat2 = "Cyan", beat3 = "Cyan", beat4 = "Cyan", other = "Cyan" }` (aus `DOWNBEAT_COLOR` und `BEAT_COLOR` oben im Skript, die bleiben)
  - `M.marker_color(m, colors) -> string|nil` – `type == "downbeat"` → `colors.downbeat`; `beat` 2–4 → `colors.beat<n>`; sonst `colors.other`; `"none"` oder unbekannte Farbe → `nil` bei `"none"`, Vorgabe bei unbekannt
  - `M.apply(path, opts)`: `opts.colors` (Tabelle wie `DEFAULT_COLORS`); `nil` → kein Marker, zählt nicht als übersprungen

- [ ] **Step 1: Tests schreiben**

```python
def test_colors_per_beat(self):
    self.run_apply(colors={"downbeat": "Green", "beat2": "Yellow", "beat3": "none", "beat4": "Pink", "other": "Cyan"})
    marks = self.markers(self.mock.song)
    self.assertEqual([marks[f]["color"] for f in sorted(marks)], ["Green", "Yellow", "Pink", "Green", "Yellow", "Pink"])
    # Subtitles keep all 8 beats
    self.assertEqual(len(self.srt_cues()), 9)

def test_meters_with_more_than_four_beats(self):
    m = lambda typ, beat: self.lua.table_from({"type": typ, "beat": beat})
    c = {"downbeat": "Red", "beat2": "Blue", "beat3": "Green", "beat4": "Yellow", "other": "Sand"}
    tc = self.lua.table_from(c)
    self.assertEqual([self.M.marker_color(m("beat", b), tc) for b in (2, 3, 4, 5, 6, 7)],
                     ["Blue", "Green", "Yellow", "Sand", "Sand", "Sand"])
    self.assertEqual(self.M.marker_color(m("downbeat", 1), tc), "Red")

def test_unknown_color_falls_back_to_default(self):
    tc = self.lua.table_from({"downbeat": "Purpur", "beat2": "Cyan", "beat3": "Cyan", "beat4": "Cyan", "other": "Cyan"})
    self.assertEqual(self.M.marker_color(self.lua.table_from({"type": "downbeat", "beat": 1}), tc), "Red")

def test_only_downbeats_by_colors(self):
    self.run_apply(colors={"downbeat": "Red", "beat2": "none", "beat3": "none", "beat4": "none", "other": "none"})
    self.assertEqual(sorted(self.markers(self.mock.song)), [13, 63])
```

(`run_apply(json_overrides=None, colors=None)` gibt `colors` als `opts.colors` an `M.apply`; 8 Beats im 4/4 → Downbeats bei 0,5 s und 2,5 s.)

- [ ] **Step 2: Fehlschlag sehen** → FAIL `marker_color` fehlt
- [ ] **Step 3: Umsetzen**
- [ ] **Step 4: Alle Tests laufen lassen** → OK
- [ ] **Step 5: Commit** – `git commit -m "Resolve-Skript: Markerfarbe pro Zählzeit, auch kein Marker"`

---

### Task 4: Ablauf in Schritten

**Files:**
- Modify: `resolve/BeatAnalyzer_Markers.lua` (`mark_clip`, `M.apply`)
- Test: `backend/tests/test_resolve_script.py`

**Interfaces:**
- Consumes: `M.apply`-Optionen aus Task 2 und 3.
- Produces:
  - `M.CHUNK = 20` – Marker pro Schritt
  - `M.start(path, opts) -> job|nil, string` – liest und prüft wie `M.apply`, hält Projekt, Media Pool, Ziel-Clips und **Timeline beim Start** fest (`opts.timeline`: ein Timeline-Objekt, `false` = keine Timeline, `nil` = aktuelle Timeline); Fehler → `nil, msg`
  - `job:step() -> boolean` – ein Schritt; `true`, wenn fertig. Phasen `job.phase`: `"markers"` (je Schritt bis `M.CHUNK` Marker; alte eigene Marker werden im ersten Schritt eines Clips entfernt), `"subtitles"`, `"timeline"`, `"done"`
  - Felder: `job.marked` (gesetzte Marker bisher), `job.total` (Marker, die gesetzt werden sollen, ohne „kein Marker“), `job.ok`, `job.msg` (nach `"done"`), `job.srt_name`, `job.track_name`, `job.timeline_name` (oder `nil`)
  - `M.apply(path, opts)` = `M.start` + `step()` bis fertig, gibt `job.ok, job.msg` zurück (Rückgabe wie bisher)

- [ ] **Step 1: Tests schreiben**

```python
def test_job_runs_in_chunks(self):
    data = resolve_marker_data(sample_result(n_beats=50, interval=0.2))   # 10 s, passt in den 20-s-Clip
    job, err = self.M.start(self.write_json(data), None)
    self.assertEqual((job.phase, job.total, job.marked), ("markers", 50, 0))
    self.assertFalse(job.step()); self.assertEqual(job.marked, 20)
    self.assertFalse(job.step()); self.assertEqual(job.marked, 40)
    while not job.step():
        pass
    self.assertEqual(job.phase, "done"); self.assertTrue(job.ok)
    self.assertEqual(len(self.markers(self.mock.song)), 50)

def test_timeline_is_fixed_at_start(self):
    tl = self.setup_timeline()
    job, _ = self.M.start(self.write_json(resolve_marker_data(sample_result())), None)
    self.lua.execute("MOCK.timeline = MOCK.new_timeline(25, 0)")   # Nutzer wechselt die Timeline
    while not job.step():
        pass
    self.assertEqual(len(self.sub_tracks(tl)), 1)                  # Track in der Timeline vom Start

def test_no_timeline_when_switched_off(self):
    tl = self.setup_timeline()
    self.M.apply(self.write_json(resolve_marker_data(sample_result())), self.lua.table_from({"timeline": False}))
    self.assertEqual(self.sub_tracks(tl), [])
```

- [ ] **Step 2: Fehlschlag sehen** → FAIL `start` fehlt
- [ ] **Step 3: Umsetzen** – Wenn `AppendToTimeline` in der festgehaltenen Timeline platzieren soll, die aber nicht mehr die aktuelle ist: vor dem Platzieren `project:SetCurrentTimeline(job.timeline)` (wie im Workbench: „switches back to the timeline of the job“); der Mock bekommt `SetCurrentTimeline`.
- [ ] **Step 4: Alle Tests laufen lassen** → OK
- [ ] **Step 5: Commit** – `git commit -m "Resolve-Skript: Ablauf in Schritten, Timeline beim Start festgehalten"`

---

### Task 5: Prüfungen für die Auswahl

**Files:**
- Modify: `resolve/BeatAnalyzer_Markers.lua` (neuer Abschnitt „Selection“ vor „Dialogs“), `lang/*.json`
- Test: `backend/tests/test_resolve_script.py`

**Interfaces:**
- Consumes: `target_clips`, `first_use`, `validate`, `parse_fps`, `exact_fps`.
- Produces:
  - `M.LENGTH_TOLERANCE = 0.5`
  - `M.fmt_length(seconds) -> string` – `"3:42"` (m:ss, Sekunden gerundet)
  - `M.timecode(frame, fps) -> string` – `"01:00:12:00"` (ganzzahlige Bildrate `round(fps)`)
  - `M.engine_text(engine) -> string|nil` – aus dem Feld `engine` der JSON: `"beat_this (CUDA, RTX 3080)"`, `"beat_this (CPU)"` (Gerät in Großbuchstaben, GPU nur wenn vorhanden), `"librosa – <T(plugin.reason_<fallbackReason>)>"`; ohne Feld `nil`
  - `M.prepare(path) -> info` mit `info.ok` (Start möglich), `info.error` (Text oder `nil`), `info.data`, `info.clips`, `info.file_name`, `info.song` (Name ohne Endung), `info.clip_text` (`"Song.mp3 im Media Pool · 3:42"`), `info.warnings` (Liste: anderer Dateiname, Länge), `info.engine` (Text oder `nil`)
  - `M.timeline_info(tl, clips) -> table` – `{ state = "none" }` ohne Timeline; `{ state = "absent", name = … }`; `{ state = "present", name = …, track = <Audiospur>, tc = <Timecode des Clipanfangs> }`
  - `M.explanation(checked, tinfo, song) -> string` – die vier Fassungen aus Spec 6.2

Neue Texte (`plugin.*`, Englisch / Deutsch; Türkisch nach Glossar):

| Schlüssel | Englisch | Deutsch |
|---|---|---|
| `clip_found` | {names} in the Media Pool · {length} | {names} im Media Pool · {length} |
| `warn_other_file` | The selected clip is not '{file}' from the JSON. | Der ausgewählte Clip ist nicht „{file}“ aus der JSON. |
| `warn_length` | JSON {json}, clip {clip} – is this the same version of the song? | JSON {json}, Clip {clip} – ist das dieselbe Fassung? |
| `engine` | Analysed with {engine} | Analysiert mit {engine} |
| `reason_not_installed` | beat_this not installed | beat_this nicht installiert |
| `reason_model_load_failed` | beat_this model could not be loaded | Modell von beat_this nicht geladen |
| `reason_inference_failed` | analysis with beat_this failed | Analyse mit beat_this gescheitert |
| `explain_present` | In the Timeline '{timeline}' the song lies on A{track} from {tc}. Below it the Subtitle Track '{track_name}' is created and made active. Resolve allows only one active Subtitle Track; the others stay but are switched off. | In der Timeline „{timeline}“ liegt der Song auf A{track} ab {tc}. Darunter entsteht der Subtitle Track „{track_name}“ und wird aktiv. Resolve erlaubt nur einen aktiven Subtitle Track; die anderen bleiben, werden aber deaktiviert. |
| `explain_absent` | The song is not in the Timeline '{timeline}'. Only the Subtitle in the Media Pool is created. | Der Song liegt nicht in der Timeline „{timeline}“. Es entsteht nur der Subtitle im Media Pool. |
| `explain_no_timeline` | No Timeline is open. Only the Subtitle in the Media Pool is created. | Keine Timeline offen. Es entsteht nur der Subtitle im Media Pool. |
| `explain_off` | The Timeline stays unchanged. The Subtitle with all beats lies in the folder BeatAnalyzer in the Media Pool and can be dragged from there into any Timeline. | Die Timeline bleibt unverändert. Der Subtitle mit allen Beats liegt im Ordner BeatAnalyzer im Media Pool und kann von dort in jede Timeline gezogen werden. |

- [ ] **Step 1: Tests schreiben** (deutsch geladen, wo Text geprüft wird)

```python
def test_prepare_finds_clip_and_length(self):
    self.load_lang("de")
    info = self.M.prepare(self.write_json(resolve_marker_data(sample_result())))
    self.assertTrue(info.ok)
    self.assertEqual(info.clip_text, "Song im Media Pool · 0:20")      # Mock: 500 Frames bei 25 fps
    self.assertEqual(list(info.warnings.values()), [])

def test_prepare_warns_about_length(self):
    data = resolve_marker_data(sample_result()); data["duration"] = 19.4      # 0,6 s Unterschied
    info = self.M.prepare(self.write_json(data))
    self.assertTrue(info.ok)
    self.assertIn("0:19", list(info.warnings.values())[0])
    data["duration"] = 19.6                                                    # 0,4 s: keine Warnung
    self.assertEqual(list(self.M.prepare(self.write_json(data)).warnings.values()), [])

def test_prepare_without_clip_blocks(self):
    data = resolve_marker_data(sample_result()); data["fileName"] = "fehlt.wav"
    info = self.M.prepare(self.write_json(data))
    self.assertFalse(info.ok); self.assertIn("fehlt.wav", info.error)

def test_explanations(self):
    self.load_lang("de")
    tl = self.setup_timeline()
    ti = self.M.timeline_info(tl, self.lua.table_from([self.mock.song]))
    self.assertEqual((ti.state, ti.track, ti.tc), ("present", 1, "01:00:10:00"))
    self.assertTrue(self.M.explanation(True, ti, "Müller Song").startswith(
        "In der Timeline „Timeline 1“ liegt der Song auf A1 ab 01:00:10:00."))
    self.assertTrue(self.M.explanation(False, ti, "Müller Song").startswith("Die Timeline bleibt unverändert."))
    self.assertEqual(self.M.timeline_info(None, self.lua.table_from([self.mock.song])).state, "none")
    self.assertTrue(self.M.explanation(True, self.lua.table_from({"state": "none"}), "x").startswith("Keine Timeline offen."))

def test_engine_text(self):
    t = lambda d: self.M.engine_text(self.lua.table_from(d))
    self.assertEqual(t({"id": "beat_this", "device": "cuda", "gpu": "RTX 3080"}), "beat_this (CUDA, RTX 3080)")
    self.assertEqual(t({"id": "beat_this", "device": "cpu"}), "beat_this (CPU)")
    self.load_lang("de")
    self.assertEqual(t({"id": "librosa", "fallbackReason": "not_installed"}), "librosa – beat_this nicht installiert")
    self.assertIsNone(self.M.engine_text(None))
```

- [ ] **Step 2: Fehlschlag sehen** → FAIL `prepare` fehlt
- [ ] **Step 3: Umsetzen** – `first_use` liefert zusätzlich die Nummer der Audiospur (zweiter Rückgabewert); Texte in die drei Sprachdateien, Vorlage neu schreiben
- [ ] **Step 4: Alle Tests laufen lassen** → OK
- [ ] **Step 5: Commit** – `git commit -m "Resolve-Skript: Prüfungen für den Dialog (Clip, Länge, Timeline, Erklärung)"`

---

### Task 6: BeatAnalyzer-Marker entfernen

**Files:**
- Modify: `resolve/BeatAnalyzer_Markers.lua`, `lang/*.json`
- Test: `backend/tests/test_resolve_script.py`

**Interfaces:**
- Consumes: `remove_own_markers`, `delete_tracks`, `find_bin`.
- Produces:
  - `M.removal(clips, tl) -> table` – was gelöscht würde, ohne zu löschen: `{ markers = <Anzahl eigener Marker>, tracks = <Anzahl Tracks "BeatAnalyzer - <Song>" und "BeatThis - <Song>">, srt_clips = <Anzahl Clips "<Song>.srt" und "<Song> (Timeline).srt" im Ordner BeatAnalyzer>, song = <Name ohne Endung>, text = T("plugin.remove_confirm", …) }`; `<Song>` = Dateiname des ersten Clips ohne Endung
  - `M.remove(clips, tl) -> table` – löscht genau das und gibt `{ markers, tracks, srt_clips, text = T("plugin.remove_done", …) }` zurück
  - Eigene Marker zählen: Marker mit Kennung `beatthis` über `GetMarkers()` (Mock bekommt `GetMarkers`)

| Schlüssel | Englisch | Deutsch |
|---|---|---|
| `btn_remove` | Remove BeatAnalyzer markers | BeatAnalyzer-Marker entfernen |
| `remove_confirm` | Remove from '{song}': {markers} BeatAnalyzer markers, {tracks} Subtitle Track(s) in the open Timeline, {srt} Subtitle clip(s) in the folder BeatAnalyzer? Markers set by hand stay. | Aus „{song}“ entfernen: {markers} BeatAnalyzer-Marker, {tracks} Subtitle Track(s) in der offenen Timeline, {srt} Subtitle-Clip(s) im Ordner BeatAnalyzer? Von Hand gesetzte Marker bleiben. |
| `remove_done` | Removed: {markers} markers, {tracks} Subtitle Track(s), {srt} Subtitle clip(s). | Entfernt: {markers} Marker, {tracks} Subtitle Track(s), {srt} Subtitle-Clip(s). |
| `remove_nothing` | Nothing from BeatAnalyzer found on '{song}'. | Nichts von BeatAnalyzer an „{song}“ gefunden. |
| `btn_remove_yes` | Remove | Entfernen |

- [ ] **Step 1: Tests schreiben**

```python
def test_removal_counts_then_removes(self):
    tl = self.setup_timeline()
    self.run_apply()
    self.mock.song.markers[400] = self.lua.table_from({"color": "Blue", "name": "Hand", "custom": ""})
    clips = self.lua.table_from([self.mock.song])
    r = self.M.removal(clips, tl)
    self.assertEqual((r.markers, r.tracks, r.srt_clips), (8, 1, 1))
    done = self.M.remove(clips, tl)
    self.assertEqual((done.markers, done.tracks, done.srt_clips), (8, 1, 1))
    self.assertEqual(sorted(self.markers(self.mock.song)), [400])     # Hand-Marker bleibt
    self.assertEqual(self.sub_tracks(tl), [])
    self.assertEqual(self.bin_clips(), [])

def test_removal_with_nothing_there(self):
    self.load_lang("de")
    r = self.M.removal(self.lua.table_from([self.mock.song]), None)
    self.assertEqual((r.markers, r.tracks, r.srt_clips), (0, 0, 0))
```

- [ ] **Step 2: Fehlschlag sehen** → FAIL `removal` fehlt
- [ ] **Step 3: Umsetzen**, Texte, Vorlage
- [ ] **Step 4: Alle Tests laufen lassen** → OK
- [ ] **Step 5: Commit** – `git commit -m "Resolve-Skript: BeatAnalyzer-Marker, Track und Subtitle entfernen"`

---

### Task 7: Einstellungen des Dialogs merken

**Files:**
- Modify: `resolve/BeatAnalyzer_Markers.lua`
- Test: `backend/tests/test_resolve_script.py`

**Interfaces:**
- Produces:
  - `M.settings_path() -> string|nil` – `<BA.home>/resolve_temp/plugin.txt`; ohne `BA.home` `nil`
  - `M.load_settings() -> table` – Vorgaben `{ json_dir = "", timeline = true, colors_open = false, colors = <Kopie von M.DEFAULT_COLORS>, geometry = nil }`; Datei Zeilen `schlüssel=wert`, `#` am Zeilenanfang ist Kommentar; Schlüssel `json_dir`, `timeline` (`1`/`0`), `colors_open` (`1`/`0`), `color_downbeat`, `color_beat2`, `color_beat3`, `color_beat4`, `color_other`, `geometry` (`x,y,w,h`); unbekannte Farbe, kaputte Zeile, fehlende oder unlesbare Datei → Vorgabe
  - `M.save_settings(s) -> boolean` – schreibt alle Schlüssel (legt `resolve_temp` an, wenn nötig); ohne `BA.home` `false`

- [ ] **Step 1: Tests schreiben** (Konfiguration mit `home = self.tmp`)

```python
def test_settings_round_trip(self):
    s = self.M.load_settings()
    self.assertEqual((s.timeline, s.colors_open, s.colors.downbeat), (True, False, "Red"))
    s.json_dir = str(self.tmp / "Ördner"); s.timeline = False; s.colors.beat3 = "none"
    self.assertTrue(self.M.save_settings(s))
    s2 = self.M.load_settings()
    self.assertEqual((s2.json_dir, s2.timeline, s2.colors.beat3), (str(self.tmp / "Ördner"), False, "none"))

def test_broken_settings_give_defaults(self):
    (self.tmp / "resolve_temp").mkdir()
    (self.tmp / "resolve_temp" / "plugin.txt").write_text("kaputt\ncolor_downbeat=Purpur\ntimeline=vielleicht\n", encoding="utf-8")
    s = self.M.load_settings()
    self.assertEqual((s.colors.downbeat, s.timeline), ("Red", True))

def test_no_settings_without_home(self):
    self.load_script(SCRIPT)                       # Vorlage: BA.home = nil
    self.assertIsNone(self.M.settings_path())
    self.assertFalse(self.M.save_settings(self.M.load_settings()))
```

- [ ] **Step 2: Fehlschlag sehen** → FAIL `load_settings` fehlt
- [ ] **Step 3: Umsetzen** – Lesen und Schreiben über `read_file` / `write_file` (Umlaute im Pfad)
- [ ] **Step 4: Alle Tests laufen lassen** → OK
- [ ] **Step 5: Commit** – `git commit -m "Resolve-Skript: Dialog-Einstellungen in resolve_temp/plugin.txt"`

---

### Task 8: Das Fenster

**Files:**
- Modify: `resolve/BeatAnalyzer_Markers.lua` (`choose_json`, `show`, `M.main` ersetzen), `lang/*.json`
- Create: `backend/tests/test_resolve_dialog.py` (UI-Nachbau, Muster: `tests/resolve_mock.lua` im WhisperX Workbench – Widgets als Tabellen, `ComboBox:AddItem`, `ui:Timer`, `disp:RunLoop()` ruft ein Python-Szenario auf, `disp:ExitLoop()` setzt `MOCK.exited`)
- Modify: `backend/tests/test_resolve_script.py` (`test_transition_script_starts_the_new_script`: ohne UIManager endet `main()` mit einer Konsolenzeile statt „No file chosen.“ – Erwartung anpassen)

**Interfaces:**
- Consumes: `M.prepare`, `M.timeline_info`, `M.explanation`, `M.start`/`job:step`, `M.removal`/`M.remove`, `M.load_settings`/`M.save_settings`, `M.MARKER_COLORS`, `M.NO_MARKER`.
- Produces: `M.main()`; Fenster-ID `BeatAnalyzerWin`; Element-IDs `JsonPath` (Label), `Choose` (Button), `ClipInfo`, `Warnings`, `Engine` (Labels), `Timeline` (CheckBox), `Explain` (Label), `Colors` (CheckBox), `ColorDownbeat`, `ColorBeat2`, `ColorBeat3`, `ColorBeat4`, `ColorOther` (ComboBox, Einträge: 16 Farben, dann `T("plugin.color_none")`), `Status` (Label), `Remove`, `Close`, `OK`, `RemoveYes` (Buttons); Timer-ID `BATimer`, `Interval = 50`
- Zustände `S.state`: `"select"` → (OK) `"work"` → `"result"`; `"select"` → (Remove) `"confirm"` → `"select"`

Verhalten:
- `"select"`: alle 20 Timer-Ticks (≈ 1 s) `M.prepare` (wenn JSON gewählt) und `M.timeline_info` neu; `OK.Enabled = info.ok`; Farb-ComboBoxen und ihre Labels `Hidden = not Colors.Checked`, danach `win:RecalcLayout()`.
- `Choose`: `fu:RequestFile(<json_dir>, "", { FReqS_Filter = "BeatAnalyzer JSON (*.json)|*.json", FReqS_Title = T("plugin.choose_title") })`.
- OK: Farben und Häkchen lesen, `M.start(path, { colors = …, timeline = Timeline.Checked and <aktuelle Timeline> or false })`; alle Eingaben `Enabled = false`; `Status` zeigt die Schritte nach Spec 6.2 mit `✓`/`…`; je Timer-Tick ein `job:step()`; Zeile Marker mit `"{marked} / {total}"`.
- Fertig: `"result"`, `Status` = `job.msg` (+ Analyse-Programm), nur `Close` aktiv mit Text `T("plugin.btn_ok")`.
- Schließen (`On.BeatAnalyzerWin.Close`, `Close.Clicked`): in `"work"` ignoriert (Logzeile, `win:Show()`); sonst `M.save_settings` (mit Geometrie, wenn lesbar) und `ExitLoop`.
- Ohne `fu.UIManager`/`bmd.UIDispatcher` (Tests, Konsole): Logzeile `"No window available."` und Ende.

Texte (`plugin.*`):

| Schlüssel | Englisch | Deutsch |
|---|---|---|
| `title` | BeatAnalyzer {version} | BeatAnalyzer {version} |
| `json_none` | No JSON chosen. | Keine JSON gewählt. |
| `btn_choose` | Choose … | Auswählen … |
| `choose_title` | BeatAnalyzer – choose marker JSON | BeatAnalyzer – Marker-JSON wählen |
| `check_timeline` | Create a Subtitle Track in the Timeline | Subtitle Track in der Timeline anlegen |
| `check_colors` | Adjust marker colours | Markerfarben anpassen |
| `color_downbeat` | Downbeat | Downbeat |
| `color_beat` | Beat {n} | Beat {n} |
| `color_other` | other | übrige |
| `color_none` | no marker | kein Marker |
| `work_title` | What happens now: | Was jetzt passiert: |
| `step_markers` | Markers on the clip '{clip}' in the Media Pool | Marker auf den Clip „{clip}“ im Media Pool |
| `step_markers_hint` | Resolve sets every marker on its own, this takes a while. | Resolve setzt jeden Marker einzeln, das dauert etwas. |
| `step_bin` | Folder BeatAnalyzer in the Media Pool, Subtitle '{srt}' | Ordner BeatAnalyzer im Media Pool, Subtitle „{srt}“ |
| `step_track` | Subtitle Track '{track}' in '{timeline}' | Subtitle Track „{track}“ in „{timeline}“ |
| `wait` | Please wait – the window closes only at the end. | Bitte warten – das Fenster schließt sich erst am Ende. |
| `btn_close` | Close | Schließen |
| `btn_ok` | OK | OK |
| `btn_cancel` | Cancel | Abbrechen |

- [ ] **Step 1: UI-Nachbau und Tests schreiben** (`test_resolve_dialog.py`, Media-Pool-Mock aus `test_resolve_script.MOCK`, Konfiguration Deutsch mit `home = tmp`)

```python
def test_ok_disabled_until_json_with_clip(self):
    self.run_dialog(lambda: (self.assertFalse(self.item("OK").Enabled), self.close()))

def test_choose_json_shows_clip_and_explanation(self):
    def scenario():
        self.request_file(self.json_path); self.click("Choose"); self.tick(20)
        self.assertEqual(self.item("ClipInfo").Text, "Song im Media Pool · 0:20")
        self.assertTrue(self.item("OK").Enabled)
        self.assertTrue(self.item("Explain").Text.startswith("Keine Timeline offen."))
        self.check("Timeline", False)
        self.assertTrue(self.item("Explain").Text.startswith("Die Timeline bleibt unverändert."))
        self.close()
    self.run_dialog(scenario)

def test_work_blocks_close_and_finishes(self):
    def scenario():
        self.request_file(self.json_path); self.click("Choose"); self.tick(20)
        self.click("OK")
        self.assertFalse(self.item("OK").Enabled)
        self.close()                                         # X während der Arbeit
        self.assertFalse(self.exited())
        self.tick(1)
        self.assertIn("8 / 8", self.item("Status").Text)     # 8 Beats, CHUNK 20 → ein Schritt
        self.tick(5)
        self.assertIn("8 Marker auf 1 Clip(s): Song", self.item("Status").Text)
        self.close()
        self.assertTrue(self.exited())
    self.run_dialog(scenario)

def test_colors_hidden_until_checked_and_used(self):
    def scenario():
        self.assertTrue(self.item("ColorBeat2").Hidden)
        self.check("Colors", True); self.assertFalse(self.item("ColorBeat2").Hidden)
        self.choose("ColorBeat2", 16)                        # Eintrag 16 = kein Marker
        self.request_file(self.json_path); self.click("Choose"); self.tick(20); self.click("OK"); self.tick(10)
        self.close()
    self.run_dialog(scenario)
    self.assertEqual(len(self.markers(self.mock.song)), 6)  # Beat 2 der zwei Takte fehlt

def test_remove_asks_first(self):
    self.M.apply(self.json_path, None)                     # Marker vorher setzen
    def scenario():
        self.request_file(self.json_path); self.click("Choose"); self.tick(20)
        self.click("Remove")
        self.assertTrue(self.item("Status").Text.startswith("Aus „Müller Song“ entfernen: 8 BeatAnalyzer-Marker"))
        self.assertEqual(len(self.markers(self.mock.song)), 8)
        self.click("RemoveYes")
        self.assertTrue(self.item("Status").Text.startswith("Entfernt: 8 Marker"))
        self.assertEqual(len(self.markers(self.mock.song)), 0)
        self.close()
    self.run_dialog(scenario)

def test_settings_saved_on_close(self):
    def scenario():
        self.check("Colors", True); self.choose("ColorBeat2", 16); self.check("Timeline", False)
        self.close()
    self.run_dialog(scenario)
    text = (self.tmp / "resolve_temp" / "plugin.txt").read_text(encoding="utf-8")
    self.assertIn("color_beat2=none\n", text); self.assertIn("timeline=0\n", text); self.assertIn("colors_open=1\n", text)
```

Hilfsmethoden `run_dialog(scenario)`, `item(id)`, `click(id)`, `check(id, on)`, `choose(id, index)`, `tick(n)`, `close()`, `exited()`, `request_file(path)` stehen in der Testklasse und rufen die Mock-Funktionen auf.

- [ ] **Step 2: Fehlschlag sehen** → FAIL (altes `main()` öffnet sofort den Dateidialog)
- [ ] **Step 3: Fenster umsetzen**, Texte in die drei Sprachdateien, Vorlage neu schreiben
- [ ] **Step 4: Alle Tests laufen lassen** → OK
- [ ] **Step 5: Commit** – `git commit -m "Resolve-Skript: eigenes Fenster mit Auswahl, Arbeit und Ergebnis"`

---

### Task 9: CHANGELOG, Gesamtprüfung, Testliste für Resolve

**Files:**
- Modify: `CHANGELOG.md` (Abschnitt `[0.1.0] – in Arbeit`), Kopfkommentar von `resolve/BeatAnalyzer_Markers.lua`
- Create: `docs/resolve-test-tp2.md`

- [ ] **Step 1: CHANGELOG** unter „Geändert“: neues Fenster (JSON, Clip, Länge, Häkchen mit Erklärung, Farben pro Zählzeit, Fortschritt, Entfernen, gemerkte Einstellungen); SRT nur im Arbeitsordner und danach gelöscht; im Ordner BeatAnalyzer nur noch `<Song>.srt`; Meldungen in der eingestellten Sprache.
- [ ] **Step 2: Kopfkommentar des Skripts** an den neuen Ablauf anpassen (Fenster statt Dateidialog, Arbeitsordner, Zwischen-Clip).
- [ ] **Step 3: Testliste** `docs/resolve-test-tp2.md` zum Abhaken in Resolve Studio 21.2 (Spec 11.3), je Punkt: was tun, was erwartet:
  1. Skript starten ohne Auswahl → Fenster, OK gesperrt
  2. JSON wählen → Clip, Länge, Analyse-Programm, Erklärung passend zur offenen Timeline
  3. OK → Fenster bleibt bedienbar und zählt die Marker hoch (sonst: Fenster friert ein, dann Rückmeldung)
  4. X während der Arbeit → Fenster bleibt
  5. Song mit Umlauten → Marker, Subtitle im Ordner BeatAnalyzer, keine SRT neben der JSON, `resolve_temp` leer
  6. Song gekürzt und verschoben in der Timeline → Subtitle Track darunter, `<Song> (Timeline).srt` nicht im Media Pool
  7. Zweiter Lauf → Marker und Track ersetzt
  8. Farben: Beat 2 auf „kein Marker“, 3/4-Song → passende Marker
  9. Entfernen → Nachfrage, danach eigene Marker, Track und Subtitle weg, Hand-Marker bleiben
  10. Resolve neu starten, Skript öffnen → Farben, Häkchen, Ordner gemerkt
- [ ] **Step 4: Alles prüfen** – Run: `venv/bin/python -m unittest discover -s backend/tests` → OK; `npm run lint && npm run build && git status --short dist` → keine Änderung (die Web-App liefert das Lua-Skript mit aus: falls doch geändert, mit committen)
- [ ] **Step 5: Commit** – `git commit -m "Teilprojekt 2: CHANGELOG und Testliste für Resolve"`
