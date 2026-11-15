# Test in DaVinci Resolve – Version 0.2.4

Nachtest zu 0.2.3. Vorher: main holen, **`install_and_run.bat`** (falls PyAV noch fehlt), in der Web-App **In Resolve
aktualisieren**, Resolve neu starten.

| # | Was tun | Was soll passieren |
|---|---|---|
| 1 | MP3 und dieselbe Datei als WAV übereinander in die Timeline (gleicher Start), MP3 im Media Pool auswählen, „Ausgewählten Clip analysieren“ | Hinweis „MP3: … BeatAnalyzer setzt die Marker entsprechend später.“; danach Meldung „MP3: Marker um 51 ms nach hinten gesetzt“ (bei 44,1 kHz) |
| 2 | Stark hineinzoomen, Marker der MP3 mit der Wellenform der MP3 vergleichen | Marker sitzen auf dem Beat (± ½ Frame), nicht mehr davor |
| 3 | WAV auswählen und analysieren | keine MP3-Meldung, Marker sitzen auf dem Beat |
| 4 | Alte Marker-JSON einer MP3 laden (vor 0.2.4 exportiert) | Warnhinweis „Diese JSON enthält keinen Ausgleich …“ |
| 5 | m4a im Media Pool analysieren | läuft durch (oder klare Fehlermeldung mit Abhilfe, OK grau) |

## Web-App

| # | Was tun | Was soll passieren |
|---|---|---|
| 6 | m4a-Datei analysieren | Banner nennt das Modell (nicht „Fallback aktiv“) – oder eine rote Fehlermeldung des Servers, **kein** stilles Weiterrechnen im Browser |
| 7 | MP3 analysieren, *Exportieren → DaVinci Resolve*, JSON in Resolve laden | Meldung „MP3: Marker um … ms nach hinten gesetzt“ |
