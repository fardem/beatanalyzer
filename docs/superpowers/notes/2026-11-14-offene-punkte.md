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
  auf MP3-Clips. Im Test 0.2.4 in Resolve bestätigt (Marker der MP3 auf dem Beat, Rest innerhalb eines halben Frames). m4a/AAC (Priming 2112 Samples, Edit-Liste) in Resolve noch zu prüfen.

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

### Sammlung aus dem Test 0.2.14 – umgesetzt in 0.3.0 (außer: Farben beobachten; Server dekodiert für den Browser)

- **Testlisten:** immer nur eine Liste in der neuesten `docs/resolve-test-<version>.md`, offene Punkte älterer
  Versionen werden dort übernommen und die ältere Liste gelöscht (Wunsch des Nutzers).
- **„BeatAnalyzer-Marker entfernen“:** Nach dem Klick bleibt der Knopf klickbar, und man sieht nicht, ob der Befehl
  angenommen wurde. Fehlt: (a) Rückmeldung sofort nach dem Klick, (b) optische Sperre des Knopfs, solange die
  Rückfrage bzw. das Entfernen läuft.
- **Reiter-Text abgeschnitten** (Screenshots 0.2.14, gesperrter Zustand): „usgewählten Clip analysierei“ – der Reiter
  ist für den fetten Text zu schmal (min-width 155 px); Breite nach Text bzw. kein Fettdruck.
- **Falsche MP3-Warnung beim Weg „JSON laden“** (Test 10, „01. Mensch.mp3“, md_beat_this): Die JSON hat kein
  `resolveOffset`. Ursache: Das MP3 hat keinen Xing/Info-Frame → Versatz 0 → der Server schreibt das Feld nicht →
  das Skript hält die JSON für alt/Browser und warnt. Die Marker liegen trotzdem richtig (ohne Xing-Frame verschiebt
  Resolve nicht; die Web-App verschiebt nichts). Abhilfe: Server schreibt bei MP3 immer `resolveOffset` (auch 0);
  das Skript warnt nur, wenn das Feld fehlt, und zeigt bei 0 „kein Ausgleich nötig“.
- **FLAC „03. Serseri.flac“** (Test 9): Web-App meldet „lässt sich im Browser nicht dekodieren“; Resolve importiert
  die Datei auch nicht, Windows/Navidrome spielen sie. Ursache 1: Die Web-App dekodiert jede Datei zuerst im Browser
  (Wiedergabe, Wellenform) und bricht dort ab, auch wenn der Server sie lesen könnte. Abhilfe: bei laufendem Server
  dekodieren lassen (z. B. Server liefert WAV für Wiedergabe/Wellenform). Ursache 2 (warum Resolve/Browser ablehnen)
  geklärt: **ID3v2-Tag (4720 Bytes) vor `fLaC`** – nicht nach FLAC-Format, betrifft das ganze Album (vermutlich
  vom Tagger geschrieben). Sonst normal (44,1 kHz, 16 Bit, Stereo, libFLAC 1.3.1). Server (soundfile, PyAV) liest
  sie; Chromium hier dekodiert sie auch, der Browser des Nutzers und Resolve nicht. Abhilfe für den Nutzer: ID3v2
  aus den FLAC entfernen (z. B. Mp3tag: Tag-Typen nur „APE/Vorbis“, ID3v2 entfernen; oder
  `ffmpeg -i in.flac -map 0 -c copy out.flac`). Für BeatAnalyzer: Web-App erkennt „ID3 vor fLaC“ und meldet das
  klar (Resolve nimmt solche Dateien nicht); ggf. Server dekodiert, wenn der Browser es nicht kann.
- Eindruck Farben (Test 3): passt zur Web-App, „vielleicht ein wenig zu viel gleiche Farben in unterschiedlichen
  Tönen“ – beobachten, keine Änderung verlangt.

## 2. Teilprojekt 5 – README (Gesamtkonzept Abschnitt 10)

