# Test – Version 0.2.12 (Texte des Servers englisch)

Vorher: main holen, `start.bat`.

| # | Was tun | Was soll passieren |
|---|---|---|
| 1 | `start.bat` starten, Konsole ansehen | Ausgaben englisch („local analysis server started“, „Server running. Press CTRL + C to stop.“) |
| 2 | Kaputte oder leere Datei mit Endung .m4a in der Web-App analysieren | rote Meldung der Web-App in deiner Sprache, der Teil vom Server englisch („Audio analysis failed: Cannot read the format …“) |
| 3 | Web-App: *Lokal starten* → ffmpeg-Ordner mit falschem Pfad speichern | englische Meldung („No runnable ffmpeg found in the folder …“) |
| 4 | Kommandozeile: `run_cli.bat` mit einer Audiodatei | Ausgabe englisch („Tempo:“, „Time signature:“, „[OK] JSON saved: …“) |
| 5 | Update in der Web-App (falls angeboten) | Meldung englisch („BeatAnalyzer … installed. Restart BeatAnalyzer (start.bat).“) |

| 6 | `install_and_run.bat` starten | alle Ausgaben englisch, `install_log.txt` ebenso |
| 7 | `debug_system.bat`, `update.bat`, `run_cli.bat` ohne Datei | Ausgaben englisch |
