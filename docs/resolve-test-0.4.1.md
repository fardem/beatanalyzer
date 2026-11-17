# Test – Versions 0.4.0 and 0.4.1 (beat evidence, grid fixes, suggestion, live spectrum)

One list for both versions (0.4.0 was not tested separately). 0.3.2: points 1–3 passed; the fresh install with
`torch_setup.py` was not run (see docs/tested-environment.md).

All points are in the **web app**; the Resolve window is unchanged. Before: get the new version, `start.bat`.
Analyse with **beat_this** (as you normally do).

## Beat evidence (0.4.0)

| # | What to do | What should happen |
|---|---|---|
| 1 | Analyse a steady 4/4 song | panel "Beat evidence & grid fixes" below the player; band lanes Low/Mid/High; folded bar with a verdict (usually green: kick on beat 1) |
| 2 | Zoom the waveform (e.g. 15 s), move the blue frame | lanes follow the section; button "Section / whole track" at the folded bar switches the averaging |
| 3 | Drag the grip below the lanes down; double-click it | lanes grow up to twice the height; double-click: normal height; the height is kept after a reload |

## Grid fixes (0.4.0)

| # | What to do | What should happen |
|---|---|---|
| 4 | **+1 beat**, then **Undo** | the "1" moves one beat later everywhere (waveform, table, metronome, tiles); Undo brings it back; "n step(s) active" counts |
| 5 | **Tempo ½×**, then **Tempo 2×**, then **Reset** (circle arrow) | beats halve / double, the tempo tile follows; Reset returns to the analysis |
| 6 | Beats per bar: **3**, then **4** | time signature tile 3/4 → 4/4; bars counted again from the first "1" |
| 7 | **Fixes survive Smoothing:** make 1–2 fixes, then move the Smoothing slider (time signature tile) | after recomputing, the fixes are still there ("n step(s) active" unchanged) |
| 8 | Beat table: nudge a beat ±10 ms, then Undo in the fix panel | Undo also takes back the table edit |
| 9 | Export → DaVinci Resolve after fixes, load the JSON in Resolve | markers follow the corrected grid |

## Suggestion and section (0.4.1)

| # | What to do | What should happen |
|---|---|---|
| 10 | A song beat_this gets right | the fix panel shows "Grid looks right – no suggestion" (green) – no false alarm |
| 11 | Same song, press **+1 beat** (break it on purpose) | a suggestion "−1 beat" appears with a dashed line in the folded bar; *Apply* restores the grid ("Grid looks right") |
| 12 | Same with **3** beats per bar (on a 4/4 song) | suggestion "4 beats per bar" (maybe with a bar-start step); dashed preview has its own marks 1–4 at the top |
| 13 | A song with a kick on every beat (house/techno) | "No clear kick pattern – no suggestion, check by ear" |
| 14 | A song where beat_this counted double only in parts (e.g. "Teoman – Ağır Kapı"): zoom to such a part, **Apply to: Section**, then **Tempo ½×** | only the beats in the blue frame change; the rest of the song stays; the tempo curve flattens there |
| 15 | With **Section** active: does the suggestion refer to the section? | the suggestion is computed for the section and applied only there |
| 16 | *(optional)* A song analysed by librosa (without beat_this) with a wrong tempo, e.g. "Mensch" (174 BPM 3/4) | suggestion "Tempo ½× · 4 beats per bar"; after *Apply* about 87 BPM 4/4, folded bar green |

## Expert diagnostics and live spectrum (0.4.0)

| # | What to do | What should happen |
|---|---|---|
| 17 | Open "Expert diagnostics" (click the title) | it sits **above** the tempo curve; spectrogram, energy spectrum, tempo histogram |
| 18 | Mode **Live**, press play | bars move with the music; kick/snare/hats meters; a flash on every beat, stronger on the "1"; idle text when paused |

## Languages (0.4.0 and 0.4.1)

| # | What to do | What should happen |
|---|---|---|
| 19 | German and Turkish | all new texts translated; Turkish says "beat" (not "vuruş") and "Ölçü Ayarı" for the fix panel; suggestion "Öneri", section "Bölüm" |
