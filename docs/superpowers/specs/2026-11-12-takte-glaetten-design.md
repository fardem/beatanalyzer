# Konzept: Takte glätten

**Stand:** 2026-11-12 · **Status:** Entwurf zur Prüfung · **Größe:** kleine Änderung

## Warum

Der Nutzer schneidet Videos auf die „1“ eines Takts. beat_this setzt jeden Downbeat einzeln (ohne DBN), dadurch
entstehen an unsicheren Stellen (Intro ohne Schlagzeug, Breaks, Build-ups) Takte mit 2 oder 3 Beats. Beispiel aus
dem Test: „Waiting For Tonight“, 4/4, nur 74 % der Takte mit 4 Beats. An diesen Stellen sind die „1“en falsch, und
der Mehrgewinn gegenüber Resolves eigener Beat-Erkennung geht verloren.

## Ziele

- Ein gleichmäßiges Taktraster, wo das Modell unsicher ist.
- Kein Raster „auf Teufel komm raus“: Wo das Modell klar eine andere „1“ hört (Edits, eingeschobene halbe Takte),
  setzt das Raster dort neu an.
- Die Beats von beat_this bleiben unverändert; nur die Einteilung in Takte ändert sich.
- Abschaltbar für Songs mit echten Taktwechseln.

**Nicht-Ziele:** Beats verschieben oder ergänzen; Taktarten mit unterer Zahl 8 erkennen; Glätten der
librosa- oder Browser-Analyse (die setzen ohnehin stur jeden 3. oder 4. Beat als Downbeat).

**Wäre ein Fehlschlag:** Wenn klare Downbeats des Modells überstimmt werden, nur damit das Raster gleichmäßig ist.

## Wege (gewählt: 1)

1. **Eigene Glättung im Analyzer** – für jeden Beat die wahrscheinlichste Zählzeit; normal geht es 1, 2, 3, 4
   weiter, ein Neuansatz „kostet“ und lohnt sich nur bei sicherer gegenteiliger Evidenz. Kein neues Paket.
   **Gewählt vom Nutzer.**
2. DBN-Option von beat_this – braucht `madmom` (für Python 3.13 nur selbst übersetzt, unter Windows mit
   C++ Build Tools), verschiebt auch die Beats, nimmt festes Tempo an. Verworfen.
3. Feste Anker ab einer Sicherheitsschwelle, dazwischen stur zählen – kippt hart an der Schwelle. Verworfen.

## Entwurf

**Ort:** `backend/analyzer.py`, nach `run_beat_this`, vor dem Durchnummerieren der Takte. Nur bei beat_this.

**Verfahren** (Vorschlag, Details beim Bauen):

- Taktart N = häufigste Beat-Anzahl der Takte des Modells (wie `meter_from_beats`).
- Für jeden Beat i die Downbeat-Wahrscheinlichkeit d_i (wie heute die Confidence eines Downbeats: höchster Wert
  im Bereich ±3 Frames).
- Viterbi über die Beats: Zustand = Zählzeit 1…N. Übergang „weiterzählen“ (Zählzeit + 1, nach N wieder 1) ist
  normal; „neu ansetzen“ (Sprung auf eine andere Zählzeit) kostet eine feste Strafe. Bewertung je Beat:
  log d_i auf Zählzeit 1, log (1 − d_i) auf den anderen. Anfang: jede Zählzeit gleich wahrscheinlich
  (Auftakt möglich).
- **Strafe (meine Wahl):** so, dass ein Neuansatz erst bei etwa zwei Takten klarer gegenteiliger Evidenz
  gewinnt (Größenordnung log ε ≈ −9). Wird mit Testfällen festgelegt und steht als Konstante im Code.
- **Wann nicht geglättet wird (meine Wahl):** wenn weniger als 50 % der Modell-Takte die Taktart N haben (dann
  ist der Song vermutlich wirklich unregelmäßig) oder es weniger als 2 Downbeats gibt.

**Ergebnis:**

- `beats[i].isDownbeat`, `beatInBar`, `barIndex` aus der Glättung; die Confidence bleibt der Modellwert am
  Beat. Ein vom Raster ergänzter Downbeat zeigt also ehrlich eine niedrige Confidence.
- Neues Feld `barSmoothing`: `{ "applied": bool, "meter": N, "changedBeats": n, "reanchors": k }`.
- `timeSignature.barShare` bleibt der Anteil **vor** dem Glätten (wie regelmäßig das Modell selbst war).
- Marker-JSON, Resolve-Marker und Subtitles übernehmen die geglätteten Takte automatisch.

**Abschalten (meine Wahl):**

- Web-App: Häkchen „Takte glätten“ neben der Kachel Taktart, standardmäßig an; Umschalten analysiert dieselbe
  Datei neu (`/api/analyze` mit `smoothBars=0`). Wird nicht gespeichert, gilt pro Song. Bei librosa/Browser
  ausgegraut.
- Kachel Taktart: zusätzlich „n Takte geglättet“, wenn geglättet wurde.
- Kommandozeile: `--no-smooth-bars`.
- Resolve: Die Analyse aus Resolve (Teilprojekt 3) glättet immer; ein Schalter im Resolve-Fenster kommt bei
  Bedarf später.
- Die Korrektur von Hand in der Beat-Tabelle (`1/X`) bleibt.

**Tests (Pflicht):** mit erfundenen Wahrscheinlichkeiten, ohne Modell:

1. Intro mit niedrigen Downbeat-Werten, danach klare 4/4-Takte → Intro wird im Raster gezählt.
2. Ein einzelner unsicherer Downbeat mitten im Song (Takt aus 2 Beats) → verschwindet.
3. Eingeschobener halber Takt, danach mehrere Takte mit klarer „1“ an neuer Stelle → Raster setzt neu an
   (`reanchors == 1`).
4. Weniger als 50 % regelmäßige Takte → `applied == false`, Takte wie vom Modell.
5. Auftakt: erster klarer Downbeat beim 3. Beat → die zwei Beats davor gehören zu Takt 1 mit Zählzeit 3 und 4,
   der erste Downbeat beginnt Takt 2 (wie die Browser-Analyse es heute schon schreibt).
6. `smoothBars=0` → Ergebnis identisch mit heute.

## Dem Bauenden überlassen

- Genaue Strafe innerhalb der beschriebenen Größenordnung (Tests 1–3 müssen grün sein).
- Ob die Viterbi-Rechnung in Log-Werten mit NumPy oder als einfache Schleife geschrieben wird.
- Wortlaut der Texte in der Web-App (Deutsch; Übersetzung mit Teilprojekt 4).
