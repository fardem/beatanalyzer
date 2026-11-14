# Nachbesserungen aus dem Resolve-Test (0.1.6) – Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die Rückmeldungen aus dem Resolve-Test von 0.1.5 umsetzen: kurze Texte, bessere Marker-Notiz, ein Subtitle Track je Audiospur, Rücksprung in die zuletzt offene Timeline, Aufräumen nach Abbruch, feste Fensterbreite, weniger Konsolenrauschen, Modell von beat_this bei der Installation vorab laden und Ursachen von Ladefehlern zeigen.

**Architecture:** Alles im Resolve-Skript (`resolve/BeatAnalyzer_Markers.lua`) und in den Sprachdateien, dazu ein kleines Python-Programm `backend/model_check.py`, das `install_and_run.bat` aufruft. Keine neue Abhängigkeit.

**Tech Stack:** LuaJIT (Fusion UIManager), Python 3.10–3.13 (unittest, lupa), Windows-Batch.

**Spec:** `docs/superpowers/notes/2026-11-14-resolve-test-tp3.md` (Testergebnis, Antworten und Wünsche des Nutzers); Gesamtkonzept `docs/superpowers/specs/2026-11-12-resolve-dialog-und-sprachen-design.md` für alles, was dort nicht steht.

## Global Constraints

- **Kurze Texte im Fenster, Details im Tooltip** (Nutzer). Fortschritt mit Überschrift **„Tasks“** (alle Sprachen: de „Tasks“, en „Tasks“, tr „Görevler“), Zeilen ohne Songnamen:
  - de: „Track wird analysiert“, „Marker werden gesetzt“, „Subtitle wird angelegt“, „Subtitle Track in der Timeline“, Fußzeile „Bitte warten …“.
  - Erklärung unter „Subtitle Track“: eine Zeile, z. B. „Subtitle Track kommt unter den Song (A1). Marker auch auf den Clips in der Timeline.“; die bisherige lange Fassung als Tooltip derselben Zeile.
  - Regler-Tooltip (de): „0 % = aus: Takte wie von beat_this.\nMehr % = gleichmäßigeres Raster.\n100 % = voll geglättet; neu angesetzt nur bei klar anderer „1“.\nDie Beats bleiben unverändert.“ (Web-App gleich.)
