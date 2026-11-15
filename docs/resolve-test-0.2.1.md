# Test in DaVinci Resolve – Version 0.2.1

Vorher: Branch holen, `start.bat`, in der Web-App **In Resolve aktualisieren**, Resolve neu starten.

| # | Was tun | Was soll passieren |
|---|---|---|
| 1 | Fenster öffnen, „Ausgewählten Clip analysieren“ | Zeile **Modell** mit `beat_this (MIT) – Standard`; Regler „Glätten“ sichtbar |
| 2 | Modell `md_beat_this` wählen | Lizenzhinweis mit `https://github.com/fosfrancesco/md_beat_this` und Häkchen erscheinen, „Glätten“ verschwindet, OK gesperrt, Hinweis „Lizenz-Häkchen setzen“ |
| 3 | Häkchen setzen, OK (md_beat_this **nicht** installiert) | Analyse läuft mit librosa; Zeile „Analysiert mit librosa – md_beat_this nicht installiert“ |
| 4 | Wie 3, md_beat_this **installiert** | „Analysiert mit md_beat_this (CUDA/CPU …)“; Subtitle ohne „Confidence“, Zeile „Model: md_beat_this – Nutzung im Rahmen der CC BY-NC 4.0-Lizenz“ |
| 5 | Fenster schließen und neu öffnen | Modell `md_beat_this` bleibt gewählt, Häkchen ist wieder leer |
| 6 | Zurück auf `beat_this`, analysieren | wie in 0.1.8 (Confidence-Zeile, „Glätten“ wirkt) |
| 7 | Fensterbreite/-höhe mit den neuen Zeilen | nichts abgeschnitten oder überlappend; sonst Bildschirmfoto |

## Web-App

| # | Was tun | Was soll passieren |
|---|---|---|
| 8 | Song (> 60 s) laden, Abspielposition in die Mitte, nacheinander `5s`, `15s`, `30s`, `60s` | Ausschnitt dieser Länge um die Abspielposition, der aktive Knopf ist hervorgehoben |
| 9 | Aktiven Knopf nochmals klicken | ganze Datei sichtbar (1.0x) |
| 10 | Song kürzer als 30 s laden | `30s` und `60s` gesperrt, Tooltip „Track ist kürzer als …“ |
| 11 | Modell `md_beat_this` wählen | Lizenzfenster mit Häkchen; danach Lizenzzeile in der Ergebnisansicht |
