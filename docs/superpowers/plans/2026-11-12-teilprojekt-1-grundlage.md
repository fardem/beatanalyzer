# Teilprojekt 1 „Grundlage“ – Umsetzungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sprachdateien, Einstellungsdatei und Konfigurationsblock im Resolve-Skript schaffen, Marker und Subtitles in der eingestellten Sprache ausgeben und im Backend echte Werte von beat_this (Confidence, Kurven) sowie Angaben zum Analyse-Programm liefern.

**Architecture:** `lang/<code>.json` ist die einzige Quelle aller Texte. `backend/i18n.py` liest sie, `backend/settings.py` hält die Sprache in `settings.json`. `backend/resolve_plugin.py` schreibt Sprache, Pfade und Texte als `BA-CONFIG`-Block ins installierte Lua-Skript; das Skript formatiert Marker und Subtitles damit. `backend/analyzer.py` holt die Werte pro Frame von beat_this einzeln ab und leitet Confidence, Kurven und Taktanteil daraus ab.

**Tech Stack:** Python 3.10–3.13 (`unittest`), LuaJIT in Resolve (Tests über `lupa`), React/TypeScript mit Vite.

**Spec:** `docs/superpowers/specs/2026-11-12-resolve-dialog-und-sprachen-design.md` (Abschnitte 3, 4, 8, 13; Teilprojekt 1 in Abschnitt 5)

## Global Constraints

- Keine neuen Python-Pakete. Die CI installiert nur `numpy scipy librosa soundfile lupa`, **ohne torch**: Code, der torch braucht, muss mit Fakes testbar sein.
- Begriffe: Resolve-Begriffe englisch; Beat, Downbeat, Confidence, BPM englisch; Takt übersetzt (Takt / Bar / Ölçü). Trenner in Subtitle-Zeilen ist der Halbgeviertstrich „–“ (U+2013).
- Zahlenformat: Dezimalzeichen de `,` · en `.` · tr `,`; Prozent de `{v} %` · en `{v}%` · tr `%{v}`.
- Unverändert bleiben: Format-Kennung `beatthis-resolve-markers/1`, Marker-Kennung `beatthis`, Track-Präfix `BeatAnalyzer - `, Zeile `local VERSION = "…"` im Lua-Skript.
- Das installierte Lua-Skript wird als UTF-8 ohne BOM geschrieben. `settings.json` wird mit `utf-8-sig` gelesen (Notepad schreibt ein BOM).
- Nach jeder Änderung in `src/` wird `dist/` neu gebaut und mit committet (die CI prüft das).
- Commit-Nachrichten auf Deutsch wie bisher im Repository.
- Tests laufen mit `python -m unittest discover -s backend/tests -v` aus dem Repository-Ordner.

## Review Focus

1. **`settings.json` von Hand bearbeitet** (BOM, kaputtes JSON, unbekannte Sprache): Das Programm startet mit Standardwerten statt abzustürzen. → Task 2.
2. **BeatAnalyzer-Ordner mit Umlauten, Leerzeichen oder Anführungszeichen im Pfad:** Der Pfad steht unverfälscht in `BA.home`. → Task 5 (Rundlauf durch Lua).
3. **Alte Marker-JSON aus 0.0.5** (`"timeSignature": "4/4 (Standard)"`, Confidence 0.88): Das neue Skript liest sie und zeigt die Taktart korrekt an. → Task 6.
4. **Song ohne erkannte Downbeats oder mit nur einem:** keine Ausnahme; Taktanteil ist `null`, Taktart bleibt 4. → Task 3.
5. **Skript von einem alten Updater roh kopiert** (Vorlage ohne `home`, gleiche `VERSION`): gilt als veraltet und wird beim nächsten Start des Servers neu geschrieben. → Task 5.

---

### Task 1: Sprachdateien und `backend/i18n.py`

**Files:**
- Create: `lang/en.json`, `lang/de.json`, `lang/tr.json`
- Create: `backend/i18n.py`
- Test: `backend/tests/test_i18n.py`

**Interfaces:**
- Produces:
  - `i18n.LANG_DIR: Path` (= `<Repository>/lang`), `i18n.LANGUAGES = ("en", "de", "tr")`
  - `i18n.load(code: str, lang_dir: Path | None = None) -> dict[str, str]` – flach: verschachtelte Schlüssel mit Punkt (`"output.meter_suffix.4"`), Listen mit `"\n"` verbunden; fehlende Datei → `{}`
  - `i18n.texts(code: str, lang_dir: Path | None = None, sections: tuple[str, ...] = ("_meta", "plugin", "output")) -> dict[str, str]` – Englisch als Grundlage, die Sprache darüber, nur Schlüssel dieser Bereiche
  - `i18n.available(lang_dir: Path | None = None) -> list[tuple[str, str]]` – `(code, _meta.name)` in der Reihenfolge von `LANGUAGES`
  - `i18n.detect(env: Mapping[str, str] = os.environ, platform: str = sys.platform) -> str` – Windows: `GetUserDefaultUILanguage` über `ctypes` und `locale.windows_locale`; sonst `LC_ALL`, `LC_MESSAGES`, `LANG` (erste zwei Buchstaben); nicht in `LANGUAGES` → `"en"`
  - `i18n.resolve_language(setting: str, env=os.environ, platform=sys.platform) -> str` – `"auto"` → `detect()`, Code in `LANGUAGES` → Code, sonst `"en"`

- [ ] **Step 1: Sprachdateien anlegen**

`lang/en.json` (genau so):

