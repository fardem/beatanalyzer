# Test – Version 0.2.13 (neues Design des Resolve-Fensters)

Vorher: main holen, `start.bat`, in der Web-App *Exportieren → DaVinci Resolve* → **In Resolve aktualisieren**,
Resolve neu starten. **Nicht** die Datei von Hand in den Scripts-Ordner kopieren – nur der Installer trägt den
BeatAnalyzer-Ordner und Python ein.

| # | Was tun | Was soll passieren |
|---|---|---|
| 1 | Workspace → Scripts → BeatAnalyzer_Markers | Titel „BeatAnalyzer 0.2.13“, Aufbau wie im Gemini-Entwurf; Texte in deiner Sprache (auch „1. Quelle & Analyse-Modell“, „Analysieren“) |
| 2 | Einen WAV-Clip im Media Pool auswählen, Reiter *Ausgewählten Clip analysieren*, beat_this, **Analysieren** | kein „Python … not found“; Tasks laufen, nur *Abbrechen* sichtbar; danach Marker + Subtitle Track, Knopf *OK* |
| 3 | Wie 2, während der Analyse **Abbrechen** | „abgebrochen“, Projekt unverändert, *Analysieren* wieder aktiv |
| 4 | Kachel md_beat_this | gelber Lizenzkasten mit Adresse, Häkchen; ohne Häkchen bleibt *Analysieren* grau, Clip-Zeile rot mit Hinweis; „Glätten“ ausgeblendet |
| 5 | Mit Häkchen analysieren (falls md_beat_this installiert) | läuft; sonst „md_beat_this not installed“ – librosa |
| 6 | MP3-Clip auswählen | blauer Kasten „MP3: … about 50 ms later …“; nach der Analyse „markers moved by 51 ms“ |
| 7 | Reiter *JSON laden* → Auswählen … → OK-Knopf heißt **Marker setzen** | wie bisher (in 0.2.12-Entwurf schon getestet) |
| 8 | „Markerfarben anpassen“ an/aus, eine Farbe ändern | Farbfelder und Punkte zeigen die gewählte Farbe; Marker in dieser Farbe |
| 9 | Nach dem Ergebnis **BeatAnalyzer-Marker entfernen** → Entfernen | Marker und Subtitle Track weg; *Abbrechen* in der Frage führt zum Ergebnis zurück |
| 10 | Fenster schließen, neu öffnen | gleicher Reiter, gleiches Modell, Häkchen md_beat_this wieder leer, Farben gemerkt |
| 11 | Sprache in der Web-App auf Türkisch, *In Resolve aktualisieren*, Fenster öffnen | türkische Texte, auch Abschnitte und Knöpfe |
