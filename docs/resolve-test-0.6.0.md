# Test – Versionen 0.4.0 bis 0.6.0

Eine Liste für diese Versionen (0.4.0 bis 0.5.1 wurden noch nicht getestet; 0.6.0 setzt die berechtigten Punkte der
Gemini-Kritik um – die neuen Punkte stehen am Anfang). 0.3.2: Punkte 1–3 bestanden; die Neuinstallation mit `torch_setup.py` wurde nicht
durchgeführt (siehe docs/tested-environment.md).

Fast alle Punkte betreffen die **Web-App**. Das Resolve-Fenster ist unverändert; Resolve brauchen nur N4 und Punkt 25. Vorher: neue Version holen, `start.bat` (der Updater installiert auch das neue Resolve-Skript).
Analysieren mit **beat_this** (wie du es sonst auch machst). Die Begriffe unten sind die der deutschen Oberfläche.

## Neu in 0.6.0

| # | Was tun | Was soll passieren |
|---|---|---|
| N1 | Metronom an, mit **Kopfhörern** abspielen, auch bei 0,75× und im Loop | Klick und Kick kommen gleichzeitig, kein „Flam“ (doppelter Anschlag) und kein Schwanken; nach Pause kein Nachklicken |
| N2 | Kachel **Beat-Abstand** | unter der Zahl „Raster ± x ms“ (statt „gerade Achtel“); Tooltip erklärt den Wert |
| N3 | Beat-Tabelle: **+** in einer Zeile, dann **Papierkorb**; Wellenform auf 15 s zoomen: **Umschalt+Klick** und **Alt+Klick** auf eine Beat-Linie | Beat wird eingefügt / gelöscht, Taktzahlen passen sich an; Hinweis „Umschalt+Klick …“ unter der Wellenform nur bei ≤ 30 s; **Rückgängig** nimmt es zurück; Glätten verschieben → die Änderung bleibt |
| N4 | Ein Song mit **Umlaut oder Leerzeichen** im Namen (z. B. „Küçük Sevgilim.mp3“): in der Web-App analysieren, Exportieren → DaVinci Resolve, JSON im Resolve-Fenster laden | das Fenster findet den Clip (Name unverändert) |
| N5 | Exportieren → MIDI, in deiner DAW auf Spur 1 legen, den Song bei 0 dazu | jeder Klick sitzt auf dem Beat des Songs, auch am Ende; die erste „1“ liegt auf einem Taktstrich. *Hinweis:* ist der erste Beat sehr früh (< 0,2 s), ist das Vorlauf-Tempo sehr hoch – manche DAWs begrenzen das Tempo und verschieben dann den Anfang |
| N6 | Songstruktur bei einem Song, dessen Refrain **etwa gleich laut** ist wie die Strophe | der Wechsel wird trotzdem gefunden (◆ oder ▲); Teile, die wiederkommen, haben **denselben Buchstaben** (z. B. B … B) |
| N7 | Exportieren → DaVinci Resolve, JSON laden | Abschnittswechsel als lila Marker **mit Buchstaben**: „Abschnitt B ▲ +5 dB – Takt 33“ |
| N8 | *(nur Hinweis)* Eine fremde Webseite kann den BeatAnalyzer-Server nicht mehr steuern | – nicht selbst testbar |

## Ansicht (0.5.0)

| # | Was tun | Was soll passieren |
|---|---|---|
| 1 | Einen Song analysieren | Reihenfolge: Wellenform, Player, **Songstruktur & Live**, Beat-Evidenz, Tempo, Beat-Tabelle; die sechs Zahlenkacheln bleiben oben |
| 2 | Auf den Titel eines Bereichs klicken, dann noch einmal | der Bereich klappt auf seine Titelzeile zu und wieder auf |
| 3 | Einen Bereich am Griff (⋮⋮ links vom Titel) über oder unter einen anderen ziehen | eine cyanfarbene Linie zeigt, wo er landet; der Bereich wandert dorthin |
| 4 | Auf den Griff klicken, dann ↑ / ↓ drücken | der Bereich rutscht eine Stelle nach oben / unten |
| 5 | Seite neu laden und wieder analysieren | Reihenfolge und Klappzustand bleiben; *Ansicht zurücksetzen* (unter dem letzten Bereich) stellt den Standard wieder her |