**Stand 2026-11-17:** README in drei Sprachen fertig (`README.md` englisch, `README.de.md`, `README.tr.md`) mit
Screenshots aus 0.3.1 (`docs/images/`; Projektname und Timeline-Vorschauen unkenntlich). CHANGELOG ist englisch
(übersetzt); neue Einträge nur noch englisch. Code-Kommentare, Docstrings und `requirements.txt` englisch
(2026-11-17; zwei deutsche Konsolenausgaben in `analyzer.py` gefunden und übersetzt). Interne Arbeitsdokumente unter
`docs/superpowers/` bleiben deutsch (Verlauf). Statt eines Vergleichs mit Resolves „Show Beats“/librosa
(Entscheidung Nutzer: andere nicht schlechtmachen) beschreibt die README im Abschnitt „Why BeatAnalyzer“ unsere
Stärken. Offen: Aussage zu CUDA prüfen.

**Teilprojekt 5 abgeschlossen (0.3.2, 2026-11-17).** Test 0.3.2: Punkte 1–3 bestanden; frische Installation mit
`torch_setup.py` (CUDA-Download, CPU-Fassung ersetzen, `BEATANALYZER_TORCH`) vom Nutzer nicht durchgeführt – nur durch
Unit-Tests abgedeckt. Bei der ersten Rückmeldung eines neuen Nutzers darauf achten.

**Zusammenführung umgesetzt in 0.4.0 (2026-11-17):** Panel Beat-Evidenz & Takt-Korrektur, Experten-Diagnose (über
dem Tempo-Verlauf, Wunsch Nutzer), Live-Spektrum (war in test2 `eb612c4`, im letzten Commit entfernt; Wunsch Nutzer:
„für den verspielten DJ“), Spuren bis 2× Höhe ziehbar (Wunsch Nutzer), dazu Idee 2 (Beats pro Takt) und Idee 4
(Korrekturen als Schritte, überstehen Glätten). **0.4.1:** Idee 1 (Vorschlag mit einem Klick, Vorschau im gefalteten
Takt; Bewertung: Phase über alle Bänder im Fenster, Kick auf der 1, Backbeat; Tempo-Schritte nur bei librosa/Browser
oder extremen BPM) und Idee 3 (Korrektur nur im Ausschnitt). Geprüft an „Mensch“ (Audio + md_beat_this-JSON des
Nutzers): Vorschlag „½× · 4“ trifft die Referenz; kein Fehlalarm auf der Referenz; künstlich verfälschte Raster werden
zurückgeführt. Erkenntnis: Der Kick-Bereich allein unterscheidet Beat und Off-Beat nicht (Bass auf dem „und“); doppeltes
vs. richtiges Tempo ist aus dem gefalteten Takt allein nicht sicher zu entscheiden. Test 0.4.0 + 0.4.1 gemeinsam:
`docs/resolve-test-0.4.1.md`. Idee 5 (Kennzeichnung „korrigiert“ in der Marker-JSON) nicht umgesetzt – Resolve-Fenster bleibt unverändert.
Hinweis Nutzer: Experten-Diagnose ist schwer zu finden (nur Überschrift klickbar).

**Nächste Zusammenführung (nach Teilprojekt 5, Nutzer):** parallele Entwicklung des Nutzers mit dem Panel
„Beat-Evidenz & Takt-Korrektur“ – Onset-Spuren in drei Bändern (Low < 150 Hz Bass/Kick, Mid 150 Hz–2,5 kHz
Snare/Körper, High > 2,5 kHz Hats/Air) mit Takt-Fähnchen, „gefalteter Takt“ (alle Takte gemittelt, je Band eine
Kurve, Hinweis bei schwach ausgeprägter Kick-Verteilung) und „1-Klick-Taktkorrektur“ (Takt-Start ±1 Beat,
Beat-Raster ±½ Beat, Tempo ½×/2×, Rückgängig). Danach in README „Why BeatAnalyzer“ ergänzen.
  Festlegungen (Nutzer, 2026-11-17): Die neuen Funktionen bleiben **nur in der Web-App**; Korrekturen kommen über
  den JSON-Export nach Resolve. Das **Resolve-Fenster gilt als fertig** (Endstand 0.3.x) und wird dafür nicht
  erweitert. Der gefaltete Takt mittelt schon über den sichtbaren Ausschnitt bzw. einen gewählten Bereich.
  Beim Zusammenführen prüfen: Korrektur übersteht neues Glätten; Korrektur landet in der Marker-JSON; Texte in
  `lang/*.json` (EN/DE/TR); Onset-Spuren standardmäßig eingeklappt bzw. an den Zoom gekoppelt.

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
- **Screenshot des Resolve-Fensters (Lua-Dialog) fehlt** in der README – aus der letzten Version (0.3.0) machen.
- **Hauptsprache des Repos wird Englisch:** README, Doku und Code-Kommentare auf Englisch. Der **CHANGELOG nur
  englisch** (keine deutsche oder türkische Fassung). Die englischen Release Notes (`docs/releases/0.2.12.md`) verweisen dann ohne Hinweis auf eine deutsche Fassung.
