# Test – Version 0.3.0 (Korrekturen aus dem Test 0.2.14)

Alle anderen Punkte aus 0.2.14 sind bestanden; diese Liste enthält nur, was sich geändert hat.

Vorher: main holen, `start.bat`, in der Web-App *Exportieren → DaVinci Resolve* → **In Resolve aktualisieren**,
Resolve neu starten.

| # | Was tun | Was soll passieren |
|---|---|---|
| 1 | Fenster öffnen, Clip analysieren oder JSON laden | Titel „BeatAnalyzer 0.3.0“; Reiter-Texte vollständig, auch im gesperrten Zustand während der Arbeit |
| 2 | Nach dem Ergebnis **BeatAnalyzer-Marker entfernen** → *Entfernen* | sofort „BeatAnalyzer-Marker werden entfernt …“, alle Knöpfe grau und nicht klickbar; danach grüner Kasten „Entfernt: …“, Knöpfe wieder aktiv |
| 3 | Wie 2, während „werden entfernt …“ mehrmals auf die grauen Knöpfe klicken | nichts passiert, kein zweites Entfernen, keine Meldung „nichts zu entfernen“ |
| 4 | „01. Mensch.mp3“ **neu** in der Web-App analysieren, Marker-JSON exportieren, im Fenster *JSON laden* | kein gelber Warnkasten; blauer Hinweis „MP3: kein Ausgleich nötig …“; Marker an der richtigen Stelle |
| 5 | Ein MP3 mit Versatz (z. B. „Küçük Sevgilim“) wie 4 | blauer Hinweis „MP3: Die Marker werden 51 ms später gesetzt …“ wie bisher |
| 6 | Alte JSON von „01. Mensch.mp3“ (aus 0.2.14) laden | gelbe Warnung wie bisher (die JSON enthält das Feld noch nicht) |
| 7 | In der Web-App eine **nicht reparierte** FLAC mit ID3-Tag analysieren (Kopie des Albums) | Meldung: Datei beginnt mit einem ID3-Tag … mit dem ffmpeg-Befehl zum Entfernen |
| 8 | Sprache Englisch und Türkisch: Punkte 2, 4 und 7 | Texte in der Sprache |
