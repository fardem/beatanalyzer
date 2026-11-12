# Konzept: Resolve-Dialog, Analyse aus Resolve, Mehrsprachigkeit

**Stand:** 2026-11-12 · **Status:** Entwurf zur Prüfung · **Ausgangsversion:** 0.0.5

Dieses Konzept fasst zusammen, was im Gespräch gesammelt und festgelegt wurde. Gebaut wird erst nach Freigabe
dieses Dokuments und des daraus folgenden Umsetzungsplans.

---

## 1. Ziel

BeatAnalyzer soll sich in DaVinci Resolve so bedienen lassen wie das Plugin des WhisperX Subtitle Workbench:
ein eigenes Fenster statt eines nackten Dateidialogs, mit Erklärung, was passiert, und mit Fortschritt bis zum
Ende. Dazu kommen die Analyse direkt aus Resolve heraus, drei Sprachen (Englisch, Deutsch, Türkisch) und mehr
Transparenz darüber, womit analysiert wurde.

**Erfolgreich ist das Vorhaben, wenn**

- man in Resolve einen Clip auswählt, das Skript startet und ohne Browser und ohne JSON-Suche Marker und
  Subtitles bekommt,
- der Weg über die JSON aus der Web-App weiter funktioniert, damit Korrekturen aus der Beat-Tabelle ankommen,
- der Dialog vor dem Start sagt, was passieren wird, und während der Arbeit zeigt, wo er steht,
- Web-App, Resolve-Dialog, Marker und Subtitles in der eingestellten Sprache erscheinen,
- überall sichtbar ist, ob beat_this oder librosa gerechnet hat.

---

## 2. Festlegungen aus der Sammlung

| Nr. | Festlegung | Herkunft |
|---|---|---|
| 1 | Startfenster in Resolve mit zwei Wegen: **ausgewählten Clip analysieren** und **JSON laden** | Nutzer |
| 2 | Häkchen „Subtitle Track in der Timeline anlegen“ mit Erklärung, die sich nach Häkchen und Timeline richtet | Nutzer |
| 3 | Der Song muss im Media Pool liegen, sonst kein Start | Nutzer |
| 4 | Nach OK erklärt das Fenster die Schritte und bleibt gesperrt, bis alles fertig ist | Nutzer |
| 5 | Ordner **BeatAnalyzer** im Media Pool wird angelegt, falls er fehlt | Nutzer |
| 6 | Im Media Pool liegt nur die vollständige SRT; die gekürzte Fassung gibt es nur als Subtitle Track | Nutzer |
| 7 | SRT-Dateien liegen in einem Temp-Ordner und werden nach dem Import gelöscht | Nutzer (in Resolve beobachtet, Abschnitt 6.1) |
| 8 | Längenprüfung JSON gegen Clip (Warnung) | Nutzer (Vorschlag B) |
| 9 | Erweiterter Bereich: Markerfarbe für Downbeat, Beat 2, Beat 3, Beat 4 und „übrige“, jeweils auch „kein Marker“ | Nutzer (Vorschlag C) |
| 10 | Knopf „BeatAnalyzer-Marker entfernen“ | Nutzer (Vorschlag D) |
| 11 | Einstellungen des Dialogs werden gemerkt | Nutzer (Vorschlag E) |
| 12 | Gemeinsame Einstellungsdatei (Sprache), keine Auswahl CUDA/CPU | Nutzer (Vorschlag F) |
| 13 | Anzeige des Analyse-Programms in Web-App, JSON und Resolve-Dialog | Nutzer (Vorschlag G) |
| 14 | Sprachen Englisch, Deutsch, Türkisch für Web-App, Resolve-Dialog, Marker und Subtitles | Nutzer |
| 15 | README: Unterschied zu Resolves „Show Beats“, auch *warum* das Verfahren von beat_this anders ist | Nutzer |
| 16 | Analyse aus Resolve ohne Server: Auftragsdatei, unsichtbarer Python-Prozess, Abfrage per Timer | Annahme, bestätigt |
| 17 | „Nur Downbeats“ entfällt im Export der Web-App; die JSON enthält immer alle Beats | Annahme, bestätigt |
| 18 | Alte Marker-JSONs funktionieren weiter; neue Felder sind optional | Annahme, bestätigt |
| 19 | Standardsprache „wie das System“, sonst Englisch | Annahme, bestätigt |
| 20 | Reihenfolge der Teilprojekte wie in Abschnitt 5 | Annahme, bestätigt |

