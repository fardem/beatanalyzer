# Test in DaVinci Resolve – Analyse aus Resolve (Version 0.1.5)

Vorher: main holen, `start.bat`, in der Web-App **In Resolve aktualisieren**, Resolve neu starten.
Workspace → Scripts → BeatAnalyzer_Markers. Bei jedem Punkt bitte notieren: ✓ / ✗ und was zu sehen war.
Bei ✗ die Resolve-Konsole (Workspace → Console) mitschicken.

| # | Was tun | Was soll passieren |
|---|---|---|
| 1 | Fenster öffnen | Titel „BeatAnalyzer 0.1.5“; oben zwei Häkchen „Ausgewählten Clip analysieren“ / „JSON laden“, nur eins gesetzt |
| 2 | Zwischen den beiden Wegen wechseln | Beim Analysieren: Regler „Glätten“ sichtbar, JSON-Zeile weg; bei JSON umgekehrt |
| 3 | Regler bewegen | Wert daneben ändert sich (90 %, … 0 % = „aus“); Tooltip beim Überfahren erklärt 0 %, weiter rechts, 100 % |
| 4 | Weg „analysieren“, nichts / zwei Clips / eine Timeline im Media Pool ausgewählt | Hinweis in der Clip-Zeile, OK gesperrt |
| 5 | Einen Song im Media Pool auswählen, OK | **Kein schwarzes Konsolenfenster**; Fenster zeigt „Analyse von …“ mit Schritt und Zeit; „Abbrechen“ sichtbar |
| 6 | Warten bis fertig | Marker auf dem Clip im Media Pool, Subtitle im Ordner BeatAnalyzer, Zeile „Analysiert mit beat_this …“ |
| 7 | Wie 5, dann **Abbrechen** | Zurück zur Auswahl, „Analyse abgebrochen“, keine Marker, kein Subtitle |
| 8 | Wie 5, dann Fenster mit **X** schließen | Fenster zu, nichts im Projekt geändert |
| 9 | Song mit Umlaut im Namen / Pfad analysieren | läuft wie 5–6 |
| 10 | Song liegt in der offenen Timeline, Weg „JSON laden“ oder „analysieren“ | Erklärung nennt „Die Clips des Songs in dieser Timeline (n) bekommen die Marker ebenfalls“; **der Clip in der Timeline zeigt die Marker** ohne neu ziehen |
| 11 | Clip in der Timeline vorne kürzen (Anfang abschneiden), dann erneut laufen lassen | Marker im Timeline-Clip liegen auf denselben Schlägen wie im Media Pool (nicht um die gekürzte Länge verschoben). Konsole: Zeile „Timeline clip 1: left offset …“ mitschicken |
| 12 | Song zweimal in der Timeline (A1 und A2) | Beide Clips haben Marker |
| 13 | „BeatAnalyzer-Marker entfernen“ | Marker auf Media-Pool-Clip **und** Timeline-Clips weg; ein von Hand gesetzter Marker bleibt |
| 14 | Web-App: Song analysieren, Regler „Glätten“ bewegen | Regler startet bei 90 %; die Kachel Taktart springt nicht |