```json
{
  "_meta": { "name": "English", "decimal": ".", "percent": "{v}%", "html_lang": "en" },
  "output": {
    "marker_downbeat": "Bar {bar}",
    "marker_note": "{time} s | {bpm} BPM",
    "kind_downbeat": "Downbeat (1)",
    "kind_beat": "Beat {beat}",
    "bar_beat": "Bar {bar} – Beat {beat}",
    "time_bpm": "{clock} – {bpm} BPM",
    "confidence": "Confidence {value}",
    "intro": ["BeatAnalyzer", "{file}", "{bpm} BPM – {meter}"],
    "meter": "{num}/{den}{suffix}",
    "meter_suffix": { "2": "", "4": "", "8": "", "16": "" }
  }
}
```

`lang/de.json`: wie Englisch, aber `_meta` = `{ "name": "Deutsch", "decimal": ",", "percent": "{v} %", "html_lang": "de" }`, `marker_downbeat` = `"Takt {bar}"`, `bar_beat` = `"Takt {bar} – Beat {beat}"`.

`lang/tr.json`: wie Englisch, aber `_meta` = `{ "name": "Türkçe", "decimal": ",", "percent": "%{v}", "html_lang": "tr", "review": "Türkische Texte: vom Nutzer noch zu prüfen" }`, `marker_downbeat` = `"Ölçü {bar}"`, `bar_beat` = `"Ölçü {bar} – Beat {beat}"`, `meter_suffix` = `{ "2": "'lik", "4": "'lük", "8": "'lik", "16": "'lık" }`.

- [ ] **Step 2: Tests schreiben** (`backend/tests/test_i18n.py`)

```python
def test_all_languages_have_the_same_keys(self):
    keys = {c: set(i18n.load(c)) - {"_meta.review"} for c in i18n.LANGUAGES}
    self.assertEqual(keys["de"], keys["en"]); self.assertEqual(keys["tr"], keys["en"])

def test_same_placeholders_as_english(self):
    en = i18n.load("en")
    for code in ("de", "tr"):
        for key, value in i18n.load(code).items():
            if key in en:
                self.assertEqual(set(re.findall(r"{(\w+)}", value)), set(re.findall(r"{(\w+)}", en[key])), (code, key))

def test_values_from_spec(self):
    self.assertEqual(i18n.load("en")["output.intro"], "BeatAnalyzer\n{file}\n{bpm} BPM – {meter}")
    self.assertEqual(i18n.load("de")["output.bar_beat"], "Takt {bar} – Beat {beat}")
    self.assertEqual(i18n.load("tr")["output.meter_suffix.4"], "'lük")
    self.assertEqual(i18n.load("tr")["output.meter_suffix.16"], "'lık")
    self.assertEqual(i18n.load("de")["_meta.percent"], "{v} %")
    self.assertEqual(i18n.load("tr")["_meta.percent"], "%{v}")

def test_texts_fall_back_to_english_and_filter_sections(self):
    # tmp lang dir: en = {"output": {"a": "A", "b": "B"}, "web": {"x": "X"}}, de = {"output": {"a": "Ä"}}
    self.assertEqual(i18n.texts("de", lang_dir=tmp), {"output.a": "Ä", "output.b": "B"})

def test_resolve_language(self):
    self.assertEqual(i18n.resolve_language("de"), "de")
    self.assertEqual(i18n.resolve_language("fr"), "en")
    self.assertEqual(i18n.resolve_language("auto", env={"LANG": "tr_TR.UTF-8"}, platform="linux"), "tr")
    self.assertEqual(i18n.resolve_language("auto", env={"LANG": "fr_FR.UTF-8"}, platform="linux"), "en")
    self.assertEqual(i18n.resolve_language("auto", env={}, platform="linux"), "en")

def test_available(self):
    self.assertEqual(i18n.available(), [("en", "English"), ("de", "Deutsch"), ("tr", "Türkçe")])
```

- [ ] **Step 3: Tests laufen lassen, Fehlschlag sehen**

Run: `python -m unittest discover -s backend/tests -p "test_i18n.py" -v`
Expected: FAIL mit `ModuleNotFoundError: No module named 'i18n'`

- [ ] **Step 4: `backend/i18n.py` nach den Interfaces oben schreiben**

Dateien mit `encoding="utf-8-sig"` lesen; kaputte Datei → `{}`.

- [ ] **Step 5: Tests laufen lassen**

Run: `python -m unittest discover -s backend/tests -p "test_i18n.py" -v`
Expected: alle PASS

- [ ] **Step 6: Commit**

```bash
git add lang backend/i18n.py backend/tests/test_i18n.py
git commit -m "Sprachdateien en/de/tr und backend/i18n.py"
```

---

### Task 2: Einstellungsdatei `backend/settings.py`

**Files:**
- Create: `backend/settings.py`
- Modify: `.gitignore` (Zeilen `settings.json` und `resolve_temp/` unter „Python / lokale Laufzeit“)
- Test: `backend/tests/test_settings.py`

**Interfaces:**
- Produces:
  - `settings.SETTINGS_FILE: Path` (= `<Repository>/settings.json`), `settings.LANGUAGE_CHOICES = ("auto", "en", "de", "tr")`, `settings.DEFAULTS = {"language": "auto"}`
  - `settings.load(path: Path | None = None) -> dict` – `None` → `SETTINGS_FILE` zum Zeitpunkt des Aufrufs (damit Tests es umbiegen können); fehlend, kaputt, kein Objekt → Kopie von `DEFAULTS`; unbekannte Sprache → `"auto"`; weitere Schlüssel bleiben erhalten
  - `settings.save(values: dict, path: Path | None = None) -> dict` – mischt in `load(path)`, prüft `language` gegen `LANGUAGE_CHOICES` (sonst `ValueError`, Datei unverändert), schreibt UTF-8 mit Einrückung 2 über eine `.tmp`-Datei und `os.replace`, gibt das Ergebnis zurück