- **README in drei Sprachen:** `README.md` englisch (Hauptsprache), dazu deutsch und türkisch (z. B.
  `README.de.md`, `README.tr.md`), oben in jeder Fassung Links zu den anderen Sprachen.

## 3. Resolve Free (Idee, nicht entschieden)

- In Free 21.1 laufen Lua-Skripte, aber laut Community kein `UIManager` (kein Fenster) und kein Python.
- Wege: (a) Lua-Skript ohne Fenster (ausgewählter Clip + neueste JSON aus festem Ordner, Meldungen in der Konsole) –
  ob die Marker-API in Free geht, ist zu prüfen; (b) ohne Skript: Web-App exportiert Marker als EDL und Subtitles
  als SRT zum Import von Hand.
- **Wunsch des Nutzers (nach 0.3.0, „eins nach dem anderen“):** am liebsten **Marker auf dem Clip** auch in Free;
  zusätzlich/ersatzweise **SRT-Export in der Web-App** zum Import von Hand. Zu prüfen: welcher Import-Weg in Free
  Marker auf den Clip bringt (Resolve importiert Marker von Hand nur auf die Timeline, z. B. aus EDL – auf den Clip
  vermutlich nur per Skript); erst recherchieren und in Resolve Free testen, dann entscheiden.
- **Recherche (2026-11-17, nur Community-Berichte/Blogs, nichts offiziell, nicht selbst getestet):**
  - Free 19.1+: externe Skripte (Python von außen) und `UIManager`-Fenster nur Studio; Lua aus Workspace → Scripts
    läuft weiter. Free 21.1: Python ganz entfernt; Lua in einer Sandbox – `io` (io.open), `require`, `ffi`,
    `bmd.readfile` sollen fehlen, `print` evtl. ohne Ausgabe; Arbeit an Timeline/Projekt/Bins geht weiter.
  - **JSON in Free einlesen:** wahrscheinlich nicht (keine Dateizugriffe, kein Dateidialog-Fenster).
  - **SRT-Weg (Idee Nutzer):** SRT von Hand importieren (Resolve-Bordmittel, auch Free) und auf eine Subtitle-Spur
    legen; ein Lua-Skript ohne Fenster und ohne Dateizugriff liest die Subtitles über
    `timeline:GetItemListInTrack("subtitle", n)` + `GetName()`/`GetStart()` und setzt per `AddMarker` die Marker auf
    den Clip. Braucht keinen Dateizugriff – aussichtsreichster Weg. Offen: ob `AddMarker` in der Free-Sandbox geht;
    SRT-Text sprachunabhängig auswertbar machen (z. B. Kennzeichen „D“/„B2“ im Text).
  - Variante: Marker als EDL von Hand importieren (Timeline → Import → Timeline Markers from EDL, Bordmittel) und per
    Lua von der Timeline auf den Clip übertragen.
  - Nächster Schritt: kleines Prüf-Skript (Lua, ohne Fenster) für Resolve Free: io.open, AddMarker auf
    ausgewähltem Clip, Subtitles lesen, Ergebnis als Marker sichtbar (falls print stumm ist). Test braucht Resolve
    Free (nicht parallel zu Studio auf demselben Rechner installierbar – anderer Rechner/VM).

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
- **Gesamttempo robuster (Idee, nicht entschieden):** `globalBpm` = 60 / Mittelwert der Beat-Abstände. Bei Songs, in
  denen beat_this abschnittsweise doppelt so viele Beats findet („Teoman – Ağır Kapı“: Tabelle meist 76,9 BPM,
  Gesamttempo 131,2, Stabilität 59 %, Tempo-Kurve bis 375 BPM), zieht das den Wert hoch. Median wäre robuster.
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
- **Sprache (Nutzer, 2026-11-15): Alles im Programm ist englisch** (Server, Kommandozeile, Skripte, Konsole, Meldungen).
  Nur die Oberflächen mit Sprachwahl (Web-App, Resolve-Fenster) zeigen Deutsch/Türkisch, Texte aus `lang/*.json`.
