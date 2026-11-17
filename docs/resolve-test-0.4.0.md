# Test – Version 0.4.0 (beat evidence, grid fixes, live spectrum)

0.3.2: points 1–3 passed (fresh install with `torch_setup.py` not run, see docs/tested-environment.md).
This list only has what is new. All points in the **web app**; the Resolve window is unchanged.

| # | What to do | What should happen |
|---|---|---|
| 1 | Analyse a steady 4/4 song with beat_this | panel "Beat evidence & grid fixes" below the player; band lanes Low/Mid/High; folded bar with a verdict (usually green: kick on beat 1) |
| 2 | Zoom the waveform (e.g. 15 s), move the blue frame | lanes follow the section; folded bar button "Section / whole track" switches the averaging |
| 3 | Drag the grip below the lanes down; double-click it | lanes grow up to twice the height; double-click: back to normal; height is kept after a reload |
| 4 | **+1 beat**, then **Undo** | "1" moves one beat later everywhere (waveform, table, metronome, tiles); Undo brings it back; "n step(s) active" counts |
| 5 | **Tempo ½×** then **Tempo 2×**, then **Reset** (circle arrow) | beats halve / double, tempo tile follows; Reset returns to the analysis |
| 6 | Beats per bar: **3**, then **4** | time signature tile 3/4 → 4/4; bars re-counted from the first "1" |
| 7 | **Smoothing survives:** make 1–2 fixes, then move the Smoothing slider (time signature tile) | after recomputing, the fixes are still there ("n step(s) active" unchanged) |
| 8 | Beat table: nudge a beat ±10 ms, then Undo in the fix panel | Undo also takes back the table edit |
| 9 | Export → DaVinci Resolve after fixes, load the JSON in Resolve | markers follow the corrected grid |
| 10 | Open "Expert diagnostics" (click the title) | it sits **above** the tempo curve; spectrogram, energy spectrum, tempo histogram |
| 11 | Mode **Live**, press play | bars move with the music; kick/snare/hats meters; a flash on every beat, stronger on the "1"; idle text when paused |
| 12 | Language German and Turkish | all new texts translated; Turkish says "beat" (not "vuruş") and "Ölçü Ayarı" for the fix panel |
| 13 | A song librosa/beat_this gets wrong (double tempo or 3/4 instead of 4/4) | Tempo ½× / Beats per bar fix it; the folded bar turns green |