- [ ] **Step 1: Tests schreiben**

```python
def test_missing_file_gives_defaults(self):
    self.assertEqual(settings.load(self.tmp / "settings.json"), {"language": "auto"})

def test_broken_json_gives_defaults(self):
    p = self.tmp / "settings.json"; p.write_text("{kaputt", encoding="utf-8")
    self.assertEqual(settings.load(p), {"language": "auto"})

def test_bom_from_notepad_is_accepted(self):
    p = self.tmp / "settings.json"; p.write_bytes('\ufeff{"language": "tr"}'.encode("utf-8"))
    self.assertEqual(settings.load(p)["language"], "tr")

def test_unknown_language_reads_as_auto(self):
    p = self.tmp / "settings.json"; p.write_text('{"language": "fr"}', encoding="utf-8")
    self.assertEqual(settings.load(p)["language"], "auto")

def test_save_and_load_keep_other_keys(self):
    p = self.tmp / "settings.json"; p.write_text('{"language": "de", "other": 1}', encoding="utf-8")
    self.assertEqual(settings.save({"language": "tr"}, p), {"language": "tr", "other": 1})
    self.assertEqual(settings.load(p), {"language": "tr", "other": 1})

def test_invalid_language_is_refused_and_file_unchanged(self):
    p = self.tmp / "settings.json"; settings.save({"language": "de"}, p)
    with self.assertRaises(ValueError):
        settings.save({"language": "xx"}, p)
    self.assertEqual(settings.load(p)["language"], "de")
```

- [ ] **Step 2: Fehlschlag sehen** – Run: `python -m unittest discover -s backend/tests -p "test_settings.py" -v` → FAIL `No module named 'settings'`
- [ ] **Step 3: `backend/settings.py` schreiben, `.gitignore` ergänzen**
- [ ] **Step 4: Tests laufen lassen** → alle PASS
- [ ] **Step 5: Commit** – `git commit -m "Einstellungsdatei settings.json (Sprache)"`

---

### Task 3: Echte Confidence, Kurven und Taktanteil aus beat_this

**Files:**
- Modify: `backend/analyzer.py` (Inferenz `:73-90`, Kurven `:92-115`, Taktart `:136-150`, Beat-Liste `:179-188`, Rückgabe `:200-236`)
- Test: `backend/tests/test_analyzer.py`

**Interfaces:**
- Consumes: beat_this ab Commit `b95c8ab`: `Audio2Beats` hat `signal2spect(signal, sr)`, `spect2frames(spect) -> (beat_logits, downbeat_logits)` (50 Frames/s) und `frames2beats(beat_logits, downbeat_logits) -> (beats_s, downbeats_s)`.
- Produces (in `analyzer.py`):
  - `FPS = 50`
  - `run_beat_this(predictor, y: np.ndarray, sr: int) -> tuple[list[float], list[float], np.ndarray, np.ndarray]` – Beats, Downbeats, Beat-Wahrscheinlichkeit pro Frame, Downbeat-Wahrscheinlichkeit pro Frame (Sigmoid, `float64`). Tensoren werden über `detach().float().cpu().numpy()` umgewandelt, wenn vorhanden; sonst `np.asarray`.
  - `beat_confidence(time: float, is_downbeat: bool, beat_prob: np.ndarray, downbeat_prob: np.ndarray, fps: int = FPS) -> float` – Frame `round(time * fps)`, an den Rand geklemmt; Beat: `beat_prob[f]`; Downbeat: Maximum von `downbeat_prob[f-3 : f+4]`; auf 3 Stellen gerundet
  - `activation_curve(beat_prob: np.ndarray, downbeat_prob: np.ndarray | None, fps: int = FPS, points: int = 1000) -> list[dict]` – Blöcke zu `ceil(len / points)` Frames, je Block das **Maximum** (damit keine Spitze verloren geht); `time` = erster Frame des Blocks / fps; Werte auf 3 Stellen; `downbeat_prob is None` → `downbeatActivation: None`
  - `meter_from_beats(beats_sec: list[float], downbeats_sec: list[float]) -> tuple[int, int | None]` – zählt Beats zwischen je zwei Downbeats; Taktart = häufigste Anzahl unter (2, 3, 4, 6), sonst 4; Taktanteil = `round(100 * Anzahl Takte mit dieser Anzahl / Anzahl aller gezählten Takte)`; weniger als 2 Downbeats → `(4, None)`
  - Ergebnis von `analyze_audio_file`: `beats[i]["confidence"]` ist `float` (beat_this) oder `None` (librosa); neues Feld `"activationSource": "beat_this" | "onset"`; librosa-Kurve = normierte Onset-Stärke mit `downbeatActivation: None`; `"timeSignature": {"numerator": n, "denominator": 4, "name": f"{n}/4", "barShare": share}` (das Feld `confidence` und die Texte „(Walzer)“/„(Standard)“ entfallen)

- [ ] **Step 1: Fake für beat_this in `test_analyzer.py` anlegen**

Ein Klasse `FakeBeatThis` mit `__init__(checkpoint_path="final0", device="cpu", float16=False, dbn=False)`, `signal2spect` (merkt sich Signal und sr), `spect2frames` (liefert für 12 s = 600 Frames: Beat-Logit `4.0` an den Frames der Beats 0,5 s, 1,0 s, …, sonst `-4.0`; Downbeat-Logit `2.0` **einen Frame nach** jedem vierten Beat, sonst `-4.0`) und `frames2beats` (gibt Beats und jeden vierten Beat als Downbeat in Sekunden zurück). Der bestehende Test `test_beat_this_gets_decoded_signal_not_file_path` nimmt diesen Fake und prüft das Signal an `signal2spect`.

