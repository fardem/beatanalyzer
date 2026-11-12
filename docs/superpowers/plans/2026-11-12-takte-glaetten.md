# Takte glätten – Umsetzungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bei Analysen mit beat_this die Takteinteilung zu einem gleichmäßigen Raster glätten, das nur bei klarer gegenteiliger Evidenz neu ansetzt; abschaltbar pro Song.

**Architecture:** Eine reine Funktion `smooth_bars` in `backend/analyzer.py` rechnet per Viterbi für jeden Beat die Zählzeit aus den Downbeat-Wahrscheinlichkeiten von beat_this. `analyze_audio_file` übernimmt das Ergebnis vor dem Durchnummerieren der Takte. Server (`?smoothBars=0`), Kommandozeile (`--no-smooth-bars`) und Web-App (Häkchen, Neuanalyse) reichen den Schalter durch.

**Tech Stack:** Python/NumPy (`unittest`), React/TypeScript.

**Spec:** `docs/superpowers/specs/2026-11-12-takte-glaetten-design.md`

## Global Constraints

- Nur bei beat_this glätten (`beat_prob is not None`); librosa und Browser unverändert.
- Die Beat-Zeiten bleiben unverändert; nur `isDownbeat`, `beatInBar`, `barIndex` ändern sich.
- Confidence eines Beats bleibt der Modellwert (für Downbeats: `beat_confidence(t, True, …)`).
- `timeSignature.barShare` bleibt der Anteil **vor** dem Glätten.
- Nicht glätten, wenn `barShare is None` oder `barShare < 50`.
- Neuansatz-Strafe in der Größenordnung log ε ≈ −9 (Konstante `REANCHOR_PENALTY`).
- Standard: glätten an. Kein neues Paket.
- Texte in der Web-App vorerst deutsch (Übersetzung mit Teilprojekt 4).

## Review Focus

1. **Song ohne Auftakt, erster Beat ist schon die „1“:** Takt 1 beginnt beim ersten Beat. → Task 1, Test `test_starts_on_one`.
2. **Sehr kurzer Song (weniger als 2 Takte):** keine Glättung, keine Ausnahme. → Task 1, Test `test_too_short`.
3. **3/4-Song:** Raster mit 3 Zählzeiten, nicht 4. → Task 1, Test `test_three_four`.
4. **Downbeat-Wahrscheinlichkeit 0 oder 1** (Logarithmus): keine `-inf`/NaN. → Task 1, Test `test_extreme_probabilities`.
5. **Häkchen umschalten in der Web-App, während ein Song geladen ist:** dieselbe Datei wird neu analysiert, Wiedergabe stoppt, Ergebnis ersetzt. → Task 3, Prüfung im Browser.

---

### Task 1: `smooth_bars` im Analyzer

**Files:**
- Modify: `backend/analyzer.py` (neue Funktion nach `meter_from_beats`)
- Test: `backend/tests/test_smooth_bars.py`

**Interfaces:**
- Produces:
  - `REANCHOR_PENALTY = 9.0` (Strafe in nat für einen Neuansatz), `MIN_BAR_SHARE = 50`
  - `smooth_bars(downbeat_conf: list[float], meter: int, bar_share: int | None) -> dict` mit
    `{"applied": bool, "positions": list[int], "reanchors": int}`. `downbeat_conf[i]` = Downbeat-Wahrscheinlichkeit
    am Beat i; `positions[i]` = Zählzeit 1…meter; bei `applied == False` ist `positions` leer.
  - Verfahren: Viterbi über die Beats, Zustände 1…meter, Werte in Log. Bewertung je Beat: `log(d)` für Zählzeit 1,
    `log(1 − d)` sonst, `d` auf [1e-4, 1 − 1e-4] begrenzt. Übergang „weiterzählen“ (p → p mod meter + 1) kostet 0,
    jeder andere Übergang `REANCHOR_PENALTY`. Start: alle Zählzeiten gleich. `reanchors` = Anzahl der Beats, an
    denen der beste Pfad nicht weiterzählt.
  - Nicht angewendet, wenn `bar_share is None`, `bar_share < MIN_BAR_SHARE` oder weniger als `2 * meter` Beats.

- [ ] **Step 1: Tests schreiben** – Hilfsfunktion `probs(pattern)` baut aus einem Text eine Liste: `D` = 0,95, `d` = 0,6, `.` = 0,05, `?` = 0,3 (unsicher).

