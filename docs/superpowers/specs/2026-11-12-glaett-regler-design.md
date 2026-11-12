# Konzept: Regler für das Glätten der Takte

**Stand:** 2026-11-12 · **Status:** Entwurf zur Prüfung · **Größe:** kleine Änderung

## Warum

Beim Song „Küçük Sevgilim (Kaan Düzarat Remix)“ wurde gar nicht geglättet: Nur 44 % der Modell-Takte hatten
4 Beats, die Glättung springt erst ab 50 % an. Die Web-App zeigte das nicht. Zusätzlich hält beat_this in den
schnellen Abschnitten (Beatabstand ≈ 0,34 s) fast jeden Beat für eine „1“, oft über 85 % sicher. Diese „1“en
sind heute geschützt. Durchgespielt mit den Daten des Songs (Glättung erzwungen):

| Schutz klarer „1“en | Neuansätze | 4er-Takte |
|---|---|---|
| ab 85 % (heute) | 62 | 65 % |
| ab 95 % | 29 | 80 % |
| aus | 10 | 92 % |

Der Nutzer will selbst entscheiden, wie streng das Raster ist, mit einem freien Regler statt fester Stufen.

## Wege

1. Drei feste Stufen (Locker/Mittel/Streng). Verworfen vom Nutzer.
2. **Freier Regler für den Schutz klarer „1“en.** Gewählt.
3. Zwei Regler (Schutz und 50-%-Grenze). Verworfen: Die 50-%-Grenze macht kaum etwas aus und ist schwer zu
   verstehen (meine Wahl).

## Entwurf

- **Regler „Schutz klarer 1“** an der Kachel Taktart, unter dem Häkchen „Takte glätten“: 50 % bis 100 % in
  Schritten von 1 %, Standard 85 %. 100 % heißt: kein Schutz, das Raster entscheidet allein (die Strafe für einen
  Neuansatz bleibt). Ein Downbeat, den beat_this mindestens so sicher hört, bleibt immer eine „1“.
- **Die 50-%-Grenze entfällt (meine Wahl):** Ist das Häkchen an, wird immer geglättet. Bei Songs mit echten
  Taktwechseln schaltet man das Häkchen aus. Der Schutz klarer „1“en verhindert ohnehin, dass deutliche
  Taktwechsel überstimmt werden.
- **Neu rechnen ohne neue Analyse (meine Wahl):** Der Server merkt sich die Ausgabe von beat_this für die zuletzt
  analysierte Datei (Prüfsumme der Datei, nur im Arbeitsspeicher). Ändert sich nur der Regler, wird nur die
  Glättung neu gerechnet: Bruchteile einer Sekunde statt einer ganzen Analyse. Neu gerechnet wird beim Loslassen
  des Reglers.
- **Die Kachel zeigt immer, was passiert ist:** „n Beats neu eingeteilt · k Neuansätze“, oder bei Häkchen aus
  „nicht geglättet“.
- **Schnittstellen:** `POST /api/analyze?smoothBars=0|1&protect=0.50…1.00`; Kommandozeile `--protect 0.9`;
  `barSmoothing` bekommt das Feld `protect`. Ungültige Werte für `protect` werden auf 0,50…1,00 begrenzt.
- **Resolve:** übernimmt, was exportiert wurde. Der Regler wird nicht gespeichert und gilt pro Song (wie das
  Häkchen).

**Wäre ein Fehlschlag:** Wenn sich die Takte beim Bewegen des Reglers ändern, obwohl beat_this nicht neu
gerechnet hat und der Regler zurück auf denselben Wert steht – gleicher Wert muss gleiches Ergebnis geben.

## Tests

1. `smooth_bars` mit Schutz 1,00 überstimmt eine „1“ mit 0,9, mit 0,85 nicht.
2. Ohne 50-%-Grenze: Ein Song mit 44 % regelmäßigen Takten wird geglättet (`applied == true`).
3. Server: zweiter Aufruf mit derselben Datei und anderem `protect` ruft beat_this nicht erneut auf; anderes
   `protect` ändert das Ergebnis, gleiches `protect` gibt das gleiche Ergebnis.
4. `protect` außerhalb 0,50…1,00 wird begrenzt.
5. Web-App (Playwright, Server nachgestellt): Regler loslassen schickt `protect`, Kachel zeigt die Neuansätze.

## Dem Bauenden überlassen

- Genaue Gestaltung des Reglers in der Kachel.
- Wie viele Dateien der Server sich merkt (mindestens die letzte).
