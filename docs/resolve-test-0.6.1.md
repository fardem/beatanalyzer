# Test – Version 0.6.1

Ergebnis des Tests 0.4.0 bis 0.6.0: alles bestanden. Deine Wünsche und die zwei gefundenen Fehler sind in 0.6.1
umgesetzt (unten F1–F8). Noch offen aus der alten Liste: **N5** (MIDI in einer DAW) und **22** (House/Techno) – beide
optional, wenn du die Möglichkeit hast.

Vorher: neue Version holen, `start.bat`; in der Web-App *Exportieren → DaVinci Resolve → In Resolve aktualisieren*
(das Resolve-Fenster hat neue Farbfelder). Analysieren mit **beat_this**.

## Neu in 0.6.1

| # | Was tun | Was soll passieren |
|---|---|---|
| F1 | Einen Song mehrmals abspielen, pausieren, springen, dann den Regler **Song** bewegen; danach auf die **Note** davor klicken | die Lautstärke ändert sich jedes Mal hörbar; Klick auf die Note: Song stumm (Note durchgestrichen, Regler grau), nur das Metronom ist zu hören; nochmal: Song wieder da |
| F2 | „Teoman – Ağır Kapı“ analysieren: Kachel **Tempo**, Bereich **Tempo** (Titelzeile, gestrichelte Linie „Haupttempo“, Histogramm „Haupt-Peak“) | überall derselbe Wert (± 1 BPM), etwa 115 BPM – nicht mehr 131 / 152 / 115 |
| F3 | Die **?**-Hilfen von Spuren, gefaltetem Takt, Tempo-Verlauf, Histogramm, Songstruktur, Live und Cue-Marken öffnen | jeder Punkt hat die Farbe dessen, was er in der Grafik erklärt (z. B. Spuren: rot = Low, cyan = Mid, lila = High; Songstruktur: grün ▲, blau ▼, lila ◆, gelb = Abspielposition/Cues) |
| F4 | Beat-Evidenz: Knopf **2×** neben „Spuren ausblenden“ | Spuren doppelt so hoch, der Knopf zeigt dann **1×**; nach Neuladen bleibt die Höhe |
| F5 | Wellenform auf 15 s zoomen, blauen Rahmen in der Übersicht verschieben, dann **doppelt** auf den Rahmen klicken | die Wiedergabe startet am Anfang des Ausschnitts; Leertaste spielt wie bisher ab dem gelben Playhead |
| F6 | Beat-Tabelle: einen Beat löschen oder ±10 ms verschieben | oben in der Tabelle „1 Schritt(e) aktiv“, **Rückgängig** und Zurücksetzen (Kreispfeil) – wirken wie in der Takt-Korrektur |
| F7 | Resolve-Fenster: **Markerfarben anpassen** aufklappen | neue Zeile **Cue (Web-App)** (gelb) und **Abschnittswechsel** (lila); eine andere Farbe wählen, JSON mit Cues laden → Marker in der gewählten Farbe; „kein Marker“ → die Marker bekommen die Farbe ihres Beats; das Fenster schneidet nichts ab |
| F8 | Exportieren → DaVinci Resolve, die JSON in einem Texteditor öffnen; dann in Resolve laden, ebenso einmal *Ausgewählten Clip analysieren* | oben in der JSON `"generator": {"name": "BeatAnalyzer", "version": "0.6.1"}`; in Resolve beginnt die Notiz des **ersten** Markers mit „BeatAnalyzer 0.6.1 \|“, und der Info-Untertitel beginnt mit „BeatAnalyzer 0.6.1“ – bei beiden Wegen |

## Noch offen (optional)

| # | Was tun | Was soll passieren |
|---|---|---|
| N5 | Exportieren → MIDI, in einer DAW auf Spur 1 legen, den Song bei 0 dazu | jeder Klick sitzt auf dem Beat, auch am Ende; die erste „1“ liegt auf einem Taktstrich |
| 22 | Ein Song mit Kick auf jedem Beat (House/Techno) | „Kein klares Kick-Muster – kein Vorschlag, nach Gehör prüfen“ |