- [ ] **Step 2: Tests schreiben**

```python
def test_confidence_from_model_values(self):
    result = self.analyze_with_fake()                      # Hilfsmethode mit FakeBeatThis und torch-Stub
    self.assertEqual(result["beats"][1]["confidence"], 0.982)   # sigmoid(4.0)
    self.assertEqual(result["beats"][0]["confidence"], 0.881)   # Downbeat: sigmoid(2.0), einen Frame daneben

def test_curves_from_model(self):
    result = self.analyze_with_fake()
    curve = result["activationCurve"]
    self.assertEqual(result["activationSource"], "beat_this")
    self.assertEqual(max(p["beatActivation"] for p in curve), 0.982)
    self.assertEqual(max(p["downbeatActivation"] for p in curve), 0.881)

def test_downsampling_keeps_peaks(self):
    beat = np.zeros(5000); beat[2501] = 0.9
    curve = analyzer.activation_curve(beat, None)
    self.assertEqual(len(curve), 1000)
    self.assertEqual(max(p["beatActivation"] for p in curve), 0.9)
    self.assertTrue(all(p["downbeatActivation"] is None for p in curve))
    self.assertEqual(curve[500]["time"], 50.0)

def test_librosa_has_no_confidence(self):
    result = self.analyze_without_beat_this()
    self.assertTrue(all(b["confidence"] is None for b in result["beats"]))
    self.assertEqual(result["activationSource"], "onset")
    self.assertTrue(all(p["downbeatActivation"] is None for p in result["activationCurve"]))
    self.assertIsNone(analyzer.resolve_marker_data(result)["markers"][0]["confidence"])

def test_meter_and_bar_share(self):
    beats = [i * 0.5 for i in range(40)]
    downs = [beats[i] for i in range(0, 36, 4)] + [beats[36], beats[39]]   # 9 Takte zu 4, einer zu 3
    self.assertEqual(analyzer.meter_from_beats(beats, downs), (4, 90))
    self.assertEqual(analyzer.meter_from_beats(beats, [0.0]), (4, None))
    self.assertEqual(analyzer.meter_from_beats(beats, []), (4, None))

def test_time_signature_fields(self):
    ts = self.analyze_with_fake()["timeSignature"]
    self.assertEqual(ts, {"numerator": 4, "denominator": 4, "name": "4/4", "barShare": 100})
```

- [ ] **Step 3: Fehlschlag sehen** – Run: `python -m unittest discover -s backend/tests -p "test_analyzer.py" -v` → FAIL (u. a. `AttributeError: activation_curve`)
- [ ] **Step 4: `analyzer.py` umbauen nach den Interfaces oben** – `analyze_audio_file` ruft `run_beat_this` statt `predictor(y, sr)`; ohne Downbeats bleibt der bisherige Ablauf (erster Beat wird Downbeat).
- [ ] **Step 5: Tests laufen lassen** → alle PASS, auch die bestehenden Tests in `test_analyzer.py` und `test_resolve_script.py`
- [ ] **Step 6: Commit** – `git commit -m "Analyzer: echte Confidence und Kurven aus beat_this, Taktanteil statt fester Werte"`

---

### Task 4: Angaben zum Analyse-Programm

**Files:**
- Modify: `backend/analyzer.py` (`get_predictor` `:28-43`, `analyze_audio_file`, `resolve_marker_data` `:271-298`)
- Test: `backend/tests/test_analyzer.py`

**Interfaces:**
- Consumes: `run_beat_this` aus Task 3.
- Produces:
  - `analyzer.engine_info(engine_id: str, fallback_reason: str | None = None, device: str | None = None) -> dict` → `{"id": engine_id, "device": device, "gpu": <Name oder None>, "fallbackReason": fallback_reason}`; `gpu` nur bei `device == "cuda"` über `torch.cuda.get_device_name(0)`, Fehler → `None`
  - `analyzer.engine_status() -> dict` – was die nächste Analyse benutzen würde, ohne das Modell zu laden: nicht installiert → `librosa`/`not_installed`; Laden ist schon einmal gescheitert → `librosa`/`model_load_failed`; sonst `beat_this` mit `"cuda"`/`"cpu"` nach `torch.cuda.is_available()`
  - Modulvariablen `MODEL_LOAD_FAILED: bool` und `PREDICTOR_DEVICE: str | None`, gesetzt in `get_predictor()`
  - Ergebnis: `"engine"` (Anzeigetext `"CPJKU beat_this Transformer"` oder `"Librosa MIR (Fallback)"`) und `"engineInfo"`; `fallbackReason` ist `"not_installed"`, `"model_load_failed"` oder `"inference_failed"`
  - `resolve_marker_data(...)` hat zusätzlich `"engine": result["engineInfo"]`, wenn vorhanden

- [ ] **Step 1: Tests schreiben**

