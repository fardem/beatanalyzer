# Test – Version 0.6.2

Ergebnis des Tests 0.6.1: F2, F3, F4, F8 und 22 bestanden; N5 entfällt (keine DAW). Deine Rückmeldungen zu F1, F5,
F6 und F7 und dein Wunsch zum Standard-Zeitfenster sind in 0.6.2 umgesetzt (unten G1–G5).

Vorher: neue Version holen, `start.bat`; in der Web-App *Exportieren → DaVinci Resolve → In Resolve aktualisieren*
und Resolve neu starten (neue Farbfelder). Analysieren mit **beat_this**.

## Neu in 0.6.2

| # | Was tun | Was soll passieren |
|---|---|---|
| G1 | Wellenform auf 15 s zoomen, Song abspielen; den **blauen Rahmen** in der Übersicht anfassen, woanders hinziehen und loslassen. Einmal ganz nach links über den Rand hinaus ziehen. Danach **doppelt** auf den Rahmen klicken – einmal während der Wiedergabe, einmal gestoppt | nach dem Loslassen spielt der Song an der Stelle weiter, an der die Maus war – kein Zurückspringen; ganz links = Songanfang. Doppelklick startet immer am linken Rand des Rahmens. Ein einfacher Klick auf den Rahmen ohne Ziehen ändert nichts |
| G2 | **Doppelklick** auf „15s“ (neben der Lupe), dann einen anderen Song laden; danach Seite neu laden und noch einen Song laden; zum Schluss nochmal Doppelklick auf „15s“ | „15s“ ist **fett und unterstrichen**; jeder neu geladene Song startet im 15-s-Fenster, auch nach dem Neuladen. Nach dem zweiten Doppelklick ist „15s“ wieder normal und neue Songs starten wieder wie bisher |
| G3 | Player: Song und Metronom ein- und ausschalten (Lautsprecher-Knöpfe) | beide sehen gleich aus: an = blauer Lautsprecher, stumm = grauer, durchgestrichener Lautsprecher, Regler grau auf 0. Statt der Wörter stehen nur die Symbole (Note, Metronom); Maus darüber zeigt den Namen. Beim Wiedereinschalten ist die alte Lautstärke wieder da |
| G4 | Beat-Evidenz → Gefalteter Takt: einen Schritt der Takt-Korrektur ausführen | oben erst **Rückgängig**, dann **Zurücksetzen** (Kreispfeil) – wie in der Beat-Tabelle |
| G5 | Resolve-Fenster: **Markerfarben anpassen** aufklappen | die Farbfelder haben dieselben Farben wie Resolves eigenes Marker-Menü; keine zwei Felder sehen gleich aus |
