# Test – Version 0.3.1

Alle Punkte aus 0.3.0 sind bestanden, außer Punkt 7 (keine ungepatchte FLAC mehr da) – er bleibt hier offen.

Vorher: main holen, `start.bat`, in der Web-App *Exportieren → DaVinci Resolve* → **In Resolve aktualisieren**,
Resolve neu starten.

| # | Was tun | Was soll passieren |
|---|---|---|
| 1 | `start.bat` starten | der Browser öffnet sich erst, wenn der Server läuft (Konsole zeigt „Server running“), und zeigt sofort die Web-App – kein leeres Fenster |
| 2 | Resolve-Fenster: Clip analysieren, Fortschritt ansehen (DE, EN, TR) | „Track wird analysiert (Beats erkennen)“ / „Analysing the track (detecting beats)“ / „Parça analiz ediliyor (beat'ler algılanıyor)“ |
| 3 | Türkisch: Resolve-Fenster und Web-App (Export) durchsehen | überall „marker“, nirgends „işaretçi“ |
| 4 | Offen aus 0.3.0: eine FLAC mit ID3-Tag vorne in der Web-App analysieren (falls wieder eine auftaucht) | Meldung „Datei beginnt mit einem ID3-Tag …“ mit dem ffmpeg-Befehl |
