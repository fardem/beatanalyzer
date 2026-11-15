# Test in DaVinci Resolve – Version 0.2.5

Nachtest zu 0.2.4. Vorher: main holen, `start.bat`, in der Web-App **In Resolve aktualisieren**, Resolve neu starten.

| # | Was tun | Was soll passieren |
|---|---|---|
| 1 | MP3 in der Web-App analysieren, *Exportieren → DaVinci Resolve* öffnen | Hinweis „MP3: Resolve spielt MP3-Dateien 51 ms später ab … Die JSON enthält diesen Ausgleich …“ |
| 2 | Diese JSON in Resolve laden (Weg „JSON laden“), **vor** OK | Zeile „MP3: Die Marker werden 51 ms später gesetzt …“ (ohne ⚠) |
| 3 | OK | am Ende „MP3: Marker um 51 ms nach hinten gesetzt …“; Marker auf dem Beat |
| 4 | m4a im Media Pool analysieren (Punkt 5 aus 0.2.4, noch offen) | läuft durch, keine MP3-Meldung |

## Ergebnis 0.2.4 (Nutzer)

- MP3-Ausgleich bestätigt: Marker der neu analysierten MP3 sitzen auf dem Beat (Rest wenige ms, innerhalb eines
  halben Frames); WAV ohne Meldung und richtig; alte JSON mit Warnhinweis; m4a in der Web-App über den Server.
- „Meldung MP3 …“ beim Weg über die Web-App-JSON nicht gefunden → 0.2.5 zeigt den Ausgleich vor OK und im Export.
