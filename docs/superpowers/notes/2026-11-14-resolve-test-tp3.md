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

## Antworten des Nutzers und nächste Runde (2026-11-14)

- Frage 1 (Subtitle Track bei mehrfachem Song): **a** – ein Subtitle Track je Audiospur mit dem Song, alle Vorkommen dieser Spur darauf.
- Frage 2 (nach dem Ende zurück in die zuletzt offene Timeline): ok.
- Punkt 20: ✓ – nach `install_and_run`/`start` kam die Meldung „Python von BeatAnalyzer nicht gefunden“.
- Punkt 17: Nutzer hat `%USERPROFILE%\.cache\torch\hub\checkpoints` umbenannt; der neue Download von
  `beat_this-final0.ckpt` scheiterte: „Could not load the checkpoint given the provided name, final0“. beat_this
  (`inference.load_checkpoint`) verschluckt die eigentliche Ursache (jede Ausnahme beim Download → ValueError).
  Seitdem nur librosa. Abhilfe für den Nutzer: alten Ordner zurückbenennen.
- **Wunsch:** Installation soll ein fehlendes Modell selbst reparieren. Vorschlag:
  - `install_and_run.bat` lädt das Modell einmal vorab (Check `load_checkpoint("final0")`), zeigt bei Fehlern die
    eigentliche Ursache (`__context__` der Ausnahme) und wohin die Datei von Hand gehört.
  - Analyzer/Server: Fehler beim Laden des Modells mit Ursache loggen; Startmeldung und Web-App/Resolve sagen
    „Modell nicht geladen: <Ursache>“.
- Bestätigt: Kurze Texte (Tooltip für Details), „Tasks“ statt „Was jetzt passiert“, Marker-Notiz mit Takt/Beat/
  Zeit/BPM/Confidence, Auftragsordner abgebrochener Läufe aufräumen, feste Fensterbreite, Konsolenrauschen weg.