## Songstruktur & Live (0.5.0, 0.5.1)

| # | Was tun | Was soll passieren |
|---|---|---|
| 6 | Ein Song mit klaren Teilen (Intro, Refrain, Break) | die Balken im Streifen steigen und fallen mit dem Song; Abschnittswechsel als Linien mit Buchstabe, ▲ / ▼ / ◆ und Taktnummer, darunter Knöpfe („B ▲ Takt 33 · 0:57 lauter +5 dB“) |
| 7 | Passen die Abschnittswechsel zu dem, was du hörst? Einen Knopf oder in den Streifen klicken | Wiedergabe springt auf die „1“ dieses Takts; der Wechsel ist dort zu hören (oder innerhalb eines Takts) – bitte Songs notieren, bei denen es deutlich daneben liegt |
| 8 | Abspielen | große Taktnummer, die Beats leuchten der Reihe nach (die „1“ in Rot), „Nächster Abschnitt: Takt …, in … Takten“; **kein** Countdown zur nächsten „1“ mehr; Spektrum bewegt sich, Blitz auf jedem Beat |
| 8a | Knopf **Taktzähler** neben „Live (beim Abspielen)“, beim Abspielen und in der Pause | der Zähler verschwindet, das Spektrum nimmt die volle Breite (nicht verzerrt); nochmal: wieder da; bleibt nach Neuladen |
| 8b | Ein Song mit vielen Abschnitten oder ein schmales Fenster: Maus auf den Abschnitts-Knöpfen gedrückt halten und nach links / rechts wischen | kein Scrollbalken; die Reihe folgt der Maus, die Ränder blenden aus, wo noch Knöpfe sind; Loslassen nach dem Wischen springt **nicht**; normaler Klick springt; beim Abspielen läuft die Reihe zum spielenden Abschnitt mit |
| 9 | Beim Abspielen zweimal an verschiedenen Stellen **M** drücken, dann **Umschalt+M** (oder *Cue setzen* rechts neben dem Titel „Songstruktur“ klicken) | gelbe Fähnchen im Streifen; gelbe Knöpfe „Cue 1 · 12.3 · 0:23.4“ in der Reihe **zwischen den Abschnitten**, nach Zeit; Umschalt+M landet auf einer „1“ (x.1); Klick springt hin, × entfernt, der Mülleimer neben *Cue setzen* entfernt alle |
| 10 | Eine Cue-Marke setzen, dann **+1 Beat** in der Takt-Korrektur | die Cue-Marke bleibt auf einem Beat des neuen Rasters |

## Beat-Evidenz (0.4.0, Ansicht 0.5.0)

| # | Was tun | Was soll passieren |
|---|---|---|
| 11 | Einen gleichmäßigen 4/4-Song analysieren | Spuren Low/Mid/High; **gefalteter Takt füllt die volle Höhe** neben der Takt-Korrektur; Urteil meist grün (Kick auf Beat 1) |
| 12 | Wellenform zoomen (z. B. 15 s), blauen Rahmen verschieben | die Spuren folgen; „Ausschnitt / Gesamter Track“ am gefalteten Takt schaltet die Mittelung um |
| 13 | Den Griff unter den Spuren nach unten ziehen; doppelklicken | bis zur doppelten Höhe; Doppelklick: normal; bleibt nach Neuladen |

## Takt-Korrektur (0.4.0)

