# Gemini-Weiterentwicklung auf Basis von v0.1.4

Technisches Änderungs- und Übergabeprotokoll aller Erweiterungen, Abhängigkeiten und Verhaltensänderungen gegenüber dem Ausgangsstand **BeatAnalyzer v0.1.4**.

---

## 1. Überblick

Auf Basis von v0.1.4 wurde BeatAnalyzer in vier Bereichen erweitert:

1. **Optionales Analyse-Modell `md_beat_this`** (Masked Diffusion, Lizenz **CC BY-NC 4.0**) parallel zu `CPJKU beat_this`.
2. **Konfigurierbarer `ffmpeg`-Ordner** mit Persistenz in `settings.json`, Pfadvalidierung und CLI-Unterstützung.
3. **Aufgeräumte Modell-, Lizenz- und Setup-Oberfläche** (Sitzungsbestätigung, Zahnrad-Setup, entschärfte Hinweise, Ausblenden wirkungsloser UI-Regler).
4. **Erweiterte Wellenform-Navigation & Inspektion** (`20s`-Schnellzoom, adaptive HiDPI-Wellenform-Lupe, ziehbarer Mini-Map-Rahmen und automatischer `DAF`-Status).

Alle Erweiterungen sind vollständig rückwärtskompatibel zum bisherigen `beat_this`-Standardpfad.

---

## 2. Neues Analyse-Modell: `md_beat_this` (Masked Diffusion)

### 2.1 Backend-Integration (`backend/analyzer.py`, `backend/server.py`, `backend/analyze_cli.py`)

- **Modellauswahl & Normalisierung**:
  - `ALLOWED_MODELS = ("beat_this", "md_beat_this")`, gesteuert über `normalize_model(value)` (Standard bleibt `"beat_this"`).
  - HTTP-API: `POST /api/analyze?model=beat_this|md_beat_this`
  - CLI: `--model beat_this|md_beat_this`
  - Health-Status: `GET /api/health` liefert zusätzlich `md_beat_this_installed` sowie detaillierte Engine-Infos unter `models.beat_this` und `models.md_beat_this`.
- **Lazily geladener Predictor (`get_md_predictor`)**:
  - Importiert optional `md_beat_this.inference.Audio2Beats as MdAudio2Beats` (`checkpoint_path="run1"`).
  - Wählt automatisch `"cuda"`, falls PyTorch CUDA bereitstellt, sonst `"cpu"`.
  - Ist `md_beat_this` nicht installiert, bleibt der Server voll lauffähig (`MD_BEAT_THIS_AVAILABLE = False`, `fallbackReason: "not_installed"`).
- **Ausführung (`run_md_beat_this`) & Auswirkungen auf Felder**:
  - Prüft, ob das Modell `signal2spect`, `spect2frames` und `frames2beats` anbietet. Da `md_beat_this` (`Audio2Beats`) über Masked Diffusion direkt diskrete Zeitpunkte via `predictor(y, sr)` ausgibt, liefert der Fallback `(beats, downbeats, None, None)`.
  - **`beats[].confidence`**: Ist `null`, weil keine Frame-Logits vorhanden sind.
  - **`activationCurve[].downbeatActivation`**: Ist durchgehend `null` (keine fortlaufende DAF-Wahrscheinlichkeitskurve).
  - **`activationCurve[].beatActivation`**: Fällt bei fehlender Modell-Frame-Kurve automatisch auf `librosa.onset.onset_strength` zurück (`activationSource: "onset"`).
  - **20-ms-Quantisierung (`FPS = 50`)**: Zeitpunkte aus dem Frame-Raster liegen in 20-ms-Schritten; punktuelle Beat-to-Beat-BPM können dadurch rechnerisch in Stufen (z. B. `115,4` / `116` / `120` BPM) variieren.
- **Modellgetrennter Analyse-Cache (`_LAST`)**:
  - Der In-Memory-Cache speichert jetzt `(file_hash, model_id, y, sr, model_cache)`. Ein Wechsel zwischen `beat_this` und `md_beat_this` für dieselbe Datei nutzt das bereits dekodierte Audio `y, sr` weiter, mischt aber keine Modell-Ergebnisse.
- **Json braucht bei dem model md_beat_this kein confidence**:
  - Json braucht bei dem model md_beat_this kein confidence im davinci export da dieses model dafür keine werte liefert

### 2.2 Lizenz- & Attribution-Metadaten (CC BY-NC 4.0)

