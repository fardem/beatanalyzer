# Test in DaVinci Resolve – Version 0.1.6

Vorher: main holen, **`install_and_run.bat`** starten, in der Web-App **In Resolve aktualisieren**, Resolve neu
starten. Bei jedem Punkt ✓ / ✗ notieren; bei ✗ die Resolve-Konsole mitschicken.

| # | Was tun | Was soll passieren |
|---|---|---|
| 1 | `install_and_run.bat` durchlaufen lassen | Zeile „Lade das Modell von beat_this vorab …“, danach „Modell final0 von beat_this bereit (…)“; keine abgebrochenen Blöcke |
| 2 | Fenster öffnen | Titel „BeatAnalyzer 0.1.6“; Konsole „Window: requested …, actual …“ (ggf. „resized to …“); **Breite bei jedem Öffnen gleich** |
| 3 | Fenster mehrere Sekunden offen lassen, Clip im Media Pool ausgewählt | Konsole: „ignored entries …“ höchstens einmal |
| 4 | Regler „Glätten“ überfahren | kurzer Tooltip (4 Zeilen) |
| 5 | Erklärung unter „Subtitle Track“ ansehen, dann überfahren | eine kurze Zeile; Tooltip mit der langen Fassung |
| 6 | Analysieren, OK | „Tasks“ mit kurzen Zeilen, kein Songname in jeder Zeile |
| 7 | Nach dem Lauf einen Marker anklicken | Notiz z. B. „Takt 24 – Beat 2 \| 106,860 s \| 120,0 BPM \| Confidence 75 %“ |
| 8 | Song in A1 (zweimal, einmal vorne gekürzt) und in A2, OK | zwei Subtitle Tracks „… (A1)“ und „… (A2)“; A1 enthält beide Vorkommen, jeweils unter dem Clip |
| 9 | Nochmal laufen lassen | weiterhin genau zwei Tracks (ersetzt, nicht verdoppelt) |
| 10 | „BeatAnalyzer-Marker entfernen“ | beide Tracks weg, Marker weg, Handmarker bleiben |
| 11 | Song nur in A1 | Track heißt wie bisher „BeatAnalyzer - Song“ |
| 12 | OK, während der Arbeit eine andere Timeline öffnen | Subtitle Track in der Timeline vom OK; danach zeigt Resolve wieder die andere Timeline |
| 13 | Analyse starten, Abbrechen, Fenster schließen und neu öffnen | Ordner der abgebrochenen Analyse in `resolve_temp` ist weg |
| 14 | (optional) Modell-Ordner `%USERPROFILE%\.cache\torch\hub\checkpoints` **kopieren** (nicht verschieben!) als Sicherung, Datei `beat_this-final0.ckpt` umbenennen, `install_and_run.bat` | Download; scheitert er, steht die Ursache da. Danach den Namen zurück |
