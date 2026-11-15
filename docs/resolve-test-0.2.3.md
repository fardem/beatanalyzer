# Test in DaVinci Resolve – Version 0.2.3

Nachtest zu 0.2.2. Vorher: main holen, **`install_and_run.bat`** (installiert PyAV), in der Web-App **In Resolve
aktualisieren**, Resolve neu starten.

| # | Was tun | Was soll passieren |
|---|---|---|
| 1 | m4a-Clip im Media Pool, „Ausgewählten Clip analysieren“, OK | Analyse läuft, Marker und Subtitles kommen |
| 2 | Clip, der sich nicht analysieren lässt (z. B. Videodatei ohne Ton oder kaputte Datei), OK | Fehlermeldung; **OK bleibt grau**, nur Schließen |
| 3 | Wie 2, dann anderen Clip im Media Pool wählen | OK wieder aktiv |
| 4 | Analyse starten und **Abbrechen** | OK bleibt aktiv |

## Web-App

| # | Was tun | Was soll passieren |
|---|---|---|
| 5 | m4a-Datei analysieren | Analyse über den Server (nicht „Browser-Analyse“) |
| 6 | Fenster schmal (so dass die Knöpfe in eine zweite Zeile rutschen), abspielen | Höhe des Wellenform-Bereichs bleibt gleich |

## Für später

- MP3 in Resolve: Marker ≈ 50 ms vor dem hörbaren Beat (Resolve rechnet die Verzögerung am Anfang der MP3 nicht heraus).
  Ausgleich im Resolve-Skript vorgeschlagen, noch nicht umgesetzt.
