# Test – Version 0.2.14 (neues Resolve-Fenster: Design aus 0.2.13, Farben der Web-App)

Enthält alle Punkte aus dem Test von 0.2.13; die Liste von 0.2.13 entfällt.

Vorher: main holen, `start.bat`, in der Web-App *Exportieren → DaVinci Resolve* → **In Resolve aktualisieren**,
Resolve neu starten. **Nicht** die Datei von Hand in den Scripts-Ordner kopieren – nur der Installer trägt den
BeatAnalyzer-Ordner und Python ein.

## Aufbau und Farben

| # | Was tun | Was soll passieren |
|---|---|---|
| 1 | Workspace → Scripts → BeatAnalyzer_Markers | Titel „BeatAnalyzer 0.2.14“; Fläche schiefergrau-blau; Texte in deiner Sprache (auch „1. Quelle & Analyse-Modell“, „Analysieren“) |
| 2 | Fenster ansehen | Reiter *Ausgewählten Clip analysieren* cyan umrandet; Kachel beat_this cyan; Knopf *Analysieren* cyan mit dunkler Schrift |
| 3 | Gesamteindruck neben der Web-App | passt zusammen? Was stört? |

## Clip analysieren

| # | Was tun | Was soll passieren |
|---|---|---|
| 4 | Einen WAV-Clip im Media Pool auswählen, beat_this, **Analysieren** | kein „Python … not found“; Tasks laufen, nur *Abbrechen* sichtbar; danach Marker + Subtitle Track, Ergebnis in grünem Kasten, Knopf *OK* |
| 5 | Wie 4, während der Analyse **Abbrechen** | „abgebrochen“, Projekt unverändert, *Analysieren* wieder aktiv |
| 6 | Kachel md_beat_this | Kachel und Lizenzkasten bernsteinfarben, Adresse im Kasten, Häkchen; ohne Häkchen bleibt *Analysieren* grau, Clip-Zeile rot mit Hinweis; „Glätten“ ausgeblendet |
| 7 | Mit Häkchen analysieren (falls md_beat_this installiert) | läuft; sonst „md_beat_this not installed“ – librosa |
| 8 | MP3-Clip auswählen | MP3-Hinweis in cyanfarbenem Kasten („about 50 ms later“); nach der Analyse „markers moved by 51 ms“ |
| 9 | Analyse mit Fehler (z. B. kaputte Datei) | Meldung in rotem Kasten; *Analysieren* bleibt für diese Datei mit diesem Modell gesperrt |

## JSON laden

| # | Was tun | Was soll passieren |
|---|---|---|
| 10 | Reiter *JSON laden* → *Auswählen …* | Haupt-Knopf heißt **Marker setzen**; Marker und Subtitles wie bisher, Ergebnis in grünem Kasten |

## Farben, Entfernen, Einstellungen, Sprache

| # | Was tun | Was soll passieren |
|---|---|---|
| 11 | „Markerfarben anpassen“ an/aus, eine Farbe ändern | Farbfelder und Punkte zeigen die gewählte Farbe; Marker in dieser Farbe |
| 12 | Nach dem Ergebnis **BeatAnalyzer-Marker entfernen** → *Entfernen* | Rückfrage in bernsteinfarbenem Kasten, Knopf *Entfernen* rot; danach Marker und Subtitle Track weg; *Abbrechen* in der Frage führt zum Ergebnis zurück |
| 13 | Fenster schließen, neu öffnen | gleicher Reiter, gleiches Modell, Häkchen md_beat_this wieder leer, Farben gemerkt |
| 14 | Sprache in der Web-App auf Türkisch, *In Resolve aktualisieren*, Fenster öffnen | türkische Texte, auch Abschnitte und Knöpfe |
