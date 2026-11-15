# Offene Punkte und Übergabe – Stand 0.1.8 (2026-11-14)

Übergabe für einen neuen Thread, in dem Teilprojekt 4 mit einer parallelen Entwicklung zusammengeführt wird.

## Stand

- **main = 0.2.0** (Zusammenführung, PR fardem/beatanalyzer#19; Release 0.1.8 bleibt); 0.2.1 = Schnellauswahl 5/15/30/60 s; 0.2.2 = Zucken im Resolve-Fenster behoben, Songname in der Web-App. Releases 0.2.0/0.2.1 entfallen, Release Notes 0.2.2 decken 0.1.5–0.2.2 ab, CI grün (Backend Windows/Ubuntu, Frontend mit `dist/`-Prüfung). Entwicklungs-Branch war
  `claude/nifty-curie-vagvn5`.
- **Fertig und in Resolve getestet:**
  - Teilprojekt 1 (Grundlage: Sprachdateien, `settings.json`, Analyse-Programm, echte Confidence/Kurven).
  - Teilprojekt 2 (Resolve-Dialog, JSON-Weg).
  - Teilprojekt 3 (Analyse direkt aus Resolve, Marker auch auf Timeline-Clips, ein Subtitle Track je Audiospur).
  - Takte glätten mit Regler „Glätten“ 0–100 % (Standard 90 %) in Web-App und Resolve.
  - Infoblock mit Modell und Lizenz im Subtitle; Modell von beat_this wird bei der Installation vorab geladen.
- Gesamtkonzept: `docs/superpowers/specs/2026-11-12-resolve-dialog-und-sprachen-design.md`
  (Teilprojekte in Abschnitt 5, Web-App in Abschnitt 9, README in Abschnitt 10).
- Testergebnisse und Nutzerentscheidungen: `docs/superpowers/notes/2026-11-14-resolve-test-tp3.md`,
  `docs/superpowers/notes/2026-11-12-rueckmeldung-glaett-regler.md`.

## 0. Version 0.2.0 – Zusammenführung mit der parallelen Entwicklung (2026-11-15)

- Der Zweig aus Google AI Studio (`fardem/BeatAnalyzer_test`, Basis 0.1.4, Protokoll
  `docs/gemini weiterentwicklung 0.1.4.md`) ist per 3-Wege-Merge in 0.1.8 übernommen: Modell `md_beat_this`
  (CC BY-NC 4.0) in Server, Kommandozeile und Web-App, `ffmpeg`-Ordner, Lizenz-Modal, Lupe, `20s`-Zoom, ziehbarer
  Rahmen der Übersicht, DAF/BAF je nach Kurve. Die Basis war unser `5cb8010` (Code gleich 0.1.4); Import-Commit
  `2f82fca`, Merge `46f1560`.
- Nicht übernommen (Umgebung von AI Studio): Löschung von `package-lock.json`, Dateirechte von
  `install_and_run.sh`, Bilder und Test-JSON unter `public/assets/aistudio/`, gelöschte `docs/releases/0.1.4.md`.
  Ein Test von Gemini lief nur mit installiertem `torch` und ist angepasst.
- **Resolve-Fenster:** Im Weg „Ausgewählten Clip analysieren“ wird das Modell gewählt (`beat_this` / `md_beat_this`).
  Bei `md_beat_this` erscheinen der Lizenzhinweis (CC BY-NC 4.0, nur nicht-kommerziell,
  <https://github.com/fosfrancesco/md_beat_this>) und ein Häkchen, das gesetzt sein muss, sonst bleibt OK aus. Das
  Häkchen wird nicht gespeichert (jedes Fenster fragt neu), das Modell schon. „Glätten“ ist bei `md_beat_this`
  ausgeblendet (keine Wahrscheinlichkeiten je Frame). Subtitles ohne Zeile „Confidence“, Infoblock mit
  „md_beat_this – CC BY-NC 4.0“; Ersatz durch librosa nennt „md_beat_this nicht installiert“.
- **Offen nach Teilprojekt 4:** Das Resolve-Fenster wird nach der Web-App wieder angeglichen (Begriffe, Anzeige des
  Analyse-Programms, Modellwahl und Lizenzhinweis wie in der Web-App). In Resolve noch nicht getestet.
- Noch zu prüfen: Texte der Web-App aus dem Gemini-Zweig sind nur deutsch (gehört zu Teilprojekt 4, Sprachen);
  `md_beat_this` selbst ist hier nicht installiert und nur mit nachgestellten Modulen getestet.

- **MP3 in Resolve (0.2.4 umgesetzt):** Resolve spielt Xing/Info-Rahmen und Encoder-Verzögerung mit ab (gemessen
  ≈ 48 ms im Bildschirmfoto, berechnet 51,18 ms = 1152 + 576 + 529 Samples bei 44,1 kHz). `backend/mp3_offset.py`
  liest den Wert aus dem MP3-Kopf → `resolveOffset` in Analyse und Marker-JSON → Skript verschiebt Marker/Subtitles
  auf MP3-Clips. Annahme „Resolve spielt den Xing-Rahmen als Stille“ ist durch den Test in Resolve zu bestätigen
  (`docs/resolve-test-0.2.4.md`). m4a/AAC (Priming 2112 Samples, Edit-Liste) in Resolve noch zu prüfen.

## 1. Teilprojekt 4 – Web-App (Gesamtkonzept Abschnitt 9)

- **Sprachen:** Sprachwahl in der Kopfzeile (System, Deutsch, English, Türkçe), gespeichert über `/api/settings`
  (gibt es schon). Alle Texte der Komponenten über `t()` aus `lang/*.json`; Zahlen über `Intl.NumberFormat` mit der
  Sprache aus `_meta`. Heute ist die Web-App nur deutsch.
- **Kacheln Taktart und Taktanzahl** nach Glossar (Konzept 3.2): Resolve-Begriffe und Beat/Downbeat/Confidence
  bleiben englisch, Takt/Taktart/Taktanzahl werden übersetzt (TR: Taktart „Ölçü · 4/4'lük“, Taktanzahl
  „Toplam · 124 ölçü“; Endungen 2→'lik, 4→'lük, 8→'lik, 16→'lık).
- **Export „DaVinci Resolve“:** Auswahl „Nur Downbeats“ entfällt; Hinweis, dass die Farben im Resolve-Fenster
  eingestellt werden braucht nciuht, das entgfällt im web app komplett. `--only-downbeats` der Kommandozeile bleibt.
- **Anzeige des Analyse-Programms** (Konzept Abschnitt 8): beat_this/librosa, CUDA/CPU, Grafikkarte, Grund für den
  Ersatz; `engineInfo` (mit `model`) liefert der Server schon.
- **Server zuerst statt Browser:** Heute dekodiert die Web-App die Datei im Browser und rechnet still im Browser
  weiter, wenn der Server nicht antwortet (`src/utils/audioAnalyzer.ts`). Gewünscht: zuerst der Server; Ersatz nur
  mit sichtbarem Hinweis. (Das Neu-Rechnen beim Verstellen von „Glätten“ verlangt den Server schon.)
- **Detailstufe der Wellenform** (Festlegung 22): Symbol „Details“ neben den Lupen; Ausschnitt ≈ 15 s um die
  Abspielposition, läuft beim Abspielen mit; Zoomgrenze (heute 16-fach) richtet sich nach der Songlänge; Songs
  unter 15 s bleiben ganz sichtbar; zurück mit „Ganze Datei anzeigen“. Dazu: Takt-Beschriftungen und Zeitachse
  überlappen bei vielen Takten.

## 2. Teilprojekt 5 – README (Gesamtkonzept Abschnitt 10)

- Ablauf von 0.1.x statt 0.0.5 (Resolve-Fenster mit beiden Wegen, Glätten, Farben, Entfernen, Sprachen, Anzeige
  des Analyse-Programms, Subtitle Track je Spur).
- **Vergleich mit Resolves „Show Beats“:** warum beat_this anders arbeitet und welche Vorteile das bringt
  (Paper „Beat this! Accurate beat tracking without DBN postprocessing“, ISMIR 2024; Doku von Resolve; Unbekanntes
  als unbekannt benennen).
- **Vergleich mit librosa** (vorgemerkt): librosa erkennt keine Downbeats; der Ersatz setzt jeden 4. Beat ab dem
  ersten (3/4 bei höherer Klangähnlichkeit nach 3 Beats) – gleichmäßig, aber die Lage der „1“ ist Glückssache.
  beat_this hört die „1“; mit „Glätten“ gleichmäßig an der gehörten „1“, Neuansatz nach Edits.
- Aussage „mit NVIDIA-Grafikkarte über CUDA“ prüfen (installiert die Standardinstallation die CPU-Fassung?).
- Abschnitt „Modelle und Lizenzen“ ist schon da (0.1.7).

## 3. Resolve Free (Idee, nicht entschieden)

- In Free 21.1 laufen Lua-Skripte, aber laut Community kein `UIManager` (kein Fenster) und kein Python.
- Wege: (a) Lua-Skript ohne Fenster (ausgewählter Clip + neueste JSON aus festem Ordner, Meldungen in der Konsole) –
  ob die Marker-API in Free geht, ist zu prüfen; (b) ohne Skript: Web-App exportiert Marker als EDL und Subtitles
  als SRT zum Import von Hand.

## 4. Zurückgestellte Kleinigkeiten

**Resolve-Skript**
- Fehlerzeilen des Timeline-Schritts nennen die Audiospur (A1/A2) nicht.
- „BeatAnalyzer-Marker entfernen“ findet einen liegengebliebenen Zwischen-Clip „Song (Timeline A1).srt“ nicht (nur
  wenn Resolve das Löschen verweigerte).
- Zwei BeatAnalyzer-Fenster gleichzeitig: Das Aufräumen des einen kann den gerade fertigen Auftrag des anderen
  löschen.
- Ein Song, der wörtlich „X (A2)“ heißt, kollidiert mit den Tracks von „X“.
- Die kurze Erklärung unter „Subtitle Track“ bricht mit Timeline-Markern auf zwei Zeilen um (en/tr länger).
- „n Subtitles“ in der Meldung zählt den Info-Subtitle mit.
- Python startet im Arbeitsordner von Resolve (`ShellExecuteW` ohne Arbeitsordner) – besser `BA.home`.
- Jeder Clip mit Datei wird für „analysieren“ angenommen (keine Prüfung auf Audio).
- Die Prüfung jede Sekunde geht alle Videospuren durch (große Timelines).
- Konsole: „API not available: GetName“ einmal pro Lauf (Rauschen).
- Leere Zeile für die Mindestbreite könnte oben etwas Leerraum erzeugen (im Test 0.1.8 als passend bestätigt).

**Installation / Server**
- Die Ursache aus `model_check.py` steht nur in der Konsole, nicht in `install_log.txt`.
- Server versteht nur `smoothBars=0` als „aus“; Kommandozeile gibt `barSmoothing` nicht aus.

**Glätten / Analyse**
- Testlücken: 3/4-Takt und Songende bei `smooth_bars`.
- Tempo-Sprünge in Abschnitten (z. B. „Küçük Sevgilim“: ≈ 115 ↔ 176 BPM, Faktor 1,5) – beat_this zählt dort auf
  anderer Ebene; nicht untersucht.
- Ideen, nicht verfolgt: final0–2 gemittelt (Ensemble); Stellen, an denen sich zwei Beat-Erkenner nicht einig sind,
  als „unsicher“ markieren.

## 5. Wichtig zu wissen (aus den Tests in Resolve)

- Resolve zählt **TimelineItem-Marker ab dem Anfang der Quelldatei** (nicht ab dem sichtbaren Anfang).
- Resolve **ignoriert die verlangte Fensterbreite** und `Resize`; die Breite folgt dem Inhalt → leere Zeile mit
  `MinimumSize` hält sie. Höhe wird übernommen.
- `ui:Slider` mit `ValueChanged` funktioniert im Resolve-Fenster.
- Nach dem Ein-/Ausblenden von Zeilen braucht das Fenster `RecalcLayout` (sonst fehlen Elemente).
- `pythonw.exe` hat kein `stdout`/`stderr` → `resolve_job.py` leitet nach `log.txt` um.
- beat_this verdeckt Download-Fehler hinter „Could not load the checkpoint“ (Download in `except
  FileNotFoundError`) → `model_check.cause_of` sucht die echte Ursache.
- Python startet aus Resolve unsichtbar über `ShellExecuteW` (getestet, kein Konsolenfenster).

## 6. Arbeitsweise im Projekt

- Tests: `venv/bin/python -m unittest discover -s backend/tests` (Lua-Tests über `lupa` gegen nachgebautes
  Resolve), `npm run lint` (tsc). Web-App ohne Test-Framework: Playwright-Prüfungen mit nachgestellten Server-
  Antworten (nicht im Repo).
- `dist/` ist committet; nach jeder Änderung an `src/` **oder am Lua-Skript** (`npm run build`, die Web-App bündelt
  das Skript) neu bauen; die CI prüft, dass `dist/` aktuell ist. Tailwind liest `dist/` nicht mit
  (`@source not "../dist"`), der Build ist reproduzierbar.
- Neue Texte in `lang/en.json`, `de.json`, `tr.json`; danach `python backend/resolve_plugin.py template` (englische
  Vorlage im Lua-Skript; ein Test prüft den Gleichlauf).
- Version: `VERSION`, `package.json`, `package-lock.json` (2×), `resolve/BeatAnalyzer_Markers.lua`,
  `resolve/BeatThis_Markers.lua`, README-Zeile; Changelog, `docs/releases/<version>.md`, Test-Liste für Resolve.
- Release (Tag = `VERSION`) hängt `BeatAnalyzer.zip` an, das der Updater der Web-App lädt.
