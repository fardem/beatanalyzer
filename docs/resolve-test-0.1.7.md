# Test in DaVinci Resolve – Version 0.1.7

Vorher: main holen, `start.bat`, in der Web-App **In Resolve aktualisieren**, Resolve neu starten.

| # | Was tun | Was soll passieren |
|---|---|---|
| 1 | Fenster mehrmals öffnen, mit verschieden langen Songnamen | **Breite bleibt gleich** (mindestens etwa 600 px); Konsole „Window: requested …, actual …“ mitschicken |
| 2 | Clip analysieren | Zeile „Analysiert mit beat_this (CUDA, …)“ überlappt nichts |
| 3 | Subtitle im Media Pool öffnen / in die Timeline ziehen | erster Subtitle (oder unter dem ersten Beat): BeatAnalyzer, Datei, Tempo/Taktart, „Model: beat_this – Lizenz: MIT – Nutzung: frei, auch kommerziell“ |
| 4 | Song in der Timeline vorne gekürzt und einmal ungekürzt | gekürzt: Infoblock unter dem ersten sichtbaren Beat; ungekürzt mit Platz vor dem ersten Beat: eigener Info-Subtitle |
| 5 | Alte JSON (von vor 0.1.7) laden | Infoblock ohne Modellzeile |
