# Plan Teilprojekt 4 – Web-App (Gesamtkonzept Abschnitt 9)

Stand nach 0.2.5. Drei Schritte, jeder endet lauffähig mit eigener Version und Test des Nutzers.

## Schritt 1 – Anzeige und Export (0.2.6)

- [x] Wellenform **aus den dekodierten Audiodaten** je Bildschirmspalte (Min/Max, RMS als heller Kern), statt aus
      2400 Spitzen für den ganzen Song (≈ 90 ms je Spitze bei 3:30 → Anschläge unsichtbar, Rückfrage des Nutzers).
      Gilt für Hauptansicht und Lupe; die Übersicht bleibt bei den Spitzen der Analyse.
- [x] Takt-Beschriftungen und Zeitachse **ohne Überlappung**: nur jeder n-te Takt beschriftet (1, 2, 4, 8 …),
      Zeitachse in „runden“ Schritten mit Mindestabstand; Fähnchen nach allen Linien gezeichnet; dichte Takt-Linien
      dünner.
- [x] **Anzeige des Analyse-Programms** in der Kopfzeile (Konzept Abschnitt 8): „beat_this · CUDA (RTX 5080)“,
      „md_beat_this · CPU“, „librosa (Ersatz) – beat_this nicht installiert“, „Browser-Analyse (Ersatz) – kein
      Server“; vor der Analyse aus `/api/health`, danach aus dem Ergebnis; Lizenz im Tooltip.
- [x] Export „DaVinci Resolve“: Auswahl „Nur Downbeats“ und Farbhinweis entfallen (Nutzer: Hinweis entfällt
      komplett); `--only-downbeats` der Kommandozeile bleibt.
- [x] **Server zuerst:** Serverfehler werden angezeigt (0.2.4); Wartezeit auf `/api/health` 3 s statt 800 ms,
      damit ein beschäftigter Server nicht still durch die Browser-Analyse ersetzt wird.
- [x] Detailstufe der Wellenform: erledigt mit der Schnellauswahl 5/15/30/60 s (0.2.1).

## Schritt 2 – Sprachen (0.2.7) – erledigt

- [x] `src/i18n.tsx`: Sprachdateien, `t()`, `num`/`pct`/`meter`, Sprachwahl (Server `/api/settings`, sonst Browser).
- [x] Texte aller Komponenten über `t()` aus `lang/*.json` (neuer Abschnitt `web`), Zahlen über `Intl.NumberFormat`
  mit der Sprache aus `_meta`.
- [x] Sprachwahl in der Kopfzeile (System, Deutsch, English, Türkçe), gespeichert über `/api/settings`; ändert auch die
  Sprache des Resolve-Skripts (wie heute).
- [x] Kacheln Taktart und Taktanzahl nach Glossar 3.2 (TR: „Ölçü · 4/4'lük“, „Toplam · 124 ölçü“).
- [x] Begriffe nach Glossar (z. B. „Taktanfänge“ in der Beat-Tabelle → Downbeats).

## Schritt 3 – Resolve-Fenster an die Web-App angleichen (0.3.0 = Teilprojekt 4 fertig)

- Begriffe, Anzeige des Analyse-Programms und Modellwahl/Lizenzhinweis wie in der Web-App.
- Danach Teilprojekt 5 (README).

Offen nach Schritt 2: Meldungen des Servers (`backend/server.py`, `analyzer.py`) sind noch deutsch; türkische Texte vom Nutzer zu prüfen.