```python
def test_engine_info_without_beat_this(self):
    result = self.analyze_without_beat_this()
    self.assertEqual(result["engineInfo"], {"id": "librosa", "device": None, "gpu": None, "fallbackReason": "not_installed"})
    self.assertEqual(self.analyzer.engine_status()["fallbackReason"], "not_installed")

def test_engine_info_beat_this_on_cpu(self):
    result = self.analyze_with_fake()      # torch-Stub: cuda.is_available() -> False
    self.assertEqual(result["engineInfo"], {"id": "beat_this", "device": "cpu", "gpu": None, "fallbackReason": None})
    self.assertEqual(result["engine"], "CPJKU beat_this Transformer")

def test_model_load_failed(self):
    result = self.analyze_with_fake(init_raises=RuntimeError("kein Modell"))
    self.assertEqual(result["engineInfo"]["fallbackReason"], "model_load_failed")
    self.assertEqual(self.analyzer.engine_status()["fallbackReason"], "model_load_failed")

def test_inference_failed(self):
    result = self.analyze_with_fake(frames_raise=RuntimeError("CUDA out of memory"))
    self.assertEqual(result["engineInfo"]["fallbackReason"], "inference_failed")
    self.assertEqual(result["engine"], "Librosa MIR (Fallback)")

def test_marker_json_carries_engine(self):
    result = self.analyze_with_fake()
    self.assertEqual(self.analyzer.resolve_marker_data(result)["engine"], result["engineInfo"])
    del result["engineInfo"]
    self.assertNotIn("engine", self.analyzer.resolve_marker_data(result))
```

- [ ] **Step 2: Fehlschlag sehen** – Run: `python -m unittest discover -s backend/tests -p "test_analyzer.py" -v` → FAIL `KeyError: 'engineInfo'`
- [ ] **Step 3: Umsetzen nach den Interfaces oben** (den bestehenden Test `test_fallback_without_beat_this` an den neuen Text anpassen: `assertIn("Librosa", …)` bleibt gültig)
- [ ] **Step 4: Tests laufen lassen** → alle PASS
- [ ] **Step 5: Commit** – `git commit -m "Analyzer: engineInfo mit Gerät und Grund für den Ersatz"`

---

### Task 5: Konfigurationsblock im Resolve-Skript

**Files:**
- Modify: `backend/resolve_plugin.py`
- Modify: `resolve/BeatAnalyzer_Markers.lua` (Block nach `local M = { VERSION = VERSION }`, Zeile 25, einfügen)
- Test: `backend/tests/test_resolve_plugin_config.py`

**Interfaces:**
- Consumes: `i18n.texts`, `i18n.LANGUAGES`, `i18n.resolve_language` (Task 1); `settings.load`, `settings.save` (Task 2).
- Produces (in `resolve_plugin.py`):
  - `CONFIG_BEGIN = "-- >>> BA-CONFIG"`, `CONFIG_END = "-- <<< BA-CONFIG <<<"`
  - `lua_string(s: str) -> str` – Lua-Zeichenkette in `"…"`: `\\`, `\"`, `\n`, `\r`, `\t` maskiert, übrige Steuerzeichen als `\ddd`, Nicht-ASCII bleibt UTF-8
  - `render_config(home: Path | None, python: Path | None, lang: str, texts: dict[str, dict[str, str]]) -> str` – genau dieses Format, Schlüssel sortiert, Sprachen in der übergebenen Reihenfolge:

    ```lua
    -- >>> BA-CONFIG (written by backend/resolve_plugin.py - do not edit by hand) >>>
    local BA = {
      home = nil,
      python = nil,
      lang = "en",
      texts = {
        ["en"] = {
          ["_meta.decimal"] = ".",
          ["_meta.html_lang"] = "en",
        },
      },
    }
    -- <<< BA-CONFIG <<<
    ```
  - `apply_config(script: str, block: str) -> str` – ersetzt von der Zeile mit `CONFIG_BEGIN` bis einschließlich der Zeile mit `CONFIG_END`; fehlt eine der Marken → `ValueError`
  - `venv_python(root: Path = PROJECT_ROOT, platform: str = sys.platform) -> Path` – `win32`: `root/venv/Scripts/pythonw.exe`, sonst `root/venv/bin/python`
  - `template_config() -> str` = `render_config(None, None, "en", {"en": i18n.texts("en")})`
  - `expected_script(platform: str = sys.platform) -> str` – `PLUGIN_SOURCE` mit `render_config(PROJECT_ROOT, venv_python(), resolve_language(settings.load()["language"]), {c: i18n.texts(c) for c in i18n.LANGUAGES})`
  - `install(...)`: schreibt `expected_script(platform)` statt der Rohdatei (Signatur unverändert)
  - `status(...)`: zusätzlich `"outdated"`, wenn der installierte Text von `expected_script(platform)` abweicht (Signatur und übrige Felder unverändert)
  - `ensure_current(target_dir=None, env=os.environ, platform=sys.platform) -> bool` – installiert neu, wenn `state == "outdated"`; `True`, wenn geschrieben wurde
  - `set_language(code: str, target_dir=None, env=os.environ, platform=sys.platform) -> dict` → `{"language": code, "resolvedLanguage": …, "pluginUpdated": bool}`; ungültiger Code → `ValueError` aus `settings.save`
  - `main`: neuer Befehl `template` schreibt `template_config()` in `PLUGIN_SOURCE`

- [ ] **Step 1: Tests schreiben** (Einstellungsdatei über `settings.SETTINGS_FILE` auf eine temporäre Datei umbiegen, `APPDATA` auf einen temporären Ordner wie in `test_updater.py`)