---

## 3. Begriffe und Sprachregeln

### 3.1 Regel

- **Begriffe aus DaVinci Resolve bleiben in allen Sprachen englisch**, so wie sie in der englischen Oberfläche
  stehen: Media Pool, Timeline, Marker, Subtitle, Subtitle Track, *Workspace → Scripts*, *Console*.
- **Analyse-Begriffe bleiben englisch:** Beat, Downbeat, Confidence, BPM.
- **Musik-Begriffe werden übersetzt:** Takt, Taktart, Taktanzahl, Tempo.
- **Keine zusammengesetzten Wörter mit Resolve-Begriffen.** „Media Pool“ wird immer getrennt geschrieben. Statt
  „Media-Pool-Ordner“ heißt es „Ordner **BeatAnalyzer** im Media Pool“. Betroffen heute: `README.md:135`,
  `README.md:172`, `src/components/ExportModal.tsx:219`.

### 3.2 Glossar

| Begriff | Deutsch | Englisch | Türkisch |
|---|---|---|---|
| Beat, Downbeat, Confidence, BPM | wie links | wie links | wie links |
| Takt (Markername, Subtitle) | Takt 24 | Bar 24 | Ölçü 24 |
| Kachel Taktart | **Taktart** · 4/4 | **Time signature** · 4/4 | **Ölçü** · 4/4'lük |
| Kachel Taktanzahl | **Taktanzahl** · 124 | **Bars** · 124 | **Toplam** · 124 ölçü |
| Tempo | Tempo | Tempo | Tempo |

Türkisch „ölçü sayısı“ wird **nicht** verwendet: In Lehrplan und Foren steht es sowohl für die Taktart als auch
für die Anzahl der Takte (Quellen in Abschnitt 14).

**Türkische Endung der Taktart** nach Vokalharmonie, abhängig von der gesprochenen unteren Zahl:

| Untere Zahl | gesprochen | Endung | Beispiel |
|---|---|---|---|
| 2 | ikilik | 'lik | 2/2'lik |
| 4 | dörtlük | 'lük | 4/4'lük, 3/4'lük |
| 8 | sekizlik | 'lik | 6/8'lik, 9/8'lik |
| 16 | onaltılık | 'lık | 9/16'lık |

4, 8 und 16 sind durch Quellen belegt, 2 folgt aus der Regel.

### 3.3 Zahlenformat

| | Deutsch | Englisch | Türkisch |
|---|---|---|---|
| Dezimalzeichen | 89,6 BPM | 89.6 BPM | 89,6 BPM |
| Prozent | 75 % | 75% | %75 |

Zeitangaben im Subtitle (`01:02.880`) bleiben in allen Sprachen gleich, weil sie wie Timecode gelesen werden.

### 3.4 Ausgaben in Resolve

**Subtitle pro Beat:**

```
Deutsch                     Englisch                    Türkisch
Downbeat (1)                Downbeat (1)                Downbeat (1)
Takt 24 – Beat 1            Bar 24 – Beat 1             Ölçü 24 – Beat 1
01:02.880 – 89,6 BPM        01:02.880 – 89.6 BPM        01:02.880 – 89,6 BPM
Confidence 75 %             Confidence 75%              Confidence %75
```

**Marker:** Downbeat-Marker heißen „Takt 24“ / „Bar 24“ / „Ölçü 24“, alle anderen „24.2“, „24.3“ in jeder
Sprache. Die Notiz am Marker enthält Zeit und Tempo im Zahlenformat der Sprache.

Die türkischen Texte werden in den Sprachdateien als „zu prüfen“ markiert.

---

## 4. Aufbau

### 4.1 Dateien

