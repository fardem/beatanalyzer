# Regler für das Glätten der Takte – Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ein freier Regler „Schutz klarer 1“ (50–100 %) steuert, wie streng die Takte geglättet werden; ohne 50-%-Grenze; Neu-Rechnen ohne neue Modell-Analyse.

**Architecture:** `smooth_bars` bekommt `protect` statt `bar_share`. `analyze_audio_file` merkt sich Audio und beat_this-Ausgabe der zuletzt analysierten Datei (Schlüssel: SHA-256 des Dateiinhalts) und rechnet bei gleicher Datei nur Glättung und Ausgabe neu. Server und CLI reichen `protect` durch; die Web-App hat einen Regler an der Kachel Taktart und schickt beim Loslassen eine Neu-Analyse mit `protect`, wobei sie das schon dekodierte Audio wiederverwendet.

**Tech Stack:** Python 3.10–3.13 (numpy, unittest), React + TypeScript (Vite), Playwright für die Prüfung der Web-App.

**Spec:** `docs/superpowers/specs/2026-11-12-glaett-regler-design.md`

## Global Constraints

- Regler 50 % bis 100 % in Schritten von 1 %, Standard 85 % (`PROTECT_CONF = 0.85`); 100 % = kein Schutz.
- Häkchen an ⇒ immer geglättet (keine 50-%-Grenze mehr); nur bei beat_this.
- Gleicher `protect`-Wert und gleiche Datei ⇒ gleiches Ergebnis.
- `protect` außerhalb 0,50…1,00 wird begrenzt; nicht lesbarer Wert ⇒ 0,85.
- Texte der Web-App auf Deutsch („Schutz klarer 1“, „n Beats neu eingeteilt · k Neuansätze“, „nicht geglättet“).
- `dist/` neu bauen und committen (CI prüft das).
- Version 0.1.3, Changelog-Eintrag.

## Review Focus

1. Regler wird bewegt, während eine Analyse läuft → keine zweite parallele Analyse, Regler gesperrt wie das Häkchen.
2. Eine andere Datei mit gleichem Namen → Cache darf nicht greifen (Schlüssel ist der Inhalt, nicht der Name).
3. beat_this scheitert beim ersten Lauf (Fallback librosa) → nichts wird gecacht, nächster Lauf versucht beat_this erneut.
4. Häkchen aus, Regler bewegt → kein Neu-Rechnen nötig; Regler ausgegraut.
5. `protect=abc` oder `protect=5` an der API → kein Fehler, Wert begrenzt bzw. Standard.

---

### Task 1: `smooth_bars` mit `protect`, ohne 50-%-Grenze

**Files:**
- Modify: `backend/analyzer.py` (`MIN_BAR_SHARE`, `smooth_bars`, Aufruf in `analyze_audio_file`)
- Test: `backend/tests/test_smooth_bars.py`

**Interfaces:**
- Produces: `smooth_bars(downbeat_conf: List[float], meter: int, protect: float = PROTECT_CONF) -> Dict` mit `{applied, positions, reanchors}`; `clamp_protect(value) -> float` (nimmt str/float/None, gibt 0.5…1.0, Standard 0.85).

- [ ] **Step 1: Tests anpassen und neue schreiben.** Alle bestehenden Aufrufe `smooth_bars(x, meter, share)` → `smooth_bars(x, meter)`. Der Test „weniger als 50 % → applied false“ wird ersetzt durch `test_irregular_song_is_smoothed_too` (Muster mit < 50 % 4er-Takten → `applied is True`). Neu:
  - `test_protect_1_lets_the_grid_overrule_a_clear_one`: Muster `"D...D...D.D...D...D..."` mit dem `D` bei Index 10 = 0.9: mit `protect=1.0` ist 10 keine „1“, mit `protect=0.85` schon.
  - `test_clamp_protect`: `clamp_protect("abc") == 0.85`, `clamp_protect(None) == 0.85`, `clamp_protect(5) == 1.0`, `clamp_protect(0.1) == 0.5`, `clamp_protect("0.9") == 0.9`.
- [ ] **Step 2:** `venv/bin/python -m unittest backend.tests.test_smooth_bars` → FAIL (Signatur, `clamp_protect` fehlt).
- [ ] **Step 3:** Implementieren. `MIN_BAR_SHARE` entfällt. `analyze_audio_file` ruft `smooth_bars(conf, beats_per_bar, protect)`.
- [ ] **Step 4:** Ganze Suite grün; Test `test_analyzer` passt seine Erwartungen nur an, wo die 50-%-Grenze geprüft wurde.
- [ ] **Step 5:** Commit `feat: Glätten mit einstellbarem Schutz, ohne 50-%-Grenze`.