```python
def test_lua_string_escapes(self):
    self.assertEqual(resolve_plugin.lua_string('C:\\Ş "x"\nY'), '"C:\\\\Ş \\"x\\"\\nY"')

@unittest.skipIf(luajit21 is None, "lupa not installed")
def test_config_round_trip_in_lua(self):
    home = Path('C:\\Users\\Şükrü "Ö"\\Beat Analyzer')
    block = resolve_plugin.render_config(home, home / "venv/Scripts/pythonw.exe", "de",
                                         {"en": i18n.texts("en"), "de": i18n.texts("de")})
    ba = luajit21.LuaRuntime().execute(block + "\nreturn BA")
    self.assertEqual(ba.home, str(home)); self.assertEqual(ba.lang, "de")
    self.assertEqual(ba.texts["de"]["output.bar_beat"], "Takt {bar} – Beat {beat}")

def test_apply_config_needs_markers(self):
    with self.assertRaises(ValueError):
        resolve_plugin.apply_config("print(1)\n", resolve_plugin.template_config())

def test_repo_script_carries_english_template(self):
    text = resolve_plugin.PLUGIN_SOURCE.read_text(encoding="utf-8")
    self.assertEqual(resolve_plugin.apply_config(text, resolve_plugin.template_config()), text)

def test_install_writes_language_and_paths(self):
    settings.save({"language": "tr"})
    target = resolve_plugin.install(env=self.env, platform="win32")
    text = target.read_text(encoding="utf-8")
    self.assertIn('lang = "tr"', text)
    self.assertIn(resolve_plugin.lua_string(str(resolve_plugin.PROJECT_ROOT)), text)
    self.assertEqual(resolve_plugin.status(env=self.env, platform="win32")["state"], "current")

def test_raw_template_from_old_updater_is_outdated_and_fixed(self):
    d = resolve_plugin.scripts_dir(self.env, "win32"); d.mkdir(parents=True)
    (d / resolve_plugin.PLUGIN_FILE).write_bytes(resolve_plugin.PLUGIN_SOURCE.read_bytes())
    self.assertEqual(resolve_plugin.status(env=self.env, platform="win32")["state"], "outdated")
    self.assertTrue(resolve_plugin.ensure_current(env=self.env, platform="win32"))
    self.assertEqual(resolve_plugin.status(env=self.env, platform="win32")["state"], "current")
    self.assertFalse(resolve_plugin.ensure_current(env=self.env, platform="win32"))

def test_set_language_rewrites_installed_plugin(self):
    settings.save({"language": "de"}); resolve_plugin.install(env=self.env, platform="win32")
    r = resolve_plugin.set_language("tr", env=self.env, platform="win32")
    self.assertEqual(r, {"language": "tr", "resolvedLanguage": "tr", "pluginUpdated": True})
    self.assertFalse(resolve_plugin.set_language("tr", env=self.env, platform="win32")["pluginUpdated"])
    with self.assertRaises(ValueError):
        resolve_plugin.set_language("xx", env=self.env, platform="win32")

def test_set_language_without_plugin(self):
    r = resolve_plugin.set_language("de", env=self.env, platform="win32")
    self.assertFalse(r["pluginUpdated"]); self.assertEqual(settings.load()["language"], "de")

def test_venv_python(self):
    root = Path("/x")
    self.assertEqual(resolve_plugin.venv_python(root, "win32"), root / "venv" / "Scripts" / "pythonw.exe")
    self.assertEqual(resolve_plugin.venv_python(root, "linux"), root / "venv" / "bin" / "python")
```

- [ ] **Step 2: Fehlschlag sehen** – Run: `python -m unittest discover -s backend/tests -p "test_resolve_plugin_config.py" -v` → FAIL `AttributeError: lua_string`
- [ ] **Step 3: `resolve_plugin.py` umsetzen nach den Interfaces oben**
- [ ] **Step 4: Marken ins Lua-Skript setzen und Vorlage erzeugen** – nach Zeile 25 von `resolve/BeatAnalyzer_Markers.lua` die zwei Zeilen `CONFIG_BEGIN …` und `CONFIG_END` einfügen, dann:

Run: `python backend/resolve_plugin.py template`
Expected: Das Skript enthält den Block mit `home = nil`, `lang = "en"` und den englischen Texten; `git diff resolve/` zeigt nur diesen Block.

- [ ] **Step 5: Alle Tests laufen lassen** – Run: `python -m unittest discover -s backend/tests -v` → alle PASS (auch `test_updater.py`)
- [ ] **Step 6: Commit** – `git commit -m "Resolve-Skript: Konfigurationsblock mit Sprache, Pfaden und Texten"`

---

### Task 6: Lua-Skript gibt Marker und Subtitles in der Sprache aus

**Files:**
- Modify: `resolve/BeatAnalyzer_Markers.lua` (neue Hilfsfunktionen nach `round`, `:58`; `mark_clip` `:432-456`; `build_srt` `:482-523`)
- Test: `backend/tests/test_resolve_script.py`

**Interfaces:**
- Consumes: `BA`-Block (Task 5); `resolve_plugin.apply_config`, `resolve_plugin.render_config`, `i18n.texts` für Tests in anderen Sprachen.
- Produces (Lua, am Modul `M`):
  - `M.T(key, vars) -> string` – `BA.texts[BA.lang][key]`, sonst `BA.texts.en[key]`, sonst der Schlüssel; ersetzt `{name}` aus `vars`, unbekannte Platzhalter bleiben stehen
  - `M.fmt_num(x, decimals) -> string` – `string.format("%.<n>f")`, Punkt durch `_meta.decimal` ersetzt
  - `M.fmt_pct(fraction) -> string` – `_meta.percent` mit `v = round(fraction * 100)`; `nil` → `"–"`
  - `M.fmt_meter(text) -> string` – liest `^(%d+)/(%d+)` aus Text wie `"4/4"` oder `"4/4 (Standard)"`, baut `output.meter` mit `output.meter_suffix.<den>` (fehlt der Schlüssel → leere Endung); ohne Treffer → Text unverändert
  - Markername Downbeat: `T("output.marker_downbeat", {bar})`; übrige unverändert `"%d.%d"`; Notiz: `T("output.marker_note", {time = fmt_num(t, 3), bpm = fmt_num(bpm, 1)})`
  - Subtitle-Zeilen: `output.kind_downbeat` / `output.kind_beat`, `output.bar_beat`, `output.time_bpm` (`clock` unverändert, BPM mit `fmt_num(…, 1)`), `output.confidence` mit `fmt_pct`; erster Subtitle `output.intro` mit `bpm = fmt_num(globalBpm, 1)` und `meter = fmt_meter(timeSignature)`

