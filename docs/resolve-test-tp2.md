# Test in DaVinci Resolve – Resolve-Dialog (Version 0.1.0)

Für DaVinci Resolve Studio 21.2. Vorher in BeatAnalyzer *Exportieren → DaVinci Resolve → In Resolve aktualisieren* und Resolve neu starten. Bei jeder Abweichung bitte die Zeilen mit `[BeatAnalyzer]` aus *Workspace → Console* schicken.

| Nr. | Was tun | Was erwartet | ok? |
|---|---|---|---|
| 1 | *Workspace → Scripts → BeatAnalyzer_Markers* ohne Auswahl starten | Fenster öffnet sich, „Keine JSON gewählt.“, OK gesperrt | |
| 2 | *Auswählen …*, Marker-JSON eines Songs wählen, der im Media Pool liegt | Clip mit Laufzeit, „Analysiert mit …“, Erklärung passend zur offenen Timeline, OK aktiv | |
| 3 | OK bei einem langen Song (viele Marker) | Fenster bleibt bedienbar, der Zähler „x / y“ läuft sichtbar hoch, danach die Zusammenfassung. Friert das Fenster ein, bitte melden | |
| 4 | Während der Arbeit auf das X klicken | Fenster bleibt offen, die Arbeit läuft zu Ende | |
| 5 | Song mit Umlauten im Dateinamen | Marker gesetzt, Subtitle im Ordner BeatAnalyzer, keine SRT neben der JSON, `resolve_temp` im BeatAnalyzer-Ordner enthält keinen Arbeitsordner mehr | |
| 6 | Song gekürzt und verschoben in einer Timeline, Häkchen gesetzt | Subtitle Track „BeatAnalyzer - <Song>“ genau unter dem Song; `<Song> (Timeline).srt` ist nicht im Media Pool | |
| 7 | Zweiter Lauf mit derselben JSON | Marker und Subtitle Track werden ersetzt, nicht verdoppelt | |
| 8 | Markerfarben anpassen: Beat 2 auf „kein Marker“, Song im 3/4-Takt | Downbeats und Beat 3 haben Marker, Beat 2 nicht; Subtitles enthalten alle Beats | |
| 9 | *BeatAnalyzer-Marker entfernen* | Nachfrage mit Anzahl; nach *Entfernen* sind eigene Marker, Subtitle Track und Subtitle weg, Marker von Hand bleiben | |
| 10 | Resolve neu starten, Skript öffnen | Häkchen, Farben, Fenstergröße und Ordner der letzten JSON sind gemerkt | |
| 11 | BeatAnalyzer in einem Ordner mit Umlauten (oder Song mit Umlauten), zwei Läufe hintereinander | Nach jedem Lauf ist `resolve_temp` ohne Arbeitsordner und ohne SRT-Dateien | |