### Task 2: `protect` durch Analyse, Server, CLI; Cache der Modell-Ausgabe

**Files:**
- Modify: `backend/analyzer.py` (`analyze_audio_file`), `backend/server.py` (`handle_analyze`, Ersatz-Stub), `backend/analyze_cli.py`
- Test: `backend/tests/test_analyzer.py`, `backend/tests/test_server_settings.py`

**Interfaces:**
- Consumes: `smooth_bars`, `clamp_protect` (Task 1).
- Produces: `analyze_audio_file(file_path, original_filename, smooth=True, protect=PROTECT_CONF)`; `barSmoothing` = `{applied, meter, changedBeats, reanchors, protect}`; `POST /api/analyze?smoothBars=0|1&protect=<float>`; CLI `--protect <float>`.

- [ ] **Step 1: Tests.**
  - `test_second_run_on_same_file_skips_the_model`: zweimal `analyze_with_fake` auf dieselbe Datei mit `protect` 0.85 und 1.0 → `spect2frames` genau einmal aufgerufen (Zähler in `calls`), `barSmoothing.protect` 0.85 bzw. 1.0; erneut 0.85 → Ergebnis-Beats identisch mit dem ersten Lauf.
  - `test_other_file_content_runs_the_model_again`: zweite Datei mit gleichem Namen, anderem Inhalt → zweiter Modell-Lauf.
  - `test_failed_model_run_is_not_cached`: erster Lauf `frames_raise` → librosa; zweiter Lauf ohne Fehler → beat_this.
  - Server: `test_analyze_passes_protect` (`?protect=0.9` → `analyze_audio_file(..., smooth=True, protect=0.9)`), `?protect=abc` → 0.85, `?protect=5` → 1.0. Der Ersatz-Stub nimmt `protect` an.
- [ ] **Step 2:** Suite → die neuen Tests FAIL.
- [ ] **Step 3:** Implementieren. Cache als Modul-Variable `_LAST = {"key": sha256-hex, "y": y, "sr": sr, "model": (beats, downbeats, beat_prob, downbeat_prob) or None}`; Laden des Audios und Modell-Lauf nur bei neuem Schlüssel; ein gescheiterter Modell-Lauf setzt `model = None` und wird beim nächsten Mal wiederholt. CLI `--protect` (float, begrenzt).
- [ ] **Step 4:** Suite grün.
- [ ] **Step 5:** Commit `feat: Schutz-Wert über Server und CLI; Neu-Rechnen ohne neuen Modell-Lauf`.

### Task 3: Regler in der Web-App

**Files:**
- Modify: `src/components/MetricsCards.tsx`, `src/App.tsx`, `src/utils/audioAnalyzer.ts`, `src/types/analyzer.ts`
- Test: Playwright-Skript im Scratchpad (Server nachgestellt), nicht im Repo

**Interfaces:**
- Consumes: `?protect=` und `barSmoothing.protect`/`reanchors` (Task 2).
- Produces: `analyzeAudioFile(file, name, onProgress, { smoothBars, requireServer, protect, audioBuffer })` – `audioBuffer` überspringt das Dekodieren.

- [ ] **Step 1: Prüfskript schreiben.** Erste Analyse liefert `barSmoothing {applied: true, changedBeats: 5, reanchors: 3, protect: 0.85}`; Erwartet: Kachel zeigt „5 Beats neu eingeteilt · 3 Neuansätze“, Regler steht auf 85. Regler auf 95 ziehen und loslassen → genau ein POST mit `protect=0.95`; Regler während der Analyse gesperrt; nach Antwort zeigt die Kachel die neuen Zahlen. Häkchen aus → Regler gesperrt, Kachel „nicht geglättet“.
- [ ] **Step 2:** Gegen den aktuellen Build laufen lassen → FAIL (kein Regler).
- [ ] **Step 3:** Implementieren: Regler `type="range"` 50–100, lokaler Wert beim Ziehen, Neu-Analyse bei `onPointerUp`/`onKeyUp`, wenn sich der Wert geändert hat; gesperrt bei `!canSmooth || busy || !smoothBars`. App hält `protect` (Standard 0.85, nach Erfolg übernommen wie `smoothBars`) und das letzte `AudioBuffer`.
- [ ] **Step 4:** `npm run lint`, `npm run build`, Prüfskript → PASS.
- [ ] **Step 5:** Version 0.1.3 (VERSION, package.json, package-lock.json, beide Lua-Skripte, README), Changelog, `npm run build`, Suite; Commit `feat: Regler „Schutz klarer 1“ in der Web-App` und `chore: Version 0.1.3`.