| # | Was tun | Was soll passieren |
|---|---|---|
| 14 | **+1 Beat**, dann **Rückgängig** | die „1“ rückt überall einen Beat später (Wellenform, Tabelle, Metronom, Kacheln); Rückgängig holt sie zurück; „n Schritt(e) aktiv“ zählt mit |
| 15 | **Tempo ½×**, **Tempo 2×**, dann **Zurücksetzen** (Kreispfeil) | Beats halbieren / verdoppeln sich, die Tempo-Kachel folgt; Zurücksetzen kehrt zur Analyse zurück |
| 16 | Beats pro Takt **3**, dann **4** | Kachel Taktart 3/4 → 4/4; Takte ab der ersten „1“ neu gezählt |
| 17 | 1–2 Korrekturen machen, dann den Regler **Glätten** bewegen | nach dem Neuberechnen sind die Korrekturen noch da („n Schritt(e) aktiv“ unverändert) |
| 18 | Beat-Tabelle: einen Beat um ±10 ms verschieben, dann Rückgängig in der Takt-Korrektur | Rückgängig nimmt auch die Tabellen-Änderung zurück |

## Vorschlag und Ausschnitt (0.4.1)

| # | Was tun | Was soll passieren |
|---|---|---|
| 19 | Ein Song, den beat_this richtig erkennt | „Raster passt – kein Vorschlag“ (grün) – kein Fehlalarm |
| 20 | Gleicher Song, **+1 Beat** (absichtlich kaputt machen) | Vorschlag „−1 Beat“ mit gestrichelter Linie im gefalteten Takt; *Anwenden* stellt das Raster wieder her |
| 21 | Dasselbe mit **3** Beats pro Takt (bei einem 4/4-Song) | Vorschlag „4 Beats pro Takt“ (evtl. mit einem Takt-Start-Schritt); die gestrichelte Vorschau hat eigene Marken 1–4 |
| 22 | Ein Song mit Kick auf jedem Beat (House/Techno) | „Kein klares Kick-Muster – kein Vorschlag, nach Gehör prüfen“ |
| 23 | Ein Song, den beat_this nur stellenweise doppelt gezählt hat (z. B. „Teoman – Ağır Kapı“): dorthin zoomen, **Gilt für: Ausschnitt**, **Tempo ½×** | nur die Beats im blauen Rahmen ändern sich; die Tempo-Kurve wird dort flach; mit aktivem Ausschnitt bezieht sich auch der Vorschlag auf den Ausschnitt |

## Tempo (0.5.0)

| # | Was tun | Was soll passieren |
|---|---|---|
| 24 | Den Bereich **Tempo** aufklappen | Tempo-Verlauf (links) und Tempo-Histogramm (rechts) nebeneinander, kompakt; Spanne und Ø auch zugeklappt in der Titelzeile; Klick in die Kurve springt dorthin |

## Export nach Resolve (0.4.0 und 0.5.0)

| # | Was tun | Was soll passieren |
|---|---|---|
| 25 | Nach Korrekturen und 2 Cue-Marken: Exportieren → DaVinci Resolve (Hinweis „Enthalten: 2 Cue-Marke(n) … Abschnittswechsel“), die JSON im Resolve-Fenster laden | Marker folgen dem korrigierten Raster; Cues sind **gelb** („Cue 1 – 12.3“), Abschnittswechsel **lila** („Abschnitt B ▲ +5 dB – Takt 5“) |
| 26 | *(optional)* Exportieren → Audacity, die Labels importieren | zusätzliche Labels „Cue 1“, „Section B ▲ +5 dB“ (Audacity-Labels sind englisch) |

## Sprachen und Hilfe (alle Versionen)

| # | Was tun | Was soll passieren |
|---|---|---|
| 27 | Englisch und Türkisch | alle neuen Texte übersetzt; Türkisch sagt „beat“, „cue“, „marker“ (nicht „vuruş“, „işaretçi“); Takt-Korrektur heißt „Ölçü Ayarı“ |
| 28 | Die **?**-Hilfen lesen: Wellenform, Songstruktur, Live, Cue-Marken, gefalteter Takt, Spuren, Tempo-Verlauf, Histogramm | verständlich fürs Schneiden: Was heißt das für meinen Schnitt, was soll ich tun? Unklares oder Fehlendes notieren |
