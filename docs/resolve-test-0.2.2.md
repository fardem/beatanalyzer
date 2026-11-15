# Test in DaVinci Resolve – Version 0.2.2

Nachtest zu 0.2.1. Vorher: main holen, `start.bat`, in der Web-App **In Resolve aktualisieren**, Resolve neu starten.

| # | Was tun | Was soll passieren |
|---|---|---|
| 1 | „Ausgewählten Clip analysieren“, Modell `md_beat_this`, Häkchen **nicht** setzen, 10 s warten | Fenster ruhig, kein Zucken; Hinweis „Für md_beat_this das Lizenz-Häkchen setzen.“ unter dem Clip |
| 2 | Fenster schließen und neu öffnen (Modell bleibt `md_beat_this`) | wie 1: kein Zucken |
| 3 | Häkchen setzen | Hinweis verschwindet, OK aktiv, Fenster ruhig |

## Web-App

| # | Was tun | Was soll passieren |
|---|---|---|
| 4 | Song analysieren | Kopfzeile „Wellenform & Beat Grid · <Songname> · <Länge>“ |
| 5 | Song mit langem Namen, Fenster schmal ziehen | Name gekürzt mit „…“, voller Name im Tooltip, nichts überlappt |

## Für später (aus dem Test 0.2.1)

- Punkt 3 von 0.2.1 (librosa als Ersatz, wenn `md_beat_this` fehlt) in Resolve nicht geprüft, weil schon installiert;
  die Tests mit nachgebautem Resolve decken ihn ab.
- „Küçük Sevgilim“: Beats liegen einen Hauch vor der Wellenform, bei „Paramparça“ nicht. Zu prüfen: dieselbe Datei
  als MP3 und als WAV/FLAC (MP3 hat am Anfang eine Encoder-Verzögerung, die nicht jedes Programm gleich behandelt),
  `beat_this` gegen `md_beat_this` (20-ms-Raster).
