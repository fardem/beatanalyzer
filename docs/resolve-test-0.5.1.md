# Test – Versions 0.4.0, 0.4.1, 0.5.0 and 0.5.1

One list for these versions (0.4.0, 0.4.1 and 0.5.0 were not tested separately; 0.5.1 adds your wishes from the first look at 0.5.0). 0.3.2: points 1–3 passed; the fresh
install with `torch_setup.py` was not run (see docs/tested-environment.md).

Almost all points are in the **web app**. The Resolve window is unchanged; only point 25 needs Resolve (new marker
colours). Before: get the new version, `start.bat` (the updater also installs the new Resolve script). Analyse with
**beat_this** (as you normally do).

## Layout (0.5.0)

| # | What to do | What should happen |
|---|---|---|
| 1 | Analyse a song | order: waveform, player, **song structure & live**, beat evidence, tempo, beat table; the six tiles stay on top |
| 2 | Click the title of a panel, then again | the panel folds to its title bar and opens again |
| 3 | Drag a panel at its grip (⋮⋮ left of the title) above or below another | a cyan line shows where it lands; the panel moves there |
| 4 | Click the grip, then press ↑ / ↓ | the panel moves one place up / down |
| 5 | Reload the page and analyse again | order and folding are kept; *Reset view* (below the last panel) brings back the default |

## Song structure & live (0.5.0, 0.5.1)

| # | What to do | What should happen |
|---|---|---|
| 6 | A song with clear parts (intro, chorus, break) | bars of the strip rise and fall with the song; section changes as lines with ▲ / ▼ / ◆ and bar number, buttons below ("Bar 33 · 0:57 louder +5 dB") |
| 7 | Do the section changes fit what you hear? Click a button or into the strip | playback jumps to the "1" of that bar; the change is audible there (or within a bar) – please note songs where it is clearly off |
| 8 | Press play | big bar number, the beats light up in turn (the "1" in rose), "Next section: bar …, in … bars"; **no** countdown to the next "1" any more; spectrum moves, flash on every beat |
| 8a | Button **Bar counter** next to "Live (while playing)", while playing and while paused | the counter disappears, the spectrum takes the full width (not stretched); again: back; kept after reload |
| 8b | A song with many sections, or a narrow window: hold the mouse on the section buttons and swipe left / right | no scrollbar; the row moves with the mouse, the edges fade where more buttons are; letting go after a swipe does **not** jump; a plain click jumps; while playing the row follows the playing section |
| 9 | While playing press **M** twice at different places, then **Shift+M** (or click *Set cue* on the right of the "Song structure" title) | yellow flags in the strip; yellow buttons "Cue 1 · 12.3 · 0:23.4" in the row **between the sections**, by time; Shift+M lands on a "1" (x.1); click jumps there, × removes, the bin next to *Set cue* removes all |
| 10 | Set a cue, then **+1 beat** in the fix panel | the cue stays on a beat of the new grid |

## Beat evidence (0.4.0, layout 0.5.0)

| # | What to do | What should happen |
|---|---|---|
| 11 | Analyse a steady 4/4 song | band lanes Low/Mid/High; **folded bar fills the full height** next to the fix panel; verdict usually green (kick on beat 1) |
| 12 | Zoom the waveform (e.g. 15 s), move the blue frame | lanes follow; "Section / whole track" at the folded bar switches the averaging |
| 13 | Drag the grip below the lanes down; double-click it | up to twice the height; double-click: normal; kept after reload |

## Grid fixes (0.4.0)

| # | What to do | What should happen |
|---|---|---|
| 14 | **+1 beat**, then **Undo** | the "1" moves one beat later everywhere (waveform, table, metronome, tiles); Undo brings it back; "n step(s) active" counts |
| 15 | **Tempo ½×**, **Tempo 2×**, then **Reset** (circle arrow) | beats halve / double, the tempo tile follows; Reset returns to the analysis |
| 16 | Beats per bar **3**, then **4** | time signature tile 3/4 → 4/4; bars counted again from the first "1" |
| 17 | Make 1–2 fixes, then move the Smoothing slider | after recomputing the fixes are still there ("n step(s) active" unchanged) |
| 18 | Beat table: nudge a beat ±10 ms, then Undo in the fix panel | Undo also takes back the table edit |

## Suggestion and section (0.4.1)

| # | What to do | What should happen |
|---|---|---|
| 19 | A song beat_this gets right | "Grid looks right – no suggestion" (green) – no false alarm |
| 20 | Same song, **+1 beat** (break it on purpose) | suggestion "−1 beat" with a dashed line in the folded bar; *Apply* restores the grid |
| 21 | Same with **3** beats per bar (on a 4/4 song) | suggestion "4 beats per bar" (maybe with a bar-start step); the dashed preview has its own marks 1–4 |
| 22 | A song with a kick on every beat (house/techno) | "No clear kick pattern – no suggestion, check by ear" |
| 23 | A song beat_this counted double only in parts (e.g. "Teoman – Ağır Kapı"): zoom there, **Apply to: Section**, **Tempo ½×** | only the beats in the blue frame change; the tempo curve flattens there; with Section active the suggestion refers to the section |

## Tempo (0.5.0)

| # | What to do | What should happen |
|---|---|---|
| 24 | Open the panel **Tempo** | tempo curve (left) and tempo histogram (right) side by side, compact; range and Ø in the title bar also when folded; click into the curve jumps there |

## Export to Resolve (0.4.0 and 0.5.0)

| # | What to do | What should happen |
|---|---|---|
| 25 | After fixes and 2 cues: Export → DaVinci Resolve (note "Included: 2 cue mark(s) … section change(s)"), load the JSON in the Resolve window | markers follow the corrected grid; cues are **yellow** ("Cue 1 – 12.3"), section changes **purple** ("Section ▲ +5 dB – Bar 5") |
| 26 | *(optional)* Export → Audacity, import the labels | extra labels "Cue 1", "Section ▲ +5 dB" |

## Languages and help (all three versions)

| # | What to do | What should happen |
|---|---|---|
| 27 | German and Turkish | all new texts translated; Turkish says "beat", "cue", "marker" (not "vuruş", "işaretçi"); fix panel "Ölçü Ayarı" |
| 28 | Read the **?** help of waveform, song structure, live, cue marks, folded bar, lanes, tempo curve, histogram | understandable for cutting: what does it mean for my cut, what should I do? Note anything unclear or missing |
