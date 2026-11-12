# Rückmeldung zum Regler „Schutz klarer 1“ (0.1.3) – Notiz für die nächste Runde

**Stand:** 2026-11-12 · **Status:** gesammelt, nichts gebaut

## Ergebnis am echten Song

„10. Küçük Sevgilim (Kaan Düzarat Remix).mp3“ (4:54,8, 633 Beats, beat_this auf CPU):

| Einstellung | Takte | Kachel |
|---|---|---|
| Takte glätten aus | 228 | „nicht geglättet“ |
| Schutz 100 % | 155 | „87 Beats neu eingeteilt · 14 Neuansätze“ |

- **Nutzer:** Bei 100 % sieht es gut aus. Das Intro hat an diesen Stellen hörbar Takte, so passt es.
- Ungeglättet setzt beat_this im Intro und in den schnellen Abschnitten fast jeden Beat als „1“ (Takt-Beschriftung
  in der Wellenform nur noch „T T T …“).

## Wünsche zur Oberfläche (Nutzer)

1. **Regler über die ganze Breite der Kachel**, die Beschriftung/Erklärung darüber statt links daneben.
2. **Tooltip beim Überfahren mit der Maus** soll besser erklären, was der Regler macht (heute nur ein kurzer Satz
   im `title`).
3. **Abgeschnittener Text:** „87 Beats neu eingeteilt · 14 Ne…“ wird abgeschnitten (`truncate`). Soll vollständig
   lesbar sein (umbrechen oder kürzer).
4. Gesehen im Screenshot: Die Anzeige „100 %“ bricht in zwei Zeilen um („100“ / „%“).

## Zum Untersuchen (meine Beobachtungen, nicht gefragt)

- **Tempo in Abschnitten:** Die Tempo-Kurve springt zwischen ≈ 115 BPM und ≈ 176 BPM (Beatabstand 0,52 s und
  0,34 s, Faktor ≈ 1,5). beat_this zählt in diesen Abschnitten offenbar auf einer anderen Ebene. Prüfen, ob das
  hörbar stimmt oder ob die Beats dort falsch liegen – Glätten ändert die Beats nicht.
- **Standardwert:** Wenn sich 100 % bei weiteren Songs bewährt, Standard von 85 % ändern? Erst mit mehr Songs
  entscheiden (Waiting For Tonight, Küçük Sevgilim, weitere).
- **Wellenform:** Bei vielen Takten überlappen die Takt-Beschriftungen und die Zeitachse (gehört zu Teilprojekt 4,
  Detailstufe der Wellenform).
- **Mit echtem beat_this nachstellen:** In der Cloud-Umgebung fehlt das Modell. Für die Fehlersuche ggf. beat_this
  (CPU) installieren und den Song direkt analysieren; die MP3 lag als Upload in der Sitzung vor (nicht ins Repo).

## Weiter offen

- Teilprojekt 3 inkl. Wunsch „Marker auch auf dem Clip in der Timeline“ (Gesamtkonzept §7.3).
- Teilprojekt 4 (Web-App: Sprachen, Anzeige Analyse-Programm, Export, Server zuerst, Detailstufe Wellenform).
- Teilprojekt 5 (README).
