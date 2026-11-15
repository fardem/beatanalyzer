# Test – Version 0.2.8 (Web-App: Loop, Lautstärke, Kachel Taktart)

Vorher: main holen, `start.bat`.

| # | Was tun | Was soll passieren |
|---|---|---|
| 1 | Song analysieren, `5s`, Loop-Knopf einmal klicken, abspielen | Knopf zeigt „Ausschnitt“; die 5 s laufen ohne Lücke immer wieder, Metronom klickt weiter richtig |
| 2 | Loop-Knopf noch einmal | „Ganzer Song“; am Songende geht es ohne Pause von vorn weiter |
| 3 | Loop-Knopf noch einmal | Loop aus, Knopf wieder grau |
| 4 | Ganze Datei (1.0x), Loop klicken | gleich „Ganzer Song“ (der Ausschnitt wäre der ganze Song) |
| 5 | Loop „Ausschnitt“ an, dann herauszoomen | außerhalb abgedunkelt, gelbe Grenzen; in der Übersicht markiert |
| 6 | Bei Loop „Ausschnitt“ in der Wellenform weit außerhalb klicken | Wiedergabe springt dorthin, Loop geht aus |
| 7 | Regler „Song“ leiser, Metronom lauter | Song leiser, Klick bleibt; nach Pause/Play bleibt die Einstellung |
| 8 | Sprache Türkçe, Kachel „Ölçü“ (Fenster ≥ 1280 px) | „4/4'lük“ und „%97 ölçü“ in einer Zeile, Unterkanten auf gleicher Höhe |

## Ergebnis 0.2.7 (Nutzer)

- Kachel Taktart türkisch: Kasten zweizeilig und zu hoch → behoben in 0.2.8.