- **Release Notes (`docs/releases/<version>.md`) nur, wenn der Nutzer sie verlangt** (Nutzer, 2026-11-15). Changelog
  und Test-Liste wie bisher.
- Version: `VERSION`, `package.json`, `package-lock.json` (2×), `resolve/BeatAnalyzer_Markers.lua`,
  `resolve/BeatThis_Markers.lua`, README-Zeile; Changelog und Test-Liste (Release Notes nur auf Wunsch).
- Release (Tag = `VERSION`) hängt `BeatAnalyzer.zip` an, das der Updater der Web-App lädt.

**0.5.0 (2026-11-18), Wunsch des Nutzers vor dem Test von 0.4.0/0.4.1:** gefalteter Takt in voller Höhe; Tempo-Verlauf
und Histogramm in einer Kachel nebeneinander; alle Bereiche unter den 6 Zahlenkacheln zuklapp- und verschiebbar
(Layout im Browser gespeichert, „Ansicht zurücksetzen“). Energie-Spektrum und Spektrogramm entfernt (für Cutter ohne
Nutzen); stattdessen Songstruktur (Abschnittswechsel auf Downbeats) zusammen mit Live in einer Kachel direkt unter dem
Player; Live mit Taktzähler, Countdown zur „1“, nächstem Abschnitt; Cue-Marken per Taste M (Umschalt+M: auf die „1“).
Cue/Abschnitt in der Marker-JSON (`cue`, `section`, `sectionDelta`) → Resolve-Skript setzt gelbe/lila Marker (nur
Skriptlogik, Fenster unverändert). Hilfetexte aus Cutter-Sicht. Gemeinsame Testliste: `docs/resolve-test-0.5.1.md`.
Offen: Abschnittserkennung an echten Songs vom Nutzer prüfen lassen (Test 7).

**0.5.1 (2026-11-18), erster Blick des Nutzers auf 0.5.0:** Countdown „Nächste 1 in“ entfernt (verwirrt), Taktzähler
ausblendbar (Spektrum dann volle Breite), Abschnitts-Knöpfe ohne Scrollbalken, mit gedrückter Maus wischbar.
Testliste umbenannt: `docs/resolve-test-0.5.1.md`.

**0.6.0 (2026-11-18), Gemini-Kritik:** Bewertung im Gespräch; umgesetzt, was besser macht (Plan:
`docs/superpowers/plans/2026-11-18-0.6.0-kritik-umsetzen.md`): Server nur für die eigene Web-App, sichere Temp-Dateien
mit unverändertem Songnamen, Metronom samplegenau, Swing-Zeile raus (Raster ± ms), MIDI mit Tempo-Map, Beats
einfügen/löschen, nullphasige Bandfilter ohne Aliasing, Songstruktur über Harmonie/Klangfarbe/Pegel mit Buchstaben,
Altlasten (Ersatzseite, AI Studio) entfernt. Nicht übernommen: WSOLA, automatische 5/4–7/8, neue Swing-Messung,
bereinigte Dateinamen, Beat-Linien ziehen, Web Worker. Testliste: `docs/resolve-test-0.6.0.md`.

**0.6.1 (2026-11-18), Test 0.4.0–0.6.0 bestanden:** Fehler: Song-Lautstärke wirkungslos nach mehreren Plays (alte
Gain-Knoten hingen am Analyser), drei Tempo-Werte für einen Song (Durchschnitt statt Median). Wünsche umgesetzt:
Note = Song stumm, Cue-/Abschnittsfarben im Resolve-Fenster (Wunsch des Nutzers, Fenster dafür geändert), Version in
JSON / erstem Marker / Untertitel, Doppelklick auf blauen Rahmen spielt Ausschnitt, Rückgängig in der Beat-Tabelle,
Spuren 1×/2× statt Griff, Hilfe-Punkte in den Farben der Grafiken. Testliste: `docs/resolve-test-0.6.1.md`.
Testlisten künftig auf Deutsch.