```python
def test_intro_is_counted_in_the_grid(self):          # Spec-Test 1
    conf = probs("????????" + "D...D...D...D...")
    r = analyzer.smooth_bars(conf, 4, 74)
    self.assertTrue(r["applied"])
    self.assertEqual(r["positions"], [1, 2, 3, 4] * 6)
    self.assertEqual(r["reanchors"], 0)

def test_single_doubtful_downbeat_disappears(self):    # Spec-Test 2: Takt aus 2 Beats
    conf = probs("D...D.d.D...D...D...")
    self.assertEqual(analyzer.smooth_bars(conf, 4, 80)["positions"], [1, 2, 3, 4] * 5)

def test_inserted_half_bar_reanchors(self):            # Spec-Test 3
    conf = probs("D...D...D.." + "D...D...D...D...")   # ab Beat 11 klare "1" um 2 Beats verschoben
    r = analyzer.smooth_bars(conf, 4, 75)
    self.assertEqual(r["reanchors"], 1)
    self.assertEqual(r["positions"][11:16], [1, 2, 3, 4, 1])   # ab der neuen "1"; Beat 9/10 sind mehrdeutig

def test_irregular_song_is_left_alone(self):           # Spec-Test 4
    self.assertEqual(analyzer.smooth_bars(probs("D...D...D..."), 4, 40), {"applied": False, "positions": [], "reanchors": 0})

def test_pickup(self):                                 # Spec-Test 5: erster Downbeat beim 3. Beat
    self.assertEqual(analyzer.smooth_bars(probs("..D...D...D..."), 4, 100)["positions"][:3], [3, 4, 1])

def test_starts_on_one(self):
    self.assertEqual(analyzer.smooth_bars(probs("D...D...D..."), 4, 100)["positions"][0], 1)

def test_too_short(self):
    self.assertFalse(analyzer.smooth_bars(probs("D...D.."), 4, 100)["applied"])

def test_three_four(self):
    self.assertEqual(analyzer.smooth_bars(probs("D..D..?..D.."), 3, 90)["positions"], [1, 2, 3] * 4)

def test_extreme_probabilities(self):
    r = analyzer.smooth_bars([1.0, 0.0, 0.0, 0.0] * 3, 4, 100)
    self.assertEqual(r["positions"], [1, 2, 3, 4] * 3)
```

- [ ] **Step 2: Fehlschlag sehen** – Run: `venv/bin/python -m unittest discover -s backend/tests -p "test_smooth_bars.py"` → FAIL `smooth_bars` fehlt
- [ ] **Step 3: `smooth_bars` umsetzen**; geht Test 3 mit `REANCHOR_PENALTY = 9.0` nicht auf, die Strafe im Bereich 6–12 anpassen, bis Tests 1–3 grün sind, und den Wert festhalten
- [ ] **Step 4: Tests laufen lassen** → alle PASS
- [ ] **Step 5: Commit** – `git commit -m "Analyzer: smooth_bars (Viterbi über die Zählzeiten)"`

---

### Task 2: Glättung in der Analyse, Server und Kommandozeile

**Files:**
- Modify: `backend/analyzer.py` (`analyze_audio_file`: Signatur, Taktnummerierung, Rückgabe)
- Modify: `backend/server.py` (`handle_analyze`: Abfrageparameter), `backend/analyze_cli.py` (Option)
- Test: `backend/tests/test_analyzer.py`, `backend/tests/test_server_settings.py`

**Interfaces:**
- Consumes: `smooth_bars`, `beat_confidence`, `meter_from_beats` (Task 1 und vorhanden).
- Produces:
  - `analyze_audio_file(file_path: str, original_filename: str, smooth: bool = True) -> dict`
  - Ablauf bei beat_this und `smooth`: `downbeat_conf[i] = beat_confidence(t_i, True, beat_prob, downbeat_prob)`,
    `smooth_bars(downbeat_conf, numerator, bar_share)`; bei `applied` gelten `positions`: Downbeat = Zählzeit 1,
    `beatInBar` = Zählzeit, `barIndex` beginnt bei 1 und zählt bei jeder Zählzeit 1 außer am ersten Beat hoch.
  - Ergebnisfeld `barSmoothing = {"applied": bool, "meter": int, "changedBeats": int, "reanchors": int}`;
    `changedBeats` = Beats, deren Downbeat-Eigenschaft sich gegenüber dem Modell ändert. Ohne beat_this oder mit
    `smooth=False`: `{"applied": False, "meter": numerator, "changedBeats": 0, "reanchors": 0}`.
  - Confidence eines Downbeats nach dem Glätten = `beat_confidence(t, True, …)`, sonst `beat_confidence(t, False, …)`.
  - Server: `POST /api/analyze?smoothBars=0` → `smooth=False`; fehlt der Parameter oder ist er nicht `0` → `True`.
  - Kommandozeile: `--no-smooth-bars`.

- [ ] **Step 1: Tests schreiben**