- [ ] **Step 1: Ladehilfe in `test_resolve_script.py`** – `setUp` lädt `SCRIPT` wie bisher (englisch); neue Methode `load_lang(code)` lädt `apply_config(SCRIPT, render_config(None, None, code, {c: i18n.texts(c) for c in i18n.LANGUAGES}))` in eine neue Lua-Laufzeit mit demselben Mock.

- [ ] **Step 2: Bestehende Erwartungen auf Englisch umstellen und neue Tests schreiben**

```python
# bestehende Tests, neue Erwartungen
self.assertEqual(cues[1].split("\n")[2:6], ["Downbeat (1)", "Bar 1 – Beat 1", "00:00.500 – 120.0 BPM", "Confidence 90%"])
self.assertEqual(cues[2].split("\n")[2:4], ["Beat 2", "Bar 1 – Beat 2"])
self.assertIn("00:00.500 – 120.0 BPM\nConfidence –\n", srt)                     # test_missing_confidence_shows_dash
self.assertTrue(srt.startswith("1\n00:00:10,000 --> 00:00:10,500\nBeat 2\nBar 1 – Beat 2"), srt[:80])
self.assertIn("00:01.000 – 120.0 BPM", srt)

def test_german_output(self):
    self.load_lang("de"); self.run_apply()
    self.assertEqual(self.markers(self.song)[13]["name"], "Takt 1")
    self.assertEqual(self.markers(self.song)[13]["note"], "0,500 s | 120,0 BPM")
    self.assertEqual(self.first_beat_cue(), ["Downbeat (1)", "Takt 1 – Beat 1", "00:00.500 – 120,0 BPM", "Confidence 90 %"])

def test_turkish_output_with_old_json(self):
    self.load_lang("tr")
    self.run_apply(json_overrides={"timeSignature": "4/4 (Standard)"})   # Format aus 0.0.5
    self.assertEqual(self.markers(self.song)[13]["name"], "Ölçü 1")
    self.assertEqual(self.intro_cue(), ["BeatAnalyzer", "Müller Song.wav", "120,0 BPM – 4/4'lük"])
    self.assertEqual(self.first_beat_cue()[3], "Confidence %90")

def test_meter_suffixes(self):
    self.load_lang("tr")
    for text, expected in [("6/8", "6/8'lik"), ("9/16", "9/16'lık"), ("2/2", "2/2'lik"), ("3/4", "3/4'lük"),
                           ("5/32", "5/32"), ("abc", "abc")]:
        self.assertEqual(self.M.fmt_meter(text), expected)

def test_english_intro(self):
    self.run_apply()
    self.assertEqual(self.intro_cue(), ["BeatAnalyzer", "Müller Song.wav", "120.0 BPM – 4/4"])
```

`run_apply`, `first_beat_cue` und `intro_cue` sind kleine Hilfsmethoden aus dem, was die bestehenden Tests schon tun (JSON schreiben, `M.apply`, SRT aus dem Mock lesen). Frame 13 = 0,5 s bei 25 fps, wie im bestehenden Test.

- [ ] **Step 3: Fehlschlag sehen** – Run: `python -m unittest discover -s backend/tests -p "test_resolve_script.py" -v` → FAIL (alte Texte „Takt“, „Konfidenz“, „ - “)
- [ ] **Step 4: Lua-Skript umsetzen nach den Interfaces oben** – Kommentar über `build_srt` (`:473-476`) auf die neuen Zeilen anpassen.
- [ ] **Step 5: Alle Tests laufen lassen** – Run: `python -m unittest discover -s backend/tests -v` → alle PASS; `test_repo_script_carries_english_template` aus Task 5 bleibt grün
- [ ] **Step 6: Commit** – `git commit -m "Resolve-Skript: Marker und Subtitles in der eingestellten Sprache"`

---

### Task 7: Server: Einstellungen, Analyse-Programm, Abgleich beim Start

**Files:**
- Modify: `backend/server.py` (`do_GET` `:656-690`, `do_POST` `:741-750`, `main` `:824-845`)

**Interfaces:**
- Consumes: `resolve_plugin.set_language`, `resolve_plugin.ensure_current` (Task 5); `settings.load`, `i18n.available`, `i18n.resolve_language` (Task 1, 2); `analyzer.engine_status` (Task 4).
- Produces:
  - `GET /api/settings` → `{"language": "auto", "resolvedLanguage": "de", "languages": [{"code": "en", "name": "English"}, {"code": "de", "name": "Deutsch"}, {"code": "tr", "name": "Türkçe"}]}`
  - `POST /api/settings` mit JSON `{"language": "tr"}` → dieselbe Form wie GET plus `"pluginUpdated": bool`; ungültig → Status 400, `{"error": "<Text von ValueError>"}`
  - `GET /api/health` zusätzlich `"engineInfo": analyzer.engine_status()`; ohne importierbaren Analyzer `{"id": "librosa", "device": null, "gpu": null, "fallbackReason": "not_installed"}`
  - `main()`: vor `serve_forever()` `resolve_plugin.ensure_current()` in `try/except`; bei `True` die Zeile `[Resolve] Skript an Sprache und Ordner angepasst: <Pfad>` ausgeben

