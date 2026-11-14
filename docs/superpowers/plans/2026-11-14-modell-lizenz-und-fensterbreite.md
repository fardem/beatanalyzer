# Modell- und Lizenzangabe im Subtitle, feste Fensterbreite (0.1.7) – Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Jeder Subtitle (Media Pool und jedes Vorkommen in der Timeline) beginnt mit einem Infoblock inkl. Modell und Lizenz; die Angaben kommen aus der Analyse. Das Resolve-Fenster hat eine feste Mindestbreite und springt nicht mehr.

**Spec:** Nutzerwünsche vom 2026-11-14 (Chat, festgehalten in `docs/superpowers/notes/2026-11-14-resolve-test-tp3.md`, Abschnitt „Runde 0.1.7“).

## Global Constraints

- Infoblock (de):
  ```
  BeatAnalyzer
  <Dateiname>
  <BPM> BPM – <Taktart>
  Model: beat_this – Lizenz: MIT – Nutzung: frei, auch kommerziell
  ```
  Vor dem ersten Beat des Abschnitts, wenn dort mindestens 0,5 s Platz sind; sonst unter den Zeilen des ersten Beats (Leerzeile dazwischen). Gilt für den Media-Pool-Subtitle und für jedes Vorkommen auf den Subtitle Tracks der Timeline.
- Modellangabe aus der Analyse: `engineInfo.model = { name, license, commercial }`; beat_this: `beat_this`, `MIT`, `true`; librosa: `librosa`, `ISC`, `true`. Ohne Angabe (alte JSON, Browser-Analyse) fehlt die Modellzeile. `commercial = false` → „Nutzung: nicht für kommerzielle Nutzung“ (für spätere Modelle).
- Fenster: feste Mindestbreite über eine Zeile mit `MinimumSize = { 580, … }`; der `Resize`-Versuch aus 0.1.6 entfällt (wirkte nicht). Engine-Zeile bekommt nach einer Analyse aus Resolve ihre Höhe (`fit`).
- README: Abschnitt „Modelle und Lizenzen“: BeatAnalyzer liefert keine Modelle aus, beat_this lädt sie beim ersten Lauf direkt vom Anbieter (JKU Linz); sie werden nicht verändert; beat_this Code und Gewichte MIT (kommerziell erlaubt); Hinweis des Anbieters auf Trainingsdaten; librosa ISC. Keine Rechtsberatung.
- Version 0.1.7, Changelog, Release Notes ab 0.1.6, Test-Liste.

## Tasks

1. **Analyzer:** `engineInfo.model` für beat_this/librosa (Tests: Ergebnis und Marker-JSON enthalten sie).
2. **Lua Infoblock:** `M.info_lines(data)`; `build_srt` setzt den Block je Abschnitt vor den ersten Beat (≥ 0,5 s) oder unter ihn (Tests: Media-Pool-SRT mit/ohne Platz, Timeline-Abschnitt mit/ohne Platz, Modellzeile für MIT/kommerziell, nicht kommerziell, ohne Angabe; Texte in de/en/tr).
3. **Fenster:** Mindestbreite, `fit("Engine")` nach Analyse, `Resize` entfernt (Tests: Spec der Zeile hat MinimumSize-Breite 580; Engine-Höhe nach Analyse ≥ 2 Zeilen bei langem Text).
4. **README, Version 0.1.7, Changelog, Release Notes, Test-Liste**, `dist/`.
