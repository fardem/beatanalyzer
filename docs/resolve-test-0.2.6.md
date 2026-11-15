# Test – Version 0.2.6 (Web-App, Teilprojekt 4 Schritt 1)

Vorher: main holen, `start.bat`.

| # | Was tun | Was soll passieren |
|---|---|---|
| 1 | Song analysieren, `5s` wählen | Wellenform mit einzelnen Anschlägen (wie in Resolve), Beat-Linien auf den Anschlägen |
| 2 | Lupe einschalten, über die Wellenform fahren (ganze Ansicht) | Lupe zeigt dieselbe detaillierte Wellenform |
| 3 | Ganze Datei (1.0x), dann 60s/30s/15s/5s | Takt-Fähnchen und Zeitachse überlappen nie; bei 1.0x nur jeder n-te Takt beschriftet |
| 4 | Kopfzeile vor und nach der Analyse | zeigt das Analyse-Programm, z. B. „beat_this · CUDA (RTX 5080)“ oder „md_beat_this · CUDA …“; Tooltip mit Lizenz |
| 5 | Server beenden, Seite neu laden, Song analysieren | Kopfzeile „Browser-Analyse (Ersatz) – kein Server“, Banner „Fallback aktiv“ |
| 6 | *Exportieren → DaVinci Resolve* | keine Auswahl „Nur Downbeats“, kein Farbhinweis |
| 7 | Langer Song (5 min), abspielen | flüssig, kein Ruckeln durch die detaillierte Wellenform |

## Ergebnis 0.2.5 (Nutzer)

Alle Punkte bestanden (MP3-Hinweis im Export und vor OK, Meldung am Ende, m4a in Resolve).