| Datei | neu / geändert | Aufgabe |
|---|---|---|
| `lang/de.json`, `lang/en.json`, `lang/tr.json` | neu | Alle Texte. Bereiche: `_meta` (Name, Zahlenformat), `web`, `plugin`, `output` (Marker, Subtitles, Taktart) |
| `backend/i18n.py` | neu | Sprachdateien laden, Rückfall auf Englisch, Systemsprache ermitteln |
| `backend/settings.py` | neu | `settings.json` im BeatAnalyzer-Ordner lesen und schreiben |
| `backend/analyzer.py` | geändert | Angaben zum Analyse-Programm strukturiert; Taktart ohne festen Text |
| `backend/resolve_job.py` | neu | Auftrag aus Resolve ausführen |
| `backend/resolve_plugin.py` | geändert | Konfigurationsblock ins Lua-Skript schreiben; bei Sprachwechsel neu schreiben |
| `backend/server.py` | geändert | `/api/settings`; `/api/health` mit Angaben zum Analyse-Programm |
| `resolve/BeatAnalyzer_Markers.lua` | geändert | Dialog, Timer-Ablauf, Auftrag, Farben, Entfernen, Merken, Texte |
| `src/i18n.ts` | neu | `t()`, Sprachwahl, Zahlenformat |
| `src/components/*` | geändert | Texte über `t()`, Sprachwahl, Anzeige des Analyse-Programms, Export ohne „Nur Downbeats“ |
| `.gitignore` | geändert | `settings.json`, `resolve_temp/` |

Das Lua-Skript bleibt eine einzige Datei, wie beim Workbench. Resolve listet unter *Workspace → Scripts* nur
einzelne Dateien.

### 4.2 Sprachdateien

Aufbau wie im Workbench (`lang/<code>.json`): verschachtelte Schlüssel, Platzhalter in `{geschweiften}`
Klammern, `_meta` mit Name und Zahlenformat. Fehlt ein Schlüssel, gilt Englisch.

- **Web-App:** Vite bindet die drei Dateien beim Bauen ein. Eine neue Sprache braucht damit einen neuen Build;
  bei drei festen Sprachen reicht das.
- **Resolve-Skript:** Der Installer schreibt Sprache und die Texte aller drei Sprachen aus dem Bereich `plugin`
  und `output` in einen Konfigurationsblock oben im Skript (Muster `WX-CONFIG` des Workbench):

  ```lua
  -- >>> BA-CONFIG (written by the installer) >>>
  local BA = { version = "0.1.0", home = nil, python = nil, lang = "en", texts = {} }
  -- <<< BA-CONFIG <<<
  ```

  `home` ist der BeatAnalyzer-Ordner, `python` der Pfad zu `venv\Scripts\pythonw.exe`. Die Fassung im
  Repository enthält die englischen Texte, damit ein von Hand kopiertes Skript auf Englisch läuft; ein Test
  prüft, dass sie mit `lang/en.json` übereinstimmen.
- **Sprachwechsel in der Web-App:** Der Server schreibt den Konfigurationsblock des installierten Skripts neu.
  Beim nächsten Start in Resolve gilt die neue Sprache.

### 4.3 Einstellungen

`settings.json` im BeatAnalyzer-Ordner, nicht im Repository und nicht im Release-ZIP (das Update lässt sie
deshalb unverändert):

```json
{ "language": "auto" }
```

`auto` nimmt die Sprache des Systems, wenn es eine Sprachdatei dafür gibt, sonst Englisch. Ohne Server
(`npm run dev`) merkt sich die Web-App die Sprache im Browser.

Was sich der Resolve-Dialog merkt, liegt getrennt in `resolve_temp\plugin.txt` (Abschnitt 6.7), weil nur das
Skript es braucht.

---

## 5. Teilprojekte und Reihenfolge

1. **Grundlage:** Sprachdateien, Einstellungsdatei, Konfigurationsblock, Angaben zum Analyse-Programm im Backend.
2. **Resolve-Dialog mit dem JSON-Weg.**
3. **Analyse direkt aus Resolve.**
4. **Web-App:** Sprachen, Anzeige des Analyse-Programms, Export ohne „Nur Downbeats“.
5. **README.**

Jedes Teilprojekt bekommt einen eigenen Umsetzungsplan und endet lauffähig.

---

## 6. Resolve-Dialog

### 6.1 SRT-Dateien und Media Pool

Vom Nutzer in Resolve beobachtet:

1. Wird der Clip im Media Pool gelöscht, nachdem er per `AppendToTimeline` auf einen Subtitle Track gelegt
   wurde, **bleiben die Subtitles in der Timeline stehen.**