- **Marker-Notiz** = derselbe Inhalt wie die Subtitle-Zeile des Beats, mit „ | “ getrennt, z. B. „Takt 24 – Beat 2 | 106,860 s | 120,0 BPM | Confidence 75 %“ (Resolve-Begriffe und Beat/Downbeat/Confidence bleiben englisch).
- **Subtitle Track je Audiospur** (Antwort a): für jede Audiospur mit dem Song ein Track „BeatAnalyzer - <Song> (A<n>)“; liegt der Song in einer Spur mehrfach, stehen alle Vorkommen auf diesem Track, jeweils nur im sichtbaren Teil. Entfernen löscht alle diese Tracks (auch die alte Form ohne „(A<n>)“).
- **Nach dem Ende zurück in die Timeline, die vor dem Timeline-Schritt offen war** (Antwort: ok).
- **Aufräumen:** Auftragsordner, deren `done.txt` existiert (Python ist fertig, auch nach Abbruch), werden beim nächsten Öffnen gelöscht; Tagesgrenze nur noch für hängengebliebene; verschwundene Ordner still aus `jobs.txt` entfernen.
- **Fensterbreite:** nach dem Anzeigen die verlangte Größe nochmals setzen, wenn Resolve schmaler gezeichnet hat; beides in der Konsole loggen.
- **Konsolenrauschen:** „ignored entries … not clips“ höchstens einmal pro Fenster.
- **Modell:** `backend/model_check.py` lädt `final0` (wie der Analyzer) und gibt bei Fehlern die eigentliche Ursache aus (die Ausnahme hinter beat_this' „Could not load the checkpoint“), dazu den Cache-Ordner (`torch.hub.get_dir()\checkpoints`), den Dateinamen `beat_this-final0.ckpt` und die Download-Adresse. `install_and_run.bat` ruft es nach der Installation von beat_this auf. Der Analyzer loggt beim Ladefehler ebenfalls die Ursache.
- Version 0.1.6, Changelog, Release Notes `docs/releases/0.1.6.md`, Test-Liste `docs/resolve-test-0.1.6.md`, `dist/` neu bauen (enthält das Lua-Skript).

## Review Focus

1. Song in A1 zweimal (einmal getrimmt) und in A2 einmal → zwei Subtitle Tracks; Track A1 enthält beide Vorkommen, je unter seinem Clip; kein doppelter Eintrag.
2. Zweiter Lauf → alte Tracks (mit und ohne „(A<n>)“) werden ersetzt, nicht vermehrt; „Entfernen“ findet alle.
3. Abgebrochener Auftrag, Python noch nicht fertig (kein `done.txt`) → Ordner bleibt; später mit `done.txt` → beim nächsten Öffnen weg.
4. `model_check.py` ohne beat_this oder ohne Netz → klare Meldung, Exit-Code ≠ 0, Installation läuft weiter (Warnung, kein Abbruch).
5. Rücksprung: Timeline-Schritt ohne Song in der Timeline / ohne Timeline → kein Wechsel, kein Fehler.

---

### Task 1: Kurze Texte, Tooltips, Marker-Notiz

**Files:** Modify `resolve/BeatAnalyzer_Markers.lua` (`M.explanation`, `work_text`, `analysis_text`, Job-Marker-Notiz), `lang/*.json`, `src/components/MetricsCards.tsx` (Regler-Tooltip); Tests `backend/tests/test_resolve_script.py`, `backend/tests/test_resolve_dialog.py`

**Interfaces:** Produces `M.marker_note(m) -> string` (gleiche Teile wie die Subtitle-Zeile); `M.explanation(...)` liefert `text, tooltip`.

- [ ] Tests: Notiz eines Downbeats und eines Beat 2 (de, mit Confidence; ohne Confidence ohne diesen Teil); Erklärung (de) für alle vier Fassungen einzeilig (< 90 Zeichen) und Tooltip mit der langen Fassung; Fortschritt beginnt mit „Tasks“, enthält keinen Songnamen, Zeilen wie oben; Regler-Tooltip (de) wie oben. → RED, implementieren, GREEN, Commit.

### Task 2: Subtitle Track je Audiospur

**Files:** Modify `resolve/BeatAnalyzer_Markers.lua` (`build_srt` mit mehreren Abschnitten, `place_in_timeline`, `removal_targets`/`M.remove`, Erklärung/Track-Name); Tests `backend/tests/test_resolve_script.py`

**Interfaces:** Produces `build_srt(data, { segments = { {shift, from, to}, … } })` (fortlaufende Nummern, nach Zeit sortiert); Track-Namen `TRACK_PREFIX .. base .. " (A" .. n .. ")"`.

- [ ] Tests: Review Focus 1 und 2; ein Song nur auf A1 → ein Track „… (A1)“; Ergebnistext nennt jeden Track. → RED, implementieren, GREEN, Commit.

### Task 3: Rücksprung, Aufräumen, Rauschen, Fensterbreite

**Files:** Modify `resolve/BeatAnalyzer_Markers.lua` (`Job:timeline_step`, `M.cleanup_jobs`, Auswahl-Log, `M.main` nach `win:Show()`); Tests in beiden Lua-Testdateien (Mock: `win:Resize`, Geometrie nach Show schmaler)

- [ ] Tests: Rücksprung in die vorher offene Timeline (und kein Wechsel, wenn keine Timeline/kein Song); Review Focus 3; Log-Zeile „ignored entries“ nur einmal bei 20 Ticks; nach Show mit schmalerer Geometrie wird `Resize` mit der verlangten Größe aufgerufen und geloggt. → RED, implementieren, GREEN, Commit.

### Task 4: Modell vorab laden, Ursachen zeigen

**Files:** Create `backend/model_check.py`; Modify `backend/analyzer.py` (`get_predictor`: Ursache loggen), `install_and_run.bat`; Test `backend/tests/test_model_check.py`

**Interfaces:** Produces `model_check.check(load=...) -> (ok: bool, text: str)`; `cause_of(err) -> str` (innerste Ausnahme über `__cause__`/`__context__`).

- [ ] Tests: Erfolg → ok + „Modell bereit“; ValueError mit `__context__` URLError → Text enthält die Ursache, den Cache-Ordner, `beat_this-final0.ckpt` und die Adresse; beat_this nicht installiert → klare Meldung; `get_predictor` loggt die Ursache. Batch: Aufruf nach der beat_this-Installation, Fehler nur als Warnung (Prüfung durch Lesen, kein Test-Framework für Batch). → RED, implementieren, GREEN, Commit.

### Task 5: Abschluss

- [ ] Version 0.1.6 (VERSION, package.json, package-lock.json, beide Lua-Skripte, README), CHANGELOG, `docs/releases/0.1.6.md`, `docs/resolve-test-0.1.6.md` (offene Punkte aus dem letzten Test + neue: Track je Spur, Rücksprung, Aufräumen nach Abbruch, Fensterbreite, Notiz, kurze Texte, `model_check` in der Installation), `npm run build` bis `dist/` stabil, Suite grün; Commit.
