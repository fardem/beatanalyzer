# Test – Version 0.6.4

Ergebnis des Tests 0.6.3: H1 und H2 bestanden. Deine Befunde B1–B3 sind in 0.6.4 umgesetzt (unten I1–I3).

Vorher: neue Version holen, `start.bat`; in der Web-App *Exportieren → DaVinci Resolve → In Resolve aktualisieren*
und Resolve neu starten (Abstand im Farbbereich). Analysieren mit **beat_this**.

## Neu in 0.6.4

| # | Was tun | Was soll passieren |
|---|---|---|
| I1 | Wellenform auf 15 s zoomen, Song abspielen; den **blauen Rahmen** anfassen und langsam hin und her ziehen, dann loslassen. Zum Vergleich einmal ins freie Feld der Übersicht klicken und ziehen. Danach Schleife „Abschnitt“ (gelb A-B) einschalten und den Rahmen nochmal ziehen | beim Ziehen des Rahmens läuft der Playhead mit der Maus mit und man hört, wo man ist (Scrubbing) – genau wie beim Ziehen im freien Feld; nach dem Loslassen spielt der Song dort weiter. Ein Klick auf den Rahmen ohne Ziehen ändert nichts. Mit Schleife „Abschnitt“: kein Scrubbing, die Schleife beginnt am linken Rand |
| I2 | Beat-Tabelle: einen Beat ±10 ms verschieben, dann Rückgängig und Zurücksetzen | „1 Schritt(e) aktiv“, **Rückgängig** und Zurücksetzen (Kreispfeil) stehen in der Kopfzeile der Tabelle links neben „AKTION“; die Leiste darüber hat nur noch Mitlaufen, Filter und Suche |
| I3 | Resolve-Fenster: *Markerfarben anpassen* aufklappen | über „Aus der Web-App“ ist etwa eine halbe Zeile Luft; die Überschrift klebt nicht mehr an der Reihe Downbeat … übrige |