- Da `md_beat_this` ausschließlich nicht-kommerziell genutzt werden darf (`CC BY-NC 4.0`), ergänzt das Backend bei erfolgreicher `md_beat_this`-Analyse automatisch:
  - `license: "CC BY-NC 4.0"`
  - `attribution: "Masked Diffusion (md_beat_this) by Francesco Foscarin, Filip Korzeniowski, Richard Vogl (https://github.com/fosfrancesco/md_beat_this) — Licensed under CC BY-NC 4.0 (Non-Commercial Use Only)."`
- Diese Felder werden im Analyse-JSON, im DaVinci-Resolve-Marker-JSON (`resolve_marker_data`) sowie in allen Text-/CSV-/Audacity-/Export-Dialogen (`src/utils/exportUtils.ts`, `src/components/ExportModal.tsx`) mitgeführt.

### 2.3 Minimale CUDA-Installation im isolierten `venv` (Windows / Python 3.13 / RTX 50xx)

- `md_beat_this` benötigt kein komplettes Fremd-Stacking (kein `whisperx`, `pyannote-audio`, `faster-whisper`, `ctranslate2`).
- Für GPU-Beschleunigung auf RTX-50-GPUs (`sm_120`, Blackwell) genügt im isolierten BeatAnalyzer-`venv` gezielt der PyTorch-CUDA-Index (`cu128`):
  - `torch==2.8.0+cu128` und `torchaudio==2.8.0+cu128` (plus kompatibles `numpy>=2.1`), ohne andere `venv`-Umgebungen auf dem Rechner zu berühren.

---

## 3. Konfigurierbares `ffmpeg`-Verzeichnis (`ffmpeg_utils.py`, `settings.py`)

Weil `md_beat_this` (je nach Audio-Pipeline/Backend-Aufruf) auf eine ausführbare `ffmpeg`-Binary zugreifen muss und `ffmpeg` unter Windows oft nicht global im System-`PATH` liegt, wurde eine gezielte Verzeichnisverwaltung eingebaut:

- **Persistenz (`backend/settings.py`)**:
  - Speichert optional `"ffmpegDir"` atomar über temporäre Datei + `os.replace` in `settings.json`.
- **Erkennung & Prozess-`PATH` (`backend/ffmpeg_utils.py`)**:
  - `find_ffmpeg_in_dir`: Akzeptiert direkte Pfade zur Datei, den `bin/`-Ordner oder den übergeordneten `ffmpeg`-Ordner (inkl. Bereinigung umschließender Anführungszeichen).
  - `verify_ffmpeg_executable`: Prüft echte Ausführbarkeit per `ffmpeg -version` (Timeout 5 s).
  - `apply_ffmpeg_dir`: Setzt das validierte Verzeichnis vor den ursprünglichen Prozess-`PATH` (`_ORIGINAL_PATH`), ohne die Systemumgebung dauerhaft zu verändern.
- **Schnittstellen**:
  - `POST /api/settings` akzeptiert `{ "ffmpegDir": "..." }`. Ein leerer String setzt auf den System-`PATH` zurück; ein ungültiger Ordner liefert HTTP `400` mit klarer Fehlermeldung.
  - `GET /api/health` liefert `ffmpeg_available`, `ffmpeg_path`, `ffmpeg_dir`, `ffmpeg_source` (`"custom"` | `"system"` | `null`).
  - CLI (`backend/analyze_cli.py`): `--ffmpeg-dir <pfad>` (fällt sonst auf `settings.json` zurück).

---

## 4. UI- & UX-Anpassungen (Frontend)

### 4.1 Entschlackte Modell-Auswahl & Setup-Modals

- **Upload-Bereich (`src/components/UploadZone.tsx`)**:
  - Zwei Modell-Kacheln (`CPJKU beat_this` · Standard vs. `Masked Diffusion (md_beat_this)` · Non-Commercial).
  - An der `md_beat_this`-Kachel sitzt rechts ein eigener **Zahnrad-Button** (`Settings` als Geschwister-Button neben dem Auswahl-Button), der direkt das Setup- & Lizenz-Modal öffnet.
  - Der Lizenzhinweis unterhalb der Kacheln wurde auf eine hervorgehobene einzeilige Zeile ohne doppelten Einrichtungs-Button reduziert.
- **Zentrales Einrichtungs- & Lizenz-Modal (`src/components/NonCommercialNoticeModal.tsx`, `src/App.tsx`)**:
  - **Einmalige Bestätigung pro Sitzung (`mdConfirmedInSession`)**: Beim ersten Wechsel auf `md_beat_this` erscheint das Modal mit Bestätigungs-Checkbox; weitere Wechsel in derselben Sitzung schalten direkt um.
  - Wird das Modal über das Zahnrad oder das Setup-Modal bereits bestätigt geöffnet (`alreadyConfirmed={true}`), erscheint ein grünes Sitzungs-Bestätigungsbanner und ein „Fertig“-Button ohne erneute Checkbox-Abfrage.
  - Enthält die Installationsbefehle (`venv\Scripts\pip ...` / `venv/bin/pip ...`), den GitHub-Link sowie die eingebettete Komponente **`FfmpegDirControl`** (auch im `LocalSetupModal` verfügbar).