**0.6.2 (2026-11-19), Test 0.6.1:** F2, F3, F4, F8, 22 bestanden; N5 entfällt (keine DAW). Umgesetzt: blauer Rahmen
spielt nach dem Ziehen ab der Loslass-Stelle (F5), Song/Metronom einheitlich stumm mit Symbolen statt Wörtern (F1,
Metronom-Symbol nach Skizze des Nutzers), Rückgängig vor Zurücksetzen im gefalteten Takt (F6), Resolve-Farbfelder in
Resolves eigenen Farben (F7), Doppelklick auf Schnellzoom = Standardfenster beim Laden (Wunsch). BPM pro Marker in
der JSON bleibt (Entscheidung des Nutzers). Testliste: `docs/resolve-test-0.6.2.md`.

**0.6.3 (2026-11-19), Test 0.6.2:** G1, G3, G4 bestanden. G2: Doppelklick auf Schnellzoom flackerte – jetzt wirkt ein
anderes Fenster sofort, das aktive wartet 0,5 s auf einen zweiten Klick. G5: Cue-Marke und Abschnittswechsel im
Resolve-Fenster unter einer Überschrift „Aus der Web-App“ (beide kommen nur aus der Web-App). Testliste:
`docs/resolve-test-0.6.3.md`.

## Vorgemerkt für 0.6.4 / 0.6.5 – Glätten bei Rubato und Free Jazz

Wann es gebaut wird, sagt der Nutzer an.

**Problem.** Glätten (`smooth_bars` in `backend/analyzer.py`: ein Viterbi-Durchlauf mit `REANCHOR_PENALTY = 9.0`)
geht von einem recht stabilen Raster aus. Es zählt volle Takte weiter und setzt nur dort neu an, wo das Modell klar
eine neue „1“ hört. Bei klassischer Musik mit starkem Rubato, bei Free Jazz und bei Musik ohne festes Metrum kann es
deshalb Taktstriche setzen, wo musikalisch keine sind. Die Beats selbst verschiebt es nie, nur die Takteinteilung.

**1. Hinweis im Tooltip von „Glätten“ (Pflicht).** Der Tooltip des Reglers muss den Hinweis tragen, dass bei
solcher Musik 0 % zu nehmen ist, in allen drei Sprachen. Derselbe Text (`plugin.smooth_tip`) erscheint in der
Web-App (Kachel Taktart) und im Resolve-Fenster.
- *Stand:* In 0.6.3 schon vorgezogen. Die letzte Zeile lautet „Rubato, Free Jazz, kein festes Metrum: 0 % nehmen.“
  (en: „Rubato, free jazz, no fixed metre: use 0 %.“, tr: „Rubato, free jazz, sabit ölçü yok: %0 kullanın.“).
  Die READMEs (de/en/tr) erklären es ausführlich im Abschnitt „Glätten“. In 0.6.4 / 0.6.5 prüfen, ob das reicht.

**2. Vorschlag „Glätten 0 %“ aus der Analyse (Idee, offen).** BeatAnalyzer rät heute kein Genre. Statt einer
Genre-Erkennung könnte eine einfache Heuristik das Signal selbst bewerten und einen Hinweis zeigen, ähnlich dem
Vorschlag der Takt-Korrektur:
- *Mögliche Anzeichen:* stark schwankender Tempo-Verlauf (große Streuung der Beat-Abstände über den Song, nicht nur an
  einzelnen Stellen); geringe Sicherheit der Downbeats; viele Stellen, an denen Glätten neu ansetzt oder gegen das
  Modell entscheidet.
- *Verhalten:* nur ein Hinweis mit Knopf („Glätten auf 0 % stellen“), nie automatisch umstellen. Gilt für Web-App
  und Resolve-Fenster.
- *Offen:* Schwellwerte (an echten Rubato-, Free-Jazz- und Pop-Beispielen festlegen; Pop mit Tempowechseln darf keinen
  Fehlalarm auslösen), Text, ob md_beat_this (ohne Regler) einen eigenen Hinweis braucht.