```python
# test_analyzer.py – FakeBeatThis bekommt optional eigene Downbeats und Downbeat-Logits
def test_analysis_smooths_a_doubtful_bar(self):
    result = self.analyze_with_fake(extra_downbeat_at=1.5)   # zusätzlicher unsicherer Downbeat (Logit 0.5) bei Beat 2
    self.assertTrue(result["barSmoothing"]["applied"])
    self.assertEqual(result["barSmoothing"]["changedBeats"], 1)
    self.assertTrue(all(b["beatInBar"] == (i % 4) + 1 for i, b in enumerate(result["beats"])))
    self.assertLess(result["timeSignature"]["barShare"], 100)    # Anteil vor dem Glätten

def test_analysis_without_smoothing_keeps_the_model(self):       # Spec-Test 6
    result = self.analyze_with_fake(extra_downbeat_at=1.5, smooth=False)
    self.assertFalse(result["barSmoothing"]["applied"])
    self.assertEqual(result["beats"][2]["isDownbeat"], True)      # Beat bei 1,5 s bleibt Downbeat

def test_librosa_is_not_smoothed(self):
    self.assertFalse(self.analyze_without_beat_this()["barSmoothing"]["applied"])

# test_server_settings.py
def test_analyze_passes_smooth_bars(self):
    calls = []
    server.analyze_audio_file = lambda p, f, smooth=True: calls.append(smooth) or {"ok": True}
    # multipart-Upload einer kleinen Datei an /api/analyze und /api/analyze?smoothBars=0
    self.assertEqual(calls, [True, False])
```

(`analyze_with_fake` bekommt die Parameter `extra_downbeat_at` und `smooth`; den Server-Test mit dem bestehenden
HTTP-Aufbau schreiben und `server.analyze_audio_file` im `tearDown` zurücksetzen.)

- [ ] **Step 2: Fehlschlag sehen** – Run: `venv/bin/python -m unittest discover -s backend/tests` → FAIL (`barSmoothing` fehlt, Parameter unbekannt)
- [ ] **Step 3: Umsetzen** nach den Interfaces oben
- [ ] **Step 4: Tests laufen lassen** → alle PASS
- [ ] **Step 5: Commit** – `git commit -m "Analyse: Takte glätten bei beat_this, abschaltbar über Server und Kommandozeile"`

---

### Task 3: Web-App: Häkchen und Anzeige

**Files:**
- Modify: `src/types/analyzer.ts`, `src/utils/audioAnalyzer.ts` (`analyzeAudioFile`), `src/App.tsx` (`handleFileSelected`), `src/components/MetricsCards.tsx`
- Modify: `dist/` (neu gebaut)

**Interfaces:**
- Consumes: Ergebnisfeld `barSmoothing` (Task 2), Abfrageparameter `smoothBars=0`.
- Produces:
  - Typ `BarSmoothing = { applied: boolean; meter: number; changedBeats: number; reanchors: number }`, `AnalysisResult.barSmoothing?: BarSmoothing`
  - `analyzeAudioFile(file, fileName, onProgress, options?: { smoothBars?: boolean })` – `smoothBars === false` → `/api/analyze?smoothBars=0`
  - `App`: merkt sich die zuletzt gewählte Datei und den Namen; `handleToggleSmoothBars(on: boolean)` analysiert sie mit `{ smoothBars: on }` neu
  - `MetricsCards` Props zusätzlich: `smoothBars: boolean`, `onToggleSmoothBars: (on: boolean) => void`
  - Kachel Taktart: Häkchen „Takte glätten“ (nur aktiv bei `result.activationSource === 'beat_this'`, sonst ausgegraut mit Tooltip „nur mit beat_this“); bei `barSmoothing.applied` zusätzlich die Zeile „{changedBeats} Beats neu eingeteilt“

- [ ] **Step 1: Typen ändern, Prüfung rot sehen** – Run: `npm run lint` nach dem Ergänzen der Props in `MetricsCards` → Fehler in `App.tsx` (fehlende Props)
- [ ] **Step 2: Umsetzen**; `npm run lint` → keine Fehler
- [ ] **Step 3: Bauen** – Run: `npm run build` → erfolgreich
- [ ] **Step 4: Von Hand prüfen** – Server mit Testdatei starten oder `npm run dev`: Beispiel-Track laden → Häkchen ausgegraut (Browser-Analyse); im Server-Modus mit librosa ebenfalls ausgegraut; keine Fehler in der Konsole
- [ ] **Step 5: Commit** – `git add src dist && git commit -m "Web-App: Häkchen Takte glätten, Anzahl neu eingeteilter Beats"`

---

### Task 4: CHANGELOG

- [ ] **Step 1:** Neuer Abschnitt `## [0.1.1] – in Arbeit`, `### Hinzugefügt`: Takte glätten bei beat_this (gleichmäßiges Raster, Neuansatz nur bei klarer Evidenz, Beats unverändert, Confidence bleibt Modellwert), Häkchen in der Web-App, `--no-smooth-bars`, `?smoothBars=0`, Feld `barSmoothing`.
- [ ] **Step 2:** `venv/bin/python -m unittest discover -s backend/tests` → OK; `npm run lint && npm run build && git status --short dist` → keine weiteren Änderungen
- [ ] **Step 3: Commit** – `git commit -m "CHANGELOG: Takte glätten"`
