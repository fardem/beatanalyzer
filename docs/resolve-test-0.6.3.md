# Test – Version 0.6.3

Ergebnis des Tests 0.6.2: G1, G3, G4 bestanden; G2 (Flackern beim Doppelklick) und G5 (Cue und Abschnittswechsel als
Marken aus der Web-App erkennbar) sind in 0.6.3 nachgebessert.

Vorher: neue Version holen, `start.bat`; in der Web-App *Exportieren → DaVinci Resolve → In Resolve aktualisieren*
und Resolve neu starten (geänderte Farbzeile). Analysieren mit **beat_this**.

## Neu in 0.6.3

| # | Was tun | Was soll passieren |
|---|---|---|
| H1 | Auf „15s“ doppelklicken, wenn gerade die ganze Datei zu sehen ist; danach einmal auf das schon aktive „15s“ klicken; dann auf „60s“ und auf den Knopf *ganze Datei* | Doppelklick: das 15-s-Fenster erscheint **ohne Flackern** und wird Standard (fett). Einfacher Klick auf das aktive „15s“: erst nach etwa einer halben Sekunde zurück zur ganzen Datei. „60s“ und *ganze Datei* wirken sofort |
| H2 | Resolve-Fenster: *Markerfarben anpassen* auf- und zuklappen | aufgeklappt: über **Cue-Marke** und **Abschnittswechsel** steht einmal „Aus der Web-App“ mit einer Linie über beiden; zugeklappt: ein feiner Strich vor den letzten zwei Farbfeldern (Maus darüber: „Aus der Web-App“) |
