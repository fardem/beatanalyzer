# Test in Resolve – Teilprojekt 3 (0.1.5), Ergebnis des Nutzers vom 2026-11-14

Nutzer-Rechner: BeatAnalyzer unter `C:\İünaöl\beatanalyzer` (Umlaut, türkisches İ), Resolve Studio.

| # | Ergebnis | Notiz |
|---|---|---|
| 1 | ✓ | |
| 2 | ✓ | |
| 3 | ✓ | Tooltip des Reglers zu lang → kürzer, kompakt, verständlich |
| 4 | ✓ | Hinweis da, OK bei Mehrfachauswahl gesperrt. Erklärungstext unter „Subtitle Track“ viel zu lang |
| 5 | ✓ | kein Konsolenfenster |
| 6 | ✓ | Fortschrittstext zu lang; Überschrift „Tasks“ statt „Was jetzt passiert“; kurze Zeilen („Track wird analysiert“, „Marker werden gesetzt“ …) ohne den langen Songnamen in jeder Zeile (steht oben schon); mehr Text darf in den Tooltip |
| 7 | ✓ | |
| 8 | ✓ | |
| 9 | ✓ | Umlaut in Name und Pfad |
| 10 | ✓ | Timeline-Clip zeigt die Marker |
| 11 | ✓ | getrimmter Clip: left offset 500 → 325 statt 349 Marker, Lage stimmt |
| 12 | ✓/offen | Beide Clips (A1, A2) bekommen Marker. Subtitle Track nur für den zeitlich ersten Clip (lag auf A2). Frage: ein Subtitle Track je Audiospur? Was, wenn der Song in derselben Spur mehrfach liegt? |
| 13 | ✓ | |
| 14 | ✓ | |
| 15 | ✗ | Auftragsordner abgebrochener Läufe bleiben liegen (Erwartung: werden aufgeräumt) |
| 16 | ✓ | `C:\İünaöl\beatanalyzer` |
| 17 | offen | Wie testen? Modell-Cache zurücksetzen |
| 18 | ✓ | keine doppelten Marker |
| 19 | ✓/Hinweis | Marker in der Timeline vom OK; nach dem Ende springt Resolve zurück in diese Timeline |
| 20 | ? | Analyse lief trotz umbenanntem `venv` – unklar, welcher Ordner umbenannt wurde |
| 21 | Wunsch | Marker-Notiz mit mehr Infos: Downbeat/Beat in Takt, Zeit, BPM (statt nur „106,860 s, 120,0 BPM“) |
| 22 | ✗ | Breite des Resolve-Fensters schwankt (Konsole: „requested 600x680, actual 431x680“) |

Konsole außerdem: „Selection: ignored entries that are not clips: __flags=number“ jede Sekunde (Rauschen).
