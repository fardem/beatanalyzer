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

## Nachtrag (Nutzer, später am Abend)

- **100 % soll nicht der neue Standard werden.**
- **Frage:** Ist beat_this das Beste, oder gibt es bessere Python-/GitHub-Projekte? Und reicht vielleicht, was man
  heute bekommt (in der Timeline sieht es „nicht verkehrt“ aus)?
  - Recherche 2026-11-12: beat_this gilt in der Forschung weiter als Bezugspunkt. Neuere Arbeiten (BeatFM mit
    Musik-Foundation-Modellen, „Explore This!“ mit Tatum-Raster, Diffusions-Ansatz) melden laut Paper wenige
    Prozentpunkte besser bei Downbeats; ob es nutzbaren Code gibt, ist ungeprüft. Fehleranalyse „SMC Blind Spot“
    nennt Oktav- und Taktfehler bei beat_this, madmom und Beat Transformer gleichermaßen.
  - Nächster Schritt, falls gewünscht: zwei, drei Kandidaten mit Code an denselben Songs vergleichen.
- **Frage:** Geht das auch für DaVinci Resolve **Free**? Idee: Studio mit Übergabe/Übernahme, Free nur Import.
  - Recherche: In Free 21.1 laufen Lua-Skripte über Workspace → Scripts, aber laut Community-Messungen liefert
    `UIManager` dort nil (kein Fenster); Python-Skripte laufen in Free 21.1 gar nicht mehr. Nicht von Blackmagic
    dokumentiert, am eigenen Build prüfen.
  - Wege für Free: (a) Lua-Skript ohne Fenster (nimmt den ausgewählten Clip und die neueste JSON aus einem festen
    Ordner, Meldungen in der Konsole) – ob die Marker-Funktionen der API in Free gehen, ist zu prüfen;
    (b) ganz ohne Skript: Web-App exportiert Marker als EDL und die Untertitel als SRT, Import in Resolve von Hand
    (Timeline-Marker aus EDL, SRT-Import).

## Für die README (Teilprojekt 5) vorgemerkt

- **librosa-Fallback erkennt keine Downbeats:** `librosa.beat.beat_track` (Ellis 2007, dynamische Programmierung,
  ein Tempo für den ganzen Song) liefert nur Beats. Unser Code setzt jeden 4. Beat ab dem ersten als „1“ (3/4 nur
  bei deutlich höherer Klang-Ähnlichkeit nach 3 Beats). Deshalb gleichmäßig, aber ob die „1“ stimmt, hängt am
  ersten erkannten Beat; nach Edits/halben Takten liegt alles daneben. Browser-Analyse ähnlich. Die Downbeat-Regel
  ist eine Behelfslösung, nicht gemessen. Kommentar im Code („Bass-Gehalt“) stimmt nicht mit dem Verfahren überein.
- Gegenüberstellung: librosa = richtiger Abstand, Glückssache bei der Lage; beat_this = hört die „1“, kurze Takte an
  unsicheren Stellen; beat_this + Regler = gleichmäßig an der gehörten „1“, Neuansatz nach Edits.

## Entscheidung: kein Vergleich zweier Verfahren zur Korrektur

- Idee des Nutzers: beat_this und librosa vergleichen und daraus korrigieren. Verworfen (Nutzer, 2026-11-13):
  librosa liefert keine Downbeat-Information, ein Vergleich kann die „1“ nicht verbessern, nur Fehler einschleppen.
  Stand mit Regler bleibt.
- Mögliche spätere Nutzung (nur als Hinweis, nicht zur Korrektur): Stellen, an denen zwei Beat-Erkenner sich bei
  den Beats nicht einig sind, als „unsicher“ markieren (in der Forschung als „Mutual Agreement“ bekannt, ungeprüft).

## Für die nächste Version vorgemerkt (Nutzer, 2026-11-13) – mit dem nächsten Teilprojekt, nicht einzeln

- **Kein Release 0.1.4 jetzt.** Die Release Notes (`docs/releases/0.1.4.md`, Änderungen seit 0.0.5) gehen mit dem
  nächsten Teilprojekt in die nächste Version und werden dann fortgeschrieben; Tag und GitHub-Release erst dann.
- **Kachel Taktart springt beim Verstellen des Reglers:** Die Zeile unter der Taktart wechselt zwischen
  „nicht geglättet“ (1 Zeile), „n Beats neu eingeteilt / k Neuansätze“ (2 Zeilen) und der Fortschrittszeile
  während der Neuberechnung – die Kachel wird dabei höher und wieder kleiner. Gewünscht: Die Kachel ist immer so
  hoch, dass 2 Zeilen passen, und ändert ihre Höhe nicht mittendrin (feste Mindesthöhe für den Infobereich; die
  Fortschritts-/Fehlerzeile darf die Höhe auch nicht ändern). Prüfung: Höhe der Kachel vor, während und nach
  dem Verstellen gleich.
