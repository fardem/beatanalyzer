# Test – Version 0.2.9 (Web-App: Loop mit blauem Rahmen, Player)

Vorher: main holen, `start.bat`.

| # | Was tun | Was soll passieren |
|---|---|---|
| 1 | Song abspielen (Fenster wie gewohnt) | Player bleibt einzeilig, springt bei Downbeats nicht mehr; Anzeige oben „Takt 35“, darunter „Downbeat (Beat 1)“ bzw. „Beat 2“ |
| 2 | Loop-Knopf mehrmals klicken | Symbol grau (aus) → gelb mit „A-B“ (Ausschnitt) → grün (ganzer Song) → grau; Tooltip nennt jeweils den Zustand und was der nächste Klick tut; die Zeile bewegt sich nicht |
| 3 | `15s`, Loop „Ausschnitt“, abspielen, dann den blauen Rahmen in der Übersicht nach rechts ziehen | Wiedergabe springt an die linke Kante des Rahmens und wiederholt bis zur rechten Kante |
| 4 | Während Loop „Ausschnitt“ läuft | Ansicht bleibt stehen (kein Mitscrollen) |
| 5 | Mit `+`/`–` zoomen bei Loop „Ausschnitt“ | Loop passt sich dem neuen sichtbaren Bereich an |
| 6 | Geschwindigkeit über das Auswahlfeld | 0.5x … 1.5x wie bisher |
| 7 | Fenster schmal (≈ 1100 px) | Player zweizeilig, aber fest (springt nicht) |

## Ergebnis 0.2.8 (Nutzer)

- Player sprang bei jedem Downbeat → behoben.
- Wunsch: Loop über den verschobenen blauen Rahmen → umgesetzt.