2. Ein SRT-Clip im Media Pool **bleibt verwendbar, wenn seine Datei gelöscht ist.** Resolve braucht die Datei
   nach dem Import nicht mehr (anders als bei Bild, Audio und Video).

Das Workbench-README sagt zu 2 etwas anderes („once that file has been deleted … the item is offline“). Hier
gilt die Beobachtung des Nutzers.

**Folgen:**

- Beide SRT-Dateien (`<Song>.srt` und `<Song> (Timeline).srt`) entstehen in einem Arbeitsordner und werden
  nach dem Import gelöscht. Arbeitsordner ist der Auftragsordner aus Abschnitt 7.1, beim JSON-Weg ein eigener
  Ordner nach demselben Muster unter `<BeatAnalyzer>\resolve_temp\`. Ist der BeatAnalyzer-Ordner unbekannt
  (Skript von Hand kopiert), der Temp-Ordner des Systems.
- Die SRT entsteht damit nicht mehr neben der JSON wie bisher.
- Der Zwischen-Clip `<Song> (Timeline).srt` wird nach dem Platzieren aus dem Media Pool gelöscht. Im Ordner
  **BeatAnalyzer** bleibt nur `<Song>.srt`.

### 6.2 Zustände des Fensters

Ein Fenster mit drei Zuständen.

**Auswahl**

```
┌ BeatAnalyzer 0.1.0 ───────────────────────────────────────────┐
│ ( ) Ausgewählten Clip analysieren   (•) JSON laden            │
│ JSON:  C:\Musik\Song_resolve_markers.json       [Auswählen …] │
│ Clip:  Song.mp3 im Media Pool · 3:42                          │
│        ⚠ JSON 3:42, Clip 3:58 – ist das dieselbe Fassung?     │
│                                                               │
│ [x] Subtitle Track in der Timeline anlegen                    │
│     In der Timeline „Edit 1“ liegt der Song auf A2 ab         │
│     01:00:12:00. Darunter entsteht der Subtitle Track         │
│     „BeatAnalyzer – Song“ und wird aktiv. Resolve erlaubt     │
│     nur einen aktiven Subtitle Track; die anderen bleiben,    │
│     werden aber deaktiviert.                                  │
│                                                               │
│ [ ] Markerfarben anpassen                                     │
│     Downbeat [Red ▾]  Beat 2 [Cyan ▾]  Beat 3 [Cyan ▾]        │
│     Beat 4 [Cyan ▾]   übrige [Cyan ▾]                         │
│                                                               │
│ [BeatAnalyzer-Marker entfernen]          [Schließen]  [OK]    │
└───────────────────────────────────────────────────────────────┘
```

- Ein Timer prüft einmal pro Sekunde Auswahl im Media Pool und offene Timeline und aktualisiert Clip-Zeile und
  Erklärung.
- **OK** ist nur aktiv, wenn ein Ziel-Clip da ist (Abschnitt 6.3).
- Die Erklärung unter dem Häkchen hat vier Fassungen:
  - Häkchen gesetzt, Song in der offenen Timeline: wie oben.
  - Häkchen gesetzt, Song nicht in der Timeline: „Der Song liegt nicht in der Timeline „Edit 1“. Es entsteht nur
    der Subtitle im Media Pool.“
  - Häkchen gesetzt, keine Timeline offen: „Keine Timeline offen. Es entsteht nur der Subtitle im Media Pool.“
  - Häkchen nicht gesetzt: „Die Timeline bleibt unverändert. Der Subtitle mit allen Beats liegt im Ordner
    **BeatAnalyzer** im Media Pool und kann von dort in jede Timeline gezogen werden.“

**Arbeit** (nach OK)

```
│ Was jetzt passiert:                                           │
│ ✓ 1. Analyse mit beat_this (CUDA, RTX 3080)        0:14       │
│ … 2. Marker auf den Clip „Song.mp3“ im Media Pool  240 / 512  │
│      Resolve setzt jeden Marker einzeln, das dauert etwas.    │
│   3. Ordner BeatAnalyzer im Media Pool, Subtitle „Song.srt“   │
│   4. Subtitle Track „BeatAnalyzer – Song“ in „Edit 1“         │
│                                                               │
│ Bitte warten – das Fenster schließt sich erst am Ende.        │
│                                                  [Abbrechen]  │
```

- Schritt 1 erscheint nur beim Weg „Clip analysieren“, Schritt 4 nur mit Häkchen und Song in der Timeline.
- Alle Eingaben sind gesperrt. Schließen über das X wird ignoriert, solange gearbeitet wird; ob Resolve das
  zulässt, prüft der Test in Resolve (Abschnitt 11.3).
- **Abbrechen** gibt es nur während der Analyse. Bis dahin ist im Projekt nichts verändert. Ab Schritt 2 läuft
  der Vorgang zu Ende, damit kein halber Zustand bleibt.
- Projekt, Timeline und Clip werden beim Klick auf OK festgehalten. Wechselt man währenddessen die Timeline,
  landet der Subtitle Track trotzdem in der Timeline, die beim Start offen war.

**Ergebnis**

Zusammenfassung wie heute (Anzahl Marker, Subtitle, Track), dazu Warnungen und das Analyse-Programm. **OK**
schließt das Fenster.

### 6.3 Ziel-Clip

| Weg | Ziel | Kein Start, wenn |
|---|---|---|
| JSON laden | Auswahl im Media Pool; ohne Auswahl alle Clips mit dem Dateinamen aus der JSON (wie heute) | kein Clip gefunden |
| Clip analysieren | genau ein ausgewählter Audio-Clip | keiner oder mehrere ausgewählt, Clip ohne Dateipfad |

Weicht beim JSON-Weg der Dateiname des ausgewählten Clips von der JSON ab, erscheint eine Warnung; der Start
bleibt möglich.

### 6.4 Längenprüfung

Die Länge laut JSON (`duration`) wird mit der Länge des Clips verglichen (Frames geteilt durch Bildrate). Ab
0,5 s Unterschied erscheint eine Warnung in der Clip-Zeile. Der Start bleibt möglich.

### 6.5 Markerfarben

Fünf Auswahlfelder: Downbeat, Beat 2, Beat 3, Beat 4, übrige. Jedes bietet die 16 Markerfarben von Resolve
(Blue, Cyan, Green, Yellow, Red, Pink, Purple, Fuchsia, Rose, Lavender, Sky, Mint, Lemon, Sand, Cocoa, Cream)
und „kein Marker“. Vorgabe: Downbeat Red, alle anderen Cyan, also wie heute.

| Takt | Beat 1 | Beat 2 | Beat 3 | Beat 4 | Beat 5, 6, … |
|---|---|---|---|---|---|
| 3/4 | Downbeat | Beat 2 | Beat 3 | – | – |
| 4/4 | Downbeat | Beat 2 | Beat 3 | Beat 4 | – |
| 6/8, 7/8 … | Downbeat | Beat 2 | Beat 3 | Beat 4 | übrige |

Die Zählzeit kommt pro Takt aus der JSON (`beat`), Taktwechsel im Song sind damit abgedeckt.
„Nur Downbeats“ entsteht, indem man Beat 2 bis übrige auf „kein Marker“ stellt.

Die Farbauswahl betrifft nur die Marker. Die Subtitles enthalten immer alle Beats.

### 6.6 BeatAnalyzer-Marker entfernen

Wirkt auf den Ziel-Clip aus 6.3. Vorher fragt der Dialog nach und nennt, was gelöscht wird:

- Marker mit der eigenen Kennung am Clip (von Hand gesetzte Marker bleiben),
- Subtitle Track „BeatAnalyzer – <Song>“ (und den alten Namen „BeatThis – <Song>“) in der offenen Timeline,
- Clip `<Song>.srt` im Ordner **BeatAnalyzer** im Media Pool.

### 6.7 Was sich der Dialog merkt

In `<BeatAnalyzer>\resolve_temp\plugin.txt` (Zeilen `schlüssel=wert`): gewählter Weg, Ordner der letzten JSON,
Häkchen Timeline, die fünf Farben, ob der Farbbereich offen ist, Fenstergröße und -position. Ohne bekannten
BeatAnalyzer-Ordner (Skript von Hand kopiert) wird nichts gemerkt.

---

## 7. Analyse direkt aus Resolve

### 7.1 Ablauf

1. Das Skript legt den Auftragsordner `<BeatAnalyzer>\resolve_temp\<Datum-Zeit>-<Zufall>\` an und schreibt
   `job.txt`:

   ```
   format=beatanalyzer-resolve-job/1
   audio=D:\Musik\Şarkı – Live.flac
   lang=de
   ```

   Der Pfad zum Song steht nur in dieser Datei (UTF-8), nicht auf der Kommandozeile.
2. Es startet `pythonw.exe backend\resolve_job.py <Auftragsordner>` ohne Fenster, über `ShellExecuteW` (ffi),
   damit auch ein BeatAnalyzer-Ordner mit Umlauten im Pfad geht. Ersatzweg: `os.execute`.
3. Python schreibt `progress.txt` bei jedem Schritt (`step=model|analyze|write`) und am Ende
   `markers.json` (Format wie die Marker-JSON der Web-App) und zuletzt `done.txt`:

   ```
   state=ok            (oder: error / cancelled)
   markers=markers.json
   message=…           (bei error)
   ```

   `done.txt` entsteht über eine temporäre Datei und Umbenennen, damit das Skript nie eine halbe Datei liest.
4. Das Skript fragt einmal pro Sekunde nach, zeigt den Schritt an und macht nach `state=ok` weiter wie beim
   JSON-Weg (Marker, Subtitles, Timeline).
5. Am Ende löscht das Skript den Auftragsordner samt SRT-Dateien (6.1). Auftragsordner, die
   älter als ein Tag sind, löscht es beim Start.

Der Python-Prozess beendet sich nach `done.txt` selbst. Ein Server wird nicht gestartet.

### 7.2 Abbrechen und Zeitgrenzen

- **Abbrechen** schreibt `cancel.txt`. Python prüft das zwischen den Schritten und endet mit
  `state=cancelled`. Das Skript wartet darauf nicht, sondern kehrt sofort zur Auswahl zurück.
- Gibt es nach 60 s noch kein `progress.txt`, meldet das Skript, dass Python nicht gestartet ist, mit dem Pfad
  zu Python aus dem Konfigurationsblock.
- Nach 10 Minuten ohne `done.txt` bricht das Skript ab.

---

## 8. Angaben zum Analyse-Programm

`analyze_audio_file()` liefert zusätzlich zu `engine` (Anzeigetext, bleibt für alte Leser) das Feld
`engineInfo`:

```json
{
  "id": "beat_this",              // oder "librosa"
  "device": "cuda",               // oder "cpu"; bei librosa null
  "gpu": "NVIDIA GeForce RTX 3080",
  "fallbackReason": null          // "not_installed" | "model_load_failed" | "inference_failed"
}
```

- Die Marker-JSON bekommt dasselbe Objekt als optionales Feld `engine`.
- `/api/health` meldet, was bei der nächsten Analyse benutzt würde.
- **Web-App:** Anzeige in der Kopfzeile, z. B. „beat_this · CUDA (RTX 3080)“ oder „librosa (Ersatz) –
  beat_this nicht installiert“.
- **Resolve-Dialog:** in Schritt 1 und im Ergebnis; beim JSON-Weg aus dem Feld `engine` der JSON, wenn
  vorhanden.

Die Taktart kommt als `numerator`/`denominator` ohne festen Text („3/4 (Walzer)“, „4/4 (Standard)“ entfallen);
die Anzeige baut jede Oberfläche in ihrer Sprache.

---

## 9. Web-App

- Sprachwahl in der Kopfzeile: System, Deutsch, English, Türkçe. Gespeichert über `/api/settings`.
- Alle Texte der Komponenten über `t()`. Zahlen über `Intl.NumberFormat` mit der Sprache aus `_meta`.
- Kacheln Taktart und Taktanzahl nach Glossar 3.2.
- Export „DaVinci Resolve“: Auswahl „Nur Downbeats“ entfällt; Hinweis, dass die Farben im Resolve-Dialog
  eingestellt werden. Die Option `--only-downbeats` der Kommandozeile bleibt unverändert.
- Anzeige des Analyse-Programms nach Abschnitt 8.

---

## 10. README

- Neuer Abschnitt: **Resolves „Show Beats“ und beat_this im Vergleich.** Nicht nur, was sich in der Funktion
  unterscheidet, sondern warum das Verfahren von beat_this anders arbeitet und welche Vorteile das bringt.
  Grundlage: das Paper „Beat this! Accurate beat tracking without DBN postprocessing“ (ISMIR 2024) und die
  Dokumentation von Resolve. Was Resolve intern macht und nicht dokumentiert ist, wird als solches benannt und
  nicht vermutet.
- Aussage „mit NVIDIA-Grafikkarte über CUDA“ prüfen: Wenn die Standardinstallation unter Windows nur die
  CPU-Fassung von PyTorch installiert, wird der Satz berichtigt.
- Neuer Ablauf in Resolve (beide Wege, Farben, Entfernen), Sprachen, Anzeige des Analyse-Programms.
- Schreibweise nach Abschnitt 3.1. Das README bleibt deutsch.

---

## 11. Fehlerfälle und Tests

### 11.1 Fehlerfälle im Resolve-Dialog

| Fall | Verhalten |
|---|---|
| Kein Projekt offen | Meldung, OK gesperrt |
| JSON nicht lesbar oder falsches Format | Meldung in der JSON-Zeile, OK gesperrt |
| Kein Ziel-Clip | Hinweis in der Clip-Zeile, OK gesperrt |
| Clip analysieren: BeatAnalyzer-Ordner oder Python fehlt | Meldung: BeatAnalyzer neu installieren bzw. *In Resolve installieren* klicken |
| Python startet nicht / Zeitgrenze | Meldung nach 7.2, nichts im Projekt verändert |
| Analyse meldet `state=error` | Meldung mit Text aus `done.txt`, nichts im Projekt verändert |
| Subtitle-Import oder Track scheitert | Marker bleiben, Meldung mit Grund (wie heute) |
| Zwischen-Clip lässt sich nicht löschen | bleibt liegen, Hinweis im Ergebnis |

### 11.2 Automatische Tests

**Python** (`unittest`):

- Sprachdateien: alle Schlüssel in allen drei Sprachen, gleiche Platzhalter (wie `test_i18n.py` im Workbench).
- `settings.py`: lesen, schreiben, kaputte Datei, fehlende Datei.
- `resolve_job.py` mit ersetztem Analyzer: `progress.txt`, `done.txt` bei Erfolg, Fehler und Abbruch.
- `resolve_plugin.py`: Konfigurationsblock schreiben, erneut schreiben, Sprachwechsel; englische Texte im
  Repository stimmen mit `lang/en.json` überein.
- `analyzer.py`: `engineInfo` für beat_this, nicht installiert, Fehler bei der Analyse.

**Lua** (über `lupa` gegen den nachgebauten Resolve in `test_resolve_script.py`). Die Logik wird von der
Oberfläche getrennt, damit sie testbar ist:

- Farbzuordnung nach Zählzeit inklusive 3/4, 6/8 und „kein Marker“.
- Texte je Sprache: Subtitle-Zeilen, Markernamen, Dezimalzeichen, Prozent, türkische Endung der Taktart.
- Längenprüfung, Ziel-Clip, Fassungen der Erklärung unter dem Häkchen.
- Marker in Häppchen setzen (gleiches Ergebnis wie in einem Durchgang).
- Entfernen: eigene Marker, Track, Clip; fremde Marker bleiben.
- Auftrag: `job.txt` schreiben, `done.txt` lesen, Aufräumen alter Auftragsordner.

**Web-App:** `npm run lint`, `npm run build`.

### 11.3 Test in Resolve (durch den Nutzer)

Nach Teilprojekt 2 und 3 je eine Liste zum Abhaken, unter anderem: Fenster bleibt bedienbar und zeigt den
Fortschritt, X während der Arbeit, Abbrechen während der Analyse, Song mit Umlauten im Namen, gekürzter und
verschobener Clip in der Timeline, zweiter Lauf ersetzt Marker und Track, Entfernen.

---

## 12. Nicht Teil dieses Vorhabens

- Auswahl CUDA oder CPU.
- Übersetzung der Batch-Dateien (`install_and_run.bat` usw.), der Kommandozeile und der Konsolenmeldungen des
  Servers.
- Die eingebaute Ersatzseite in `backend/server.py`, die nur ohne `dist/` erscheint.
- Weitere Sprachen über die drei hinaus.
- Erkennung von Taktarten mit unterer Zahl 8 im Analyzer (heute immer x/4).

---

## 13. Offene Entscheidungen

Beim Lesen des Codes aufgefallen. Beides gehört nicht zur ursprünglichen Sammlung, betrifft aber die Subtitles
und den README-Vergleich direkt.

**13.1 Confidence ist heute kein echter Wert.**
Das Backend setzt für jeden Downbeat 0,95 und für jeden anderen Beat 0,88 (`backend/analyzer.py:185`), die
Confidence der Taktart steht fest auf 95. Im Subtitle stünde also immer „Confidence 95 %“ oder „88 %“.

- a) Echten Wert aus beat_this übernehmen: die Wahrscheinlichkeit, die das Modell am Beat-Frame ausgibt.
  Bei librosa steht „–“. Ob beat_this diese Werte über seine Schnittstelle herausgibt, wird in Teilprojekt 1
  geprüft.
- b) Confidence aus Subtitles und Beat-Tabelle entfernen.

Empfehlung: a.

**13.2 Die Aktivierungskurven in der Web-App stammen nicht von beat_this.**
„Beat-Aktivierung“ ist die Onset-Stärke von librosa, die „Downbeat-Aktivierung“ wird in der Nähe von
Downbeats künstlich angehoben (`backend/analyzer.py:94-115`). Das README nennt sie Aktivierungskurven von
beat_this.

- a) Echte Ausgaben von beat_this anzeigen (derselbe Modellaufruf wie 13.1 a). Bei librosa heißt die Kurve
  „Onset-Stärke“, eine Downbeat-Kurve gibt es dann nicht.
- b) Kurven umbenennen und README berichtigen.

Empfehlung: a. Für den README-Vergleich (Abschnitt 10) ist es glaubwürdiger, wenn die Web-App zeigt, was das
Modell tatsächlich ausgibt.

---

## 14. Quellen zu den Begriffen

- MEB-Lehrplan Musik: [Einheit 659](https://tymm.meb.gov.tr/muzik-dersi-temel-egitim/unite/659) („2/4 ölçü
  sayısı“), [Einheit 663](https://tymm.meb.gov.tr/muzik-dersi-temel-egitim/unite/663) („3/4 ölçü sayısı“)
- [Ekşi Sözlük: ölçü sayısı](https://eksisozluk.com/olcu-sayisi--3797892) (beide Bedeutungen)
- [MuseScore-Forum: Ölçü sayısı arttırma](https://musescore.org/en/comment/1081627) (Anzahl der Takte)
- [mygitar-Forum: 4/4 Lük ritm nasıl atılır](https://www.mygitar.com/forum/forum/ana-basliklarimiz/genel-gitar/16654-4-4-l%C3%A3%C2%BCk-ritm-nas%C3%A4%C2%B1l-at%C3%A4%C2%B1l%C3%A4%C2%B1r)
- [trakyamuzik-Forum: 7/8 lik şarkı isimleri lazım](https://trakyamuzik.net/konu/7-8-lik-sarki-isimleri-lazim.18993/)
- [Ekşi Sözlük: 9/8'lik](https://eksisozluk.com/9-8lik--656511?p=7)
- [Müzik Defteri: 9/4'lük, 9/8'lik ve 9/16'lık](https://muzik-defteri.blogspot.com/2019/11/dokuz-zamanl-olculer-94luk-98lik-ve.html)
- [Erturgut Sanat Merkezi](https://erturgutsanatmerkezi.com/bateride-sarki-nasil-ezberlenir/) („8'er ölçü“)
- [Schreibregeln TR, Hochschul-Skript](https://web.ogu.edu.tr/Storage/DenizDepe/Uploads/kompozisyon-s%C4%B1n%C4%B1f%C4%B1-ic%CC%A7in-noktalama.pdf) (%25, Dezimalkomma)

Ekşi Sözlük, keyfimuzik.net und trakyamuzik.net ließen sich in der Sitzung nicht direkt öffnen; die Angaben
stammen aus den Zusammenfassungen der Websuche.