- **Ergebnisansicht (`src/App.tsx`, `src/components/ExportModal.tsx`)**:
  - In der Ergebnisansicht zeigt ein kompakter einzeiliger Amber-Hinweis bei `md_beat_this` die CC-BY-NC-4.0-Pflicht plus einen kleinen `Einrichtung`-Link rechts (da die Modell-Kacheln dort ausgeblendet sind).
  - Im `ExportModal` bleibt die vollständige Attribution inkl. Kopierfunktion erhalten.

### 4.2 Taktart-Kachel (`src/components/MetricsCards.tsx`)

- Der Regler **„Glätten“ (`0–100 %`)** wird nur gerendert, wenn `canSmooth` wahr ist (`result.activationSource === 'beat_this' || result.activationSource === 'md_beat_this'`).
- In Modi ohne Frame-Wahrscheinlichkeiten (z. B. `md_beat_this` über Onset-Fallback, `librosa`, Browser-Fallback) wird der Regler komplett ausgeblendet, statt ausgegraut/wirkungslos Platz zu beanspruchen.

### 4.3 Wellenform-Visualisierer (`src/components/WaveformBeatVisualizer.tsx`)

1. **`20s`-Schnellzoom**:
   - Button `20s` direkt neben `-`, Faktor, `+` und `Alles` in der Zoom-Leiste.
   - Zentriert das 20-Sekunden-Fenster auf die aktuelle Playhead-Position (`currentTime`, geklemmt an `[0, duration - 20]`). Ein zweiter Klick im aktiven `20s`-Modus setzt wieder auf `1.0x` zurück. Bei Tracks $\le 20\text{ s}$ ist der Button deaktiviert.
   - Die maximale Zoom-Grenze wurde dynamisch auf `Math.max(16.0, duration / 5)` erweitert, sodass die `20s`-Detailansicht auch bei langen Sets oder Mixen zuverlässig erreichbar bleibt.
2. **Zuschaltbare adaptive HiDPI-Wellenform-Lupe (`Lupe`)**:
   - Aktivierung über einen eigenen `Lupe`-Toggle in der Toolbar.
   - Ein dedizierter zweiter Canvas (`264×82 px` im Retina/HiDPI-Kontext) zeichnet beim Überfahren der Wellenform direkt aus `waveformPeaks`, `activationCurve`, `beats` und `currentTime` neu – inklusive aktivem BAF/DAF/Beat-Filter, Fadenkreuz und synchronem Fokusrahmen auf der Hauptwellenform.
   - **Adaptive Optik (~5× reale Pixel-pro-Sekunde-Dichte)**: Berechnet das Lupen-Zeitfenster dynamisch zwischen `3,0 s` und `12,0 s` passend zur aktuellen Zoomstufe und Container-Breite und zeigt Vergrößerungsfaktor sowie Ausschnitt in der Kopfzeile (z. B. `5.2× · 9.5s`).
   - **Automatische Rand-Spiegelung**: Klappt bei Mauspositionen nahe Ober-/Unterkante oder Seitenrändern automatisch um, sodass die Lupe nie abgeschnitten wird. Bei aktiver Lupe entfällt der separate Hover-Tooltip.
   - **Auto-Pause in Detailansichten (`< 45 s`)**: Fällt der sichtbare Hauptbereich unter 45 Sekunden (z. B. über `20s` oder manuelles `+`), pausiert die Lupe automatisch (keine doppelte Vergrößerung über bereits detaillierter Darstellung), fällt auf den kompakten Zeit-Tooltip zurück und reaktiviert sich automatisch beim Herauszoomen.
3. **Ziehbarer blauer Viewport-Rahmen in der Mini-Map**:
   - Bei gezoomter Ansicht (`zoom > 1.01`) lässt sich der blaue Ausschnittsrahmen (`Übersicht & Navigation`) direkt per Maus greifen (`grab`/`grabbing`) und horizontal verschieben, ohne den Playhead zu versetzen.
   - Auto-Scroll greift über `prevCurrentTimeRef` nur noch bei echter Playhead-Bewegung, damit manuelles Panning bei pausiertem Player nicht zurückschnappt. Klicks außerhalb des Rahmens springen und seeken wie gewohnt.