- [ ] **Step 1: Umsetzen**
- [ ] **Step 2: Von Hand prüfen** – Server starten: `PORT=8123 python backend/server.py` (im Hintergrund), dann:

```bash
curl -s localhost:8123/api/settings
```
Expected: JSON wie oben, `language` aus `settings.json` oder `auto`.

```bash
curl -s -X POST -H "Content-Type: application/json" -d '{"language":"xx"}' -w "\n%{http_code}\n" localhost:8123/api/settings
```
Expected: `{"error": …}` und `400`.

```bash
curl -s localhost:8123/api/health
```
Expected: enthält `"engineInfo"`.

Danach `settings.json` wieder entfernen, falls der Test sie angelegt hat.

- [ ] **Step 3: Alle Tests laufen lassen** – `python -m unittest discover -s backend/tests -v` → alle PASS
- [ ] **Step 4: Commit** – `git commit -m "Server: /api/settings, engineInfo in /api/health, Resolve-Skript beim Start abgleichen"`

---

### Task 8: Web-App übernimmt die neuen Datenfelder

**Files:**
- Modify: `src/types/analyzer.ts`, `src/utils/audioAnalyzer.ts`, `src/components/BeatTable.tsx` (`:190-197`), `src/components/MetricsCards.tsx` (`:60-71`), `src/components/WaveformBeatVisualizer.tsx` (`:170-180`), `src/utils/exportUtils.ts` (`:39-42`, `:66-76`, `:163-180`)
- Modify: `dist/` (neu gebaut)

**Interfaces:**
- Consumes: Ergebnisfelder aus Task 3 und 4.
- Produces (`src/types/analyzer.ts`):
  - `BeatItem.confidence: number | null`
  - `ActivationPoint.downbeatActivation: number | null`
  - `EngineInfo = { id: 'beat_this' | 'librosa'; device: 'cuda' | 'cpu' | null; gpu: string | null; fallbackReason: 'not_installed' | 'model_load_failed' | 'inference_failed' | null }`
  - `AnalysisResult.engineInfo?: EngineInfo`, `AnalysisResult.activationSource?: 'beat_this' | 'onset'`
  - `AnalysisResult.timeSignature = { numerator: number; denominator: number; name: string; barShare: number | null }` (ohne `confidence`)

Verhalten (Beschriftung und Übersetzung folgen in Teilprojekt 4, hier nur lauffähig und ehrlich):
- Browser-Analyse ohne Server: `confidence: null`, `downbeatActivation: null`, `activationSource: 'onset'`, `barShare` nach derselben Regel wie `meter_from_beats` (Task 3), `name` = `` `${n}/4` ``.
- Beat-Tabelle: `null` → „–“ ohne Balken.
- Kachel Taktart: statt `… % Konf.` jetzt `barShare` als „96 % der Takte“, `null` → „–“.
- Wellenform: Downbeat-Kurve nur zeichnen, wenn Werte vorhanden sind.
- JSON-Export: `confidence_percent` → `bar_share_percent`; CSV: `null` → leeres Feld; Marker-JSON: `engine: result.engineInfo`, wenn vorhanden.

- [ ] **Step 1: Umsetzen**
- [ ] **Step 2: Prüfen** – Run: `npm ci && npm run lint` → keine Fehler
- [ ] **Step 3: Bauen** – Run: `npm run build` → erfolgreich; `git status dist` zeigt geänderte Dateien
- [ ] **Step 4: Von Hand prüfen** – `npm run dev`, eine Beispiel-Datei ohne Server laden: Tabelle zeigt „–“ bei Confidence, Kachel Taktart zeigt „… % der Takte“, keine Fehler in der Browser-Konsole.
- [ ] **Step 5: Commit** – `git add src dist && git commit -m "Web-App: Confidence und Downbeat-Kurve dürfen fehlen, Taktanteil, engineInfo im Marker-Export"`

---

### Task 9: CHANGELOG und Gesamtprüfung

**Files:**
- Modify: `CHANGELOG.md` (neuer Abschnitt `## [Unveröffentlicht]` oben)

- [ ] **Step 1: CHANGELOG-Eintrag** unter `### Geändert` bzw. `### Hinzugefügt`:
  - Marker und Subtitles in der eingestellten Sprache (Englisch, Deutsch, Türkisch); Begriffe Beat, Downbeat, Confidence bleiben englisch; Trenner „–“.
  - Einstellungsdatei `settings.json` (Sprache, Vorgabe „wie das System“); Server-Schnittstelle `/api/settings`.
  - Confidence pro Beat und Kurven kommen jetzt von beat_this; bei librosa „–“. Taktart mit Anteil der Takte statt fester 95 %.
  - Angaben zum Analyse-Programm (`engineInfo`) im Ergebnis, in der Marker-JSON und in `/api/health`.
  - Das Resolve-Skript enthält Sprache, BeatAnalyzer-Ordner und Texte; der Server gleicht es beim Start ab.
- [ ] **Step 2: Alles prüfen**

Run: `python -m unittest discover -s backend/tests -v`
Expected: alle PASS (ohne `lupa` werden die Lua-Tests übersprungen – dann mit `pip install lupa` wiederholen)

Run: `npm run lint && npm run build && git status --short dist`
Expected: keine Fehler, keine weiteren Änderungen in `dist/`

- [ ] **Step 3: Commit** – `git commit -m "CHANGELOG: Teilprojekt 1"`