4. **Status-abhängige `DAF`- / `BAF`-Schalter**:
   - Prüft über `hasDafCurve = result.activationCurve.some((pt) => pt.downbeatActivation !== null)` datengetrieben, ob überhaupt Downbeat-Wahrscheinlichkeiten vorliegen.
   - Existiert keine DAF-Kurve (etwa unter `md_beat_this`, `librosa` oder Browser-Fallback), wird der `DAF`-Button ausgegraut und deaktiviert; ein umschließender Tooltip erklärt den konkreten Grund zuverlässig auch im gesperrten Zustand.
   - Bei `activationSource === 'onset'` weist der Tooltip des `BAF`-Buttons darauf hin, dass die Kurve ersatzweise aus der Onset-Stärke berechnet wurde.

---

## 5. Übersicht der betroffenen Dateien & Tests

### Backend & CLI
- `backend/analyzer.py`: Integration `md_beat_this`, `run_md_beat_this`, modellgetrennter Cache, `ffmpeg_available()`, `engine_status(model)`, `license`/`attribution`-Ausgabe.
- `backend/ffmpeg_utils.py`: *Neu* — Suche, Prüfung (`ffmpeg -version`), Pfad-Bereinigung und prozessweite Aktivierung von `ffmpegDir`.
- `backend/settings.py`: Atomares Lesen/Schreiben von `settings.json` inkl. `ffmpegDir`.
- `backend/server.py`: Query-Parameter `?model=`, erweitertes `/api/health`, `POST /api/settings` für `ffmpegDir`, Auslieferung des gebauten Frontends (`dist/`).
- `backend/analyze_cli.py`: CLI-Flags `--model` und `--ffmpeg-dir`.

### Frontend (React / TypeScript)
- `src/types/analyzer.ts`: `AnalysisModel`, `EngineInfo`, `ActivationPoint.downbeatActivation: number | null`, `activationSource`, `selectedModel`, `license`, `attribution`.
- `src/utils/localBackend.ts`: Typisierung und API-Helfer `saveFfmpegDir`, erweiterte `BackendHealth`-Felder.
- `src/utils/audioAnalyzer.ts`: Übergabe des gewählten `model`-Parameters an `/api/analyze`, Browser-Fallback-Kennzeichnung.
- `src/utils/exportUtils.ts`: Übernahme der CC-BY-NC-4.0-Attribution in Exporte.
- `src/App.tsx`: Sitzungsbestätigung `mdConfirmedInSession`, zentrales Setup-/Lizenz-Modal, einzeiliges Ergebnis-Banner.
- `src/components/UploadZone.tsx`: Modell-Auswahlkacheln, Zahnrad-Button, einzeiliger Lizenzhinweis.
- `src/components/NonCommercialNoticeModal.tsx`: Lizenzbestätigung inkl. `alreadyConfirmed`-Modus, Installationshinweise und eingebettete `FfmpegDirControl`.
- `src/components/LocalSetupModal.tsx`: Erweiterung um `md_beat_this`-Hinweise und `FfmpegDirControl`.
- `src/components/FfmpegDirControl.tsx`: *Neu* — Anzeige von FFmpeg-Status, Quelle (`System-PATH` / `gewählter Ordner`), Ordner-Eingabe, Validierung und Zurücksetzen.
- `src/components/Header.tsx` & `src/components/ModelInfoModal.tsx`: Modell-Anzeige und Installationsinfos.
- `src/components/MetricsCards.tsx`: Bedingtes Rendern des „Glätten“-Reglers (`canSmooth`).
- `src/components/ExportModal.tsx`: Anzeige und Kopierfunktion der Attribution bei `md_beat_this`.
- `src/components/WaveformBeatVisualizer.tsx`: `20s`-Schnellzoom, dynamischer Maximalzoom, adaptive HiDPI-Lupe mit Auto-Pause `< 45s`, ziehbarer Mini-Map-Rahmen, datengetriebene `DAF`-Deaktivierung mit Tooltip.

### Tests & Build-Hinweis
- `backend/tests/test_analyzer.py`: Unit-Tests für `md_beat_this`-Modellwahl, Attribution/Lizenz in Analyse & Resolve-JSON, `not_installed`-Fallback und Modell-Cache-Trennung.
- `backend/tests/test_ffmpeg.py`: *Neu* — Unit- und Server-Tests für `ffmpeg_utils`, `bin/`-Auflösung, `POST /api/settings` (`ffmpegDir`), `/api/health` und Fehlercode `400` bei ungültigen Pfaden.
- **Build-Wartung**: `backend/server.py` liefert im Produktiv-/Lokalbetrieb `dist/` aus (sonst greift nur ein statischer Fallback ohne neue React-UI). Nach Frontend-Änderungen immer `npm run build` ausführen.
