# Changelog

## [0.3.2] – 2026-11-17

### Fixed
- **GPU speed on Windows:** `install_and_run.bat` installed PyTorch from PyPI, which on Windows is the **CPU build only** – an NVIDIA card was not used unless PyTorch was installed again by hand. The new `backend/torch_setup.py` reads the CUDA version of the NVIDIA driver from `nvidia-smi` (old "CUDA Version" and new "CUDA UMD Version" format) and installs the tested **PyTorch 2.8.0** as the **CUDA 12.8 build** (driver with CUDA 12.8 or newer, needed by RTX 50 cards), the CUDA 12.6 build for older drivers, otherwise the CPU build. A CPU build from an older installation is replaced; a working CUDA build is never touched. If the CUDA build cannot be installed, it falls back to the newest build of that index and then to the CPU build. `BEATANALYZER_TORCH=cpu|cu126|cu128` sets the build by hand. Only the venv of BeatAnalyzer changes – other Python environments (e.g. Whisper) and the driver stay as they are.
- `debug_check.py` (`debug_system.bat`) printed German texts, and two error messages of the audio decoding were German; all English now.

### Added
- The server banner shows the PyTorch version and whether it is the CUDA or the CPU build; `debug_system.bat` too.
- `docs/tested-environment.md`: the tested PC and all package versions; README "Tested with".

## [0.3.1] – 2026-11-17

Feedback from the test of 0.3.0.

### Fixed
- **Empty browser window at start:** `start.bat`, `install_and_run.bat` and `install_and_run.sh` opened the browser at once while the server was still loading (torch, model). Now the server opens the web app itself as soon as it is ready (`server.py --open-browser`).
- **Doubled progress line in the Resolve window:** "Analysing the track (analysing)" – TR "Parça analiz ediliyor (analiz ediliyor)" – now reads "… (detecting beats)" / "(Beats erkennen)" / "(beat'ler algılanıyor)".
- **Turkish: "marker" instead of "işaretçi"** everywhere (Resolve has no Turkish interface; Resolve terms stay English, as in the glossary). A test checks this.

## [0.3.0] – 2026-11-16

Teilprojekt 4 done: web app and Resolve window share language, terms and colours. Fixes from the test of 0.2.14.

### Fixed
- **"Remove BeatAnalyzer markers" answers at once:** after *Remove* the window shows "Removing BeatAnalyzer markers …" and locks every button until the work is done; then the result in a green box. Before, the removal ran inside the click, the window did not repaint and the button looked as if it ignored the click.
- **Tab text no longer cut off** ("usgewählten Clip analysierei"): the chosen tab is no longer bold (Resolve measures the width for the normal font).
- **No false MP3 warning on the way "Load JSON":** Resolve plays MP3 files without an encoder delay (no Xing/Info frame) on time; the offset is 0. The server now writes `resolveOffset` for every MP3 (also 0), and the window shows "no correction needed" instead of the warning "older JSON or browser". It only warns when the field is missing.
- **FLAC with an ID3 tag:** when a FLAC file starts with an ID3 tag (not allowed by the FLAC format; browsers and Resolve refuse it), the web app says exactly that and how to remove the tag (`ffmpeg -i "file.flac" -map 0 -c copy new.flac`) instead of only "cannot be decoded".

## [0.2.14] – 2026-11-16

### Changed
- **Resolve window in the colours of the web app** (wish of the user: same meaning = same colour):
  - Surface and text in slate like the web app instead of zinc grey.
  - **Cyan** = main action and choice: button *Analyse* / *Apply markers*, chosen tab, chosen beat_this tile, MP3 note.
  - **Amber** = md_beat_this: chosen tile, licence box; also the question before removing.
  - **Red (rose)** = errors and *Remove*; **green (emerald)** = result after the work.
  - The colour squares of the markers keep Resolve's colours.

## [0.2.13] – 2026-11-16

New design of the Resolve window (draft of the user with Google Gemini, tested in Resolve), adopted and adapted to BeatAnalyzer.

### Changed
- **Resolve window reorganised:** song, length and timeline at a glance at the top; section **"1. Source & analysis model"** with the two ways as tabs (*Analyse the selected clip* / *Load JSON*) and the **model as two tiles** (beat_this · also commercial / md_beat_this · non-commercial only); section **"2. Output in Resolve"** with subtitle track and marker colours (folded: small colour squares; unfolded: one colour field per beat).
- Dark colour scheme like Resolve; notes in coloured boxes (blue = note, e.g. MP3; yellow = warning, licence of md_beat_this); the status box only appears when there is something to report.
- The main button reads **"Analyse"** or **"Apply markers"** depending on the way; buttons that do not fit the state are hidden (while analysing only *Cancel*, afterwards *OK*).
- "Remove BeatAnalyzer markers" also works right after the result.
- New texts in `lang/*.json` (Turkish too): `btn_analyze`, `btn_apply`, `sec_source`, `sec_output`; model tiles on two lines.

### Note
- "Python of BeatAnalyzer not found" in the test of the draft: the file was the template from the repo (without BeatAnalyzer folder and Python). The script is installed with *Update in Resolve* in the web app or `install_and_run.bat`; only then does it contain these paths.

## [0.2.12] – 2026-11-15

### Changed
- **All texts of the server in English:** error messages to the web app (e.g. "Audio analysis failed: …", "Settings not saved: …"), messages of the updater, of the ffmpeg check and of the model check during installation, console output, command line (`analyze_cli.py`, help and output) and the fallback page the server shows without `dist/`. The web app itself keeps the chosen language; server messages appear in it in English.
- **Batch and shell scripts in English** (`install_and_run.bat`, `start.bat`, `update.bat`, `run_cli.bat`, `debug_system.bat`, `install_and_run.sh`). Principle (user): the program speaks English; only the interfaces with a language choice (web app, Resolve window) show the chosen language.

## [0.2.11] – 2026-11-15

### Fixed
- Tiles: texts under the value were cut off (e.g. "very steady (like a click track"). They now wrap to a second line when needed; the tempo stability texts are shorter ("very steady", "natural groove", "tempo varies").

## [0.2.10] – 2026-11-15

Feedback from the test of 0.2.9 (all points passed).

### Fixed
- Player: **song, metronome and speed at the same height** (40 px); the speed selector was cut off.
- Time signature tile: without smoothing (librosa, md_beat_this, browser) the time signature appeared a second time in small print below. Nothing is shown there now; with beat_this as before "n beats reassigned / k restarts".

## [0.2.9] – 2026-11-15

Feedback from the test of 0.2.8.

### Changed
- **Loop "section" follows the blue frame:** when you move the frame in the overview (or zoom), its left edge is the start and its right edge the end of the loop; if playback is outside, it jumps to the start. While this loop runs, the view no longer scrolls along by itself.
- More compact player so it stays on one line: speed as a selector.
- **Loop button as an icon** (wish of the user): grey = off, yellow with "A-B" = section (blue frame), green = whole song; the tooltip says what a click does.

### Fixed
- **Player jumped to a second line on every downbeat:** the display "Bar 35 • Downbeat (Beat 1)" was wider than "Bar 34 • Beat 2". It now has two lines of fixed size (bar above, downbeat/beat below); the height of the player stays the same while playing and when switching the loop.

## [0.2.8] – 2026-11-15

Feedback from the test of 0.2.7.

### Added
- **Loop** in the player (button next to the play buttons): 1st click repeats the **visible section** of the waveform (e.g. after `5s`), 2nd click the **whole song**, 3rd click turns it off. If the waveform shows the whole song, it goes straight to the whole song. The loop is gapless; outside it the waveform is dimmed, the limits are yellow, and the range is marked in the overview. Jumping out of the section ends the loop.
- **Song volume** (slider "Song" next to the metronome) to balance song and click.

### Fixed
- Time signature tile: the box "share of bars" wrapped to two lines in Turkish and sat too high. It now stays on one line, aligned at the bottom with the time signature (Turkish "%97 ölçü", "4/4'lük" one size smaller); if the tile is too narrow, it moves to the next line.

## [0.2.7] – 2026-11-15

Teilprojekt 4 (web app), step 2: languages.

### Added
- **Web app in German, English and Turkish.** Language choice in the header (System, Deutsch, English, Türkçe). The server stores the choice in `settings.json`; it also applies to the installed Resolve script. Without a server the browser remembers it.
- All texts of the web app are in `lang/*.json` (section `web`), together with the texts of the Resolve script. Numbers and percentages in the format of the language (89,6 / 89.6; 75 % / 75% / %75).
- Tiles after the glossary: **time signature** · 4/4 (DE *Taktart*, TR *Ölçü* · 4/4'lük) and **bars** · 124 (DE *Taktanzahl*, TR *Toplam* · 124 ölçü). Bar labels, table and tooltips name the bar in the language ("Takt 7", "Bar 7", "Ölçü 7").

### Changed
- Progress and error texts of the analysis come from the language files.
- Window "Model info" corrected: authors and title of beat_this (Foscarin, Schlüter, Widmer – "Beat this! Accurate beat tracking without DBN postprocessing", ISMIR 2024), the analysis flow as it really is (server with beat_this, browser only as fallback).
- Terms after the glossary: table "Downbeats only" instead of "bar starts", column "Confidence".

## [0.2.6] – 2026-11-15

Teilprojekt 4 (web app), step 1. Plan: `docs/superpowers/plans/2026-11-15-teilprojekt-4-web-app.md`.

### Changed
- **Waveform with real detail:** main view and magnifier draw the waveform from the decoded audio, one column per screen pixel (peak and RMS), as in DaVinci Resolve. Before, the envelope came from 2400 peaks for the whole song (one per ≈ 90 ms at 3:30) – zoomed in, the attacks were not visible. The overview is unchanged.
- **No more overlapping** of bar labels and time axis: only every n-th bar is labelled, the time axis picks a suitable step; beat numbers only when there is room.
- **Header shows the analysis program** (e.g. "beat_this · CUDA (RTX 5080)", "librosa (fallback) – beat_this not installed", "Browser analysis (fallback) – no server"), before the analysis from the server, afterwards from the result; the licence is in the tooltip.
- Export "DaVinci Resolve": the option "Downbeats only" and the colour note are gone (colours are set in the Resolve window). The command line keeps `--only-downbeats`.
- The web app waits up to 3 s for the server (before 0.8 s), so a busy server is not replaced by the browser analysis.

## [0.2.5] – 2026-11-15

Feedback from the test of 0.2.4 (MP3 correction in Resolve confirmed: the markers of the MP3 sit on the beat).

### Changed
- Resolve window, way "Load JSON": if the JSON contains the MP3 correction, "MP3: the markers are set 51 ms later …" appears before OK (before, it was only in the message at the end).
- Web app, *Export → DaVinci Resolve*: for MP3 a note names the correction in milliseconds that the JSON contains.

## [0.2.4] – 2026-11-15

Feedback from the test of 0.2.3.

### Fixed
- **MP3 in Resolve: markers sat ≈ 50 ms before the beat.** For MP3 Resolve first plays the Xing/Info frame and the encoder delay, which the analysis (like any gapless playback) leaves out. The server reads the offset from the MP3 header (frame + encoder delay from the LAME tag + 529 decoder samples; e.g. 51.2 ms at 44.1 kHz) and writes it as `resolveOffset` into the analysis and the marker JSON. The Resolve script sets markers and subtitles on MP3 clips that much later and says so ("MP3: markers moved by 51 ms"). Nothing changes on WAV/FLAC clips. JSON files without the value (older or analysed in the browser) still get the warning in the window.
- **The web app silently continued in the browser after a server error** (e.g. an m4a the server could not read). If the server answers, its error message now appears; the browser analysis only steps in when no server runs (with the banner "fallback active").

### Changed
- Resolve window: for MP3 on the way "Analyse the selected clip", the warning is replaced by a note that BeatAnalyzer moves the markers accordingly.

## [0.2.3] – 2026-11-15

Feedback from the test of 0.2.2.

### Added
- Resolve window: **note for MP3** (both ways): Resolve plays MP3 files about 50 ms later than BeatAnalyzer analyses them (Resolve does not remove the encoder delay at the start); the markers sit that much before the beat. For exact markers use the song as WAV or FLAC. Analysing is still possible.

### Fixed
- **m4a/AAC could not be analysed** (web app and Resolve) when ffmpeg was not on the `PATH`. Formats soundfile does not know (m4a/AAC, ALAC, Opus, WMA …) are now read by the server with **PyAV** (brings its own FFmpeg libraries, installed along); without PyAV with the installed ffmpeg (folder from the settings or system `PATH`, on Windows without a console window). The original file is only read; it is read at full resolution at its own sample rate, the encoder delay at the start (MP3/AAC) is removed as before. If a format cannot be read, the message names the remedy.
- Resolve window: **OK stayed active after an analysis error.** Now OK stays locked for this file with this model (only Close); another clip or another model works. This also applies when Python does not start or the time runs out; after Cancel, OK stays active.
- Web app: the **height of the waveform area jumped** while playing in narrow windows. The display "Bar 7 · Downbeat" / "Bar 7 · Beat 2" now has a fixed width and always the same frame, also without a current beat.

## [0.2.2] – 2026-11-15

Feedback from the test of 0.2.1.

### Fixed
- Resolve window: **twitching with `md_beat_this` without the licence box.** Every second the clip line was set first with one line, then with two (note "tick the licence box"); the window laid itself out twice. The text is now set in one step with its final height.

### Added
- Web app: **song name** in the header of the waveform ("Waveform & beat grid · Song.mp3 · 4:55"); long names are shortened, the full name is in the tooltip.

### Changed
- Web app: terms after the glossary – "Takteintritt" and "EINS" are now **Downbeat**. Display above the waveform "Bar 7 · Downbeat" or "Bar 7 · Beat 2", in the player "Bar 7 • Downbeat (Beat 1)".

## [0.2.1] – 2026-11-15

### Changed
- Web app, waveform: **quick selection `5s | 15s | 30s | 60s`** instead of only `20s`. Each button shows a section of that length around the playback position; a second click on the active button shows the whole file again. Buttons for lengths the song does not have are locked. For long songs the zoom limit reaches 5 s.

## [0.2.0] – 2026-11-15

Merge with the parallel development from Google AI Studio (`fardem/BeatAnalyzer_test`, base 0.1.4;
log in `docs/gemini weiterentwicklung 0.1.4.md`). Version 0.1.8 is kept completely.

### Added
- **Second analysis model `md_beat_this`** (Masked Diffusion, fosfrancesco/md_beat_this, **CC BY-NC 4.0 – non-commercial use only**). Not installed along; install it by hand into the `venv` if needed (see README). Server: `/api/analyze?model=md_beat_this`, `/api/health` reports both models; command line: `--model`. Without it, librosa computes. Licence and attribution are in the analysis and marker JSON and in the exports.
- **Resolve window: model choice** on the way "Analyse the selected clip" (`beat_this (MIT)` / `md_beat_this (CC BY-NC 4.0)`). For `md_beat_this` a licence note with <https://github.com/fosfrancesco/md_beat_this> and a box "non-commercial only"; without it OK stays locked. The model is saved, the box is not. Smoothing is hidden for it (the model gives no per-frame probabilities).
- **ffmpeg folder** can be set (web app, `settings.json`, `--ffmpeg-dir`) when ffmpeg is not on the system `PATH`; the folder is checked when saving.
- Web app: model tiles with a gear button, licence and setup window (confirmation once per session), licence line in the result view.
- Waveform: button **`20s`** (20-second section around the playback position), higher zoom limit for long songs, optional **magnifier**, **draggable frame** in the overview.

### Changed
- Web app: smoothing slider only when it has an effect; DAF button locked when the model gives no downbeat curve (the tooltip names the reason).
- Subtitles with `md_beat_this`: no "Confidence" line (the model gives none), info block "Model: md_beat_this – use under the CC BY-NC 4.0 licence". If librosa steps in, it says "md_beat_this not installed".

## [0.1.8] – 2026-11-14

### Fixed
- **Markers in a timeline clip trimmed at the start were shifted.** Resolve counts the markers of a timeline clip from the start of the file, not from the visible start; the trimmed part is no longer subtracted. The subtitles were right.
- Resolve window: after switching from "Analyse the selected clip" to "Load JSON" the button "Choose …" was missing until the window was resized. The window is laid out again after every switch.

### Changed
- Resolve window: lower (460 px instead of 640 px); a saved height is no longer restored, only the position.
- Model line in the subtitle shorter: "Model: beat_this – use under the MIT licence".

## [0.1.7] – 2026-11-14

### Added
- **Info block in every subtitle** (Media Pool and every use in the timeline): BeatAnalyzer, file, tempo and time signature as well as **model and licence**, e.g. "Model: beat_this – licence: MIT – use: free, also commercial". It stands before the first beat if there are at least 0.5 s, otherwise under the first beat. The subtitle in the Media Pool still starts at 0 s so the timing fits when placed at the start of the clip.
- The analysis returns model and licence (`engineInfo.model`: name, licence, commercial use allowed). Prepared for later models with other terms ("not for commercial use").
- README: section **Models and licences** (BeatAnalyzer ships no model, beat_this downloads it from its provider, the model is not changed).

### Fixed
- Resolve window: the width changed with the content (Resolve ignores the requested width). A row with a minimum width now holds the window at least 600 px wide; the ineffective `Resize` attempt from 0.1.6 is gone.
- Resolve window: the line "Analysed with beat_this (…)" overlapped the next line after an analysis from Resolve.

## [0.1.6] – 2026-11-14

### Changed
- Resolve window: **short texts**, details in the tooltip. The progress is called "Tasks" with short lines ("Analysing the track", "Setting markers", "Creating the subtitle", "Subtitle track in the timeline") without the song name in every line. The explanation under "Subtitle track" is one line, the long version is in the tooltip. Shorter tooltip for the smoothing slider (web app too).
- **Marker note** with bar, beat, time, tempo and confidence, e.g. "Bar 24 – Beat 2 | 106.860 s | 120.0 BPM | Confidence 75%" (before only time and tempo).
- **One subtitle track per audio track** the song is on ("BeatAnalyzer - Song (A1)", "… (A2)"); if the song is on one track several times, all uses are on this subtitle track, each under its clip. If the song is on only one track, the track is called "BeatAnalyzer - Song" as before. A new run replaces all these tracks, "Remove BeatAnalyzer markers" removes them. Before, only the first clip in time got a track.
- After creating the subtitle track Resolve shows the timeline that was open before again.
- `install_and_run.bat` downloads the **beat_this model in advance** (`backend/model_check.py`). If that fails, it names the real cause, the folder, the file name and the download address. The server also logs the cause of a load error (beat_this hides it behind "Could not load the checkpoint").

### Fixed
- Job folders of cancelled analyses stayed in `resolve_temp`; they are now deleted the next time the window opens, once Python has finished.
- Resolve window: if Resolve draws the window narrower than requested, the size is set again (console: "resized to …").
- Resolve console: "Selection: ignored entries that are not clips" appeared every second; now only once.

## [0.1.5] – 2026-11-14

### Added
- **Analysis straight from Resolve:** the Resolve window offers two ways at the top, "Analyse the selected clip" and "Load JSON". To analyse, the script starts Python invisibly (`backend/resolve_job.py`, without server and web app), shows the progress and then sets markers and subtitles as on the JSON way. **Cancel** works only during the analysis; until then nothing in the project has changed. Errors, Python not starting (60 s) and the time limit (10 min) are reported without changing the project.
- Resolve window: slider **"Smoothing"** 0–100 % (0 % = off, 100 % = fully smoothed, default 90 %) for the analysis from Resolve; way and value are remembered.
- **Markers also on the song's clips in the timeline**, not only on the clip in the Media Pool: if the song is in the timeline open at OK (audio or video track, also several times), each of these clips gets the markers, a clip trimmed at the start only in its visible part. "Remove BeatAnalyzer markers" removes them too; markers set by hand stay.

### Changed
- **Default smoothing 90 %** everywhere (web app, Resolve window, server `protect`, command line `--protect`); before 70 %.
- Web app: the time signature tile keeps its height while moving the slider (info area always two lines, progress and errors on one line, full text in the tooltip).

## [0.1.4] – 2026-11-13

### Changed
- Web app, time signature tile: the box "Smooth bars" and the slider "Protect a clear 1" are merged into one slider **"Smoothing" 0–100 %** (default 70 %). 0 % = off, the bars stay as beat_this gives them; further right the even grid may move more and more "1"s; 100 % = the grid decides alone. Internally 1–100 % corresponds to the former protection 50–100 % (70 % = formerly 85 %). The slider uses the full width of the tile, label and value are above it; a tooltip explains 0 %, "further right" and 100 %.
- The tile shows "n beats reassigned" and "k restarts" on two lines.

### Fixed
- Web app: "n beats reassigned · k restarts" was cut off, the value "100 %" wrapped to two lines.
- Build: Tailwind also read the old content of `dist/`, so `dist/` changed on every second build (the CI check "dist/ is up to date" depended on it). `dist/` is now excluded.

## [0.1.3] – 2026-11-12

### Added
- Web app: slider "Protect a clear 1" (50–100 %, default 85 %) on the time signature tile. A "1" that beat_this hears at least that surely stays a "1"; at 100 % the grid decides alone. The bars are recomputed as soon as the slider rests briefly (mouse or arrow keys), without running beat_this again: the server keeps audio and model result of the last analysed file, the web app the decoded audio.
- The tile always shows what happened: "n beats reassigned · k restarts" or "not smoothed".
- Server `POST /api/analyze?protect=0.9`, command line `--protect 0.9`, result field `barSmoothing.protect`.

### Changed
- With "Smooth bars" on, the bars are always smoothed. The limit "at least 50 % regular bars" is gone (because of it "Küçük Sevgilim" was not smoothed at all). Bars are only not smoothed when beat_this gives fewer than two downbeats.

## [0.1.2] – 2026-11-12

### Fixed
- Resolve dialog: the line "Analysis program: not given in the JSON …" now gets the height it needs (it was limited to one line and cut off).

## [0.1.1] – 2026-11-12

### Added
- Bar smoothing for analyses with beat_this: beat_this sets every downbeat on its own, so uncertain passages (intro, break, build-up) got bars of 2 or 3 beats. BeatAnalyzer now lays an even bar grid over them and restarts it only where the model clearly hears a different "1" over about two bars. The beats themselves stay unchanged, the confidence stays the model's value – a downbeat added by the grid therefore shows a low confidence. No smoothing when fewer than half of the model's bars are regular.
- Web app: box "Smooth bars" on the time signature tile (on by default, switching re-analyses the song); the tile shows how many beats were reassigned. The share "… % of the bars" refers to the model before smoothing.
- Web app: box "Follow" on the beat table (on by default): while playing, the table turns to the page of the playing beat, the row of the current beat stays marked until the next one comes. With "Downbeats only" the current bar is marked. Turning the pages yourself switches following off.
- Command line `--no-smooth-bars`, server `POST /api/analyze?smoothBars=0`, result field `barSmoothing`.
- A downbeat the model hears very surely (from 85 %) is never overruled by the grid – not even at the start of the song.
- After a restart the beats count on from the new "1" (a bar of two beats reads "1 2", not "1 4"); only the pickup before the first "1" keeps its place in the grid (e.g. "3 4").
- Web app: during the new analysis the box is locked and shows the progress; if it fails, the previous result stays, the box switches back and the error is shown on the tile (no silent fallback to the browser analysis).

### Fixed
- Resolve dialog: long notes (e.g. "No clip found …" with a long file name) were cut off at the top and bottom. The dialog now estimates the needed lines with word wrap and slightly wider characters.

## [0.1.0] – 2026-11-12

### Added
- Language files `lang/en.json`, `lang/de.json`, `lang/tr.json` (English, German, Turkish). The Turkish texts are still to be reviewed.
- Settings file `settings.json` in the BeatAnalyzer folder with the language (default "like the system", otherwise English). The server reads and writes it via `/api/settings`.
- Details of the analysis program (`engineInfo`: beat_this or librosa, CUDA or CPU, graphics card, reason for the fallback) in the result, in the marker JSON and in `/api/health`.

### Changed
- Resolve script: its own window instead of an immediate file dialog. Choose the JSON; the window shows the target clip in the Media Pool with its length, warns about a different file name or when the length of the clip differs by 0.5 s or more from the analysed file, and shows the analysis program. Without a target clip OK stays locked.
- Resolve script: box "Create a subtitle track in the timeline" with an explanation that depends on the box and the open timeline.
- Resolve script: marker colours per beat of the bar (downbeat, beat 2, 3, 4, others), each also "no marker". The subtitles always contain all beats.
- Resolve script: after OK the window shows the steps with progress ("240 / 512") and stays locked until everything is done; the X is ignored meanwhile. The subtitle track goes into the timeline that was open at OK.
- Resolve script: button "Remove BeatAnalyzer markers" with a question (own markers, subtitle track, subtitle in the bin BeatAnalyzer; markers set by hand stay).
- Resolve script: the window remembers the folder of the last JSON, the boxes, colours and window size in `resolve_temp/plugin.txt`.
- Resolve script: the SRT files are created in a working folder under `resolve_temp/` and deleted after the import, no longer next to the JSON. The bin BeatAnalyzer in the Media Pool only holds `<song>.srt`; `<song> (Timeline).srt` is removed after placing.
- Resolve script: messages in the chosen language.
- Resolve script: markers and subtitles appear in the chosen language, e.g. "Takt 24 – Beat 1", "89,6 BPM", "Confidence 75 %". Beat, downbeat and confidence stay English in every language, the separator is "–". Downbeat markers are called "Takt 1" / "Bar 1" / "Ölçü 1".
- Resolve script: the installed script contains language, BeatAnalyzer folder and texts. The server matches it at start and on a change of language; *Update in Resolve* reports an outdated script.
- Confidence per beat now comes from beat_this (probability of the model, always above 50 %) instead of a fixed 95 % or 88 %. Without beat_this it shows "–".
- With beat_this the curves of the web app show its per-frame probabilities. Without beat_this it is the onset strength, and there is no downbeat curve.
- Time signature: instead of a fixed confidence of 95 %, the share of bars with this number of beats ("96 % of the bars"), only with beat_this; without beat_this "–". The name of the time signature is only "4/4" (without "(standard)", "(waltz)").
- An installed Resolve script of the same version is only adapted in its configuration block; your own changes, e.g. of the colours at the top of the script, are kept.
- Resolve window: the JSON line shows the file name, the full path is in the tooltip. The window is at least 600 × 640; lines for warnings and the analysis program only appear when they show something. If the JSON names no analysis program, the window says so.
- Server: the start message clearly says what analyses (beat_this, librosa or nothing at all). `/api/health` also reports the reason `analyzer_failed`.
- `install_and_run.bat`: if NumPy, SciPy, librosa or soundfile cannot be loaded, the installation stops with instructions. If beat_this is missing, a clear warning names the common causes (Git missing, no internet, server running) instead of silently going on with librosa. Without Git a note with a download link appears. At the start a note says to close running BeatAnalyzer windows first.

### Fixed
- Windows batch files: an `&` in title and text lines was run as a command ("The file "mit" cannot be found"). Parentheses in text lines inside blocks ended the block early; because of that `install_and_run.bat` created the environment `venv` anew at every start.
- Server: if `analyzer.py` could not be loaded (e.g. because of a broken NumPy installation), every analysis ended with `NameError: err`; the real cause was lost.
- Resolve script: length of the clip from "Duration" when Resolve gives no frame count for audio clips (before "· ?").
- Resolve script: the old subtitle track is deleted before the new import. Because Resolve does not delete a clip still in use, `<song> (Timeline).srt` clips used to pile up in the Media Pool with every run.
- Resolve script on Windows: files and folders with umlauts in the path are deleted and created with the Unicode functions; before, deleting left a file open and the working folder behind.
- Resolve script: the intermediate clip `<song> (Timeline).srt` is removed on every path, also when the subtitle track cannot be created; if removing fails, the result names the clip.
- Resolve script: "Remove BeatAnalyzer markers" without a chosen JSON only acts on selected clips, not on entries without a file name (e.g. timelines).
- Resolve script: if Resolve closes the window during the work anyway, the script ends once the work is done instead of running on invisibly.
- The length warning shows tenths of a second when both lengths would otherwise look the same.
- `/api/health` no longer starts CUDA only to read the name of the graphics card; otherwise the first analysis after the start could run in the browser instead of with beat_this.

### Known, coming in a later version
- The web app first decodes the file in the browser and silently goes on in the browser when the server does not answer or the analysis fails there. The web app is still German only.
- The README still describes the flow of 0.0.5 (SRT next to the JSON, "Downbeats only" in the export).
- Analysis straight from Resolve without a JSON.

## [0.0.5] – 2026-11-12

### Changed
- The program is called **BeatAnalyzer** (before BeatThis): interface, browser tab, batch window, server messages, README.
- The Resolve script is called `BeatAnalyzer_Markers.lua`, the Media Pool bin and subtitle track are called **BeatAnalyzer** and "BeatAnalyzer - <song>". A new run also deletes the old track "BeatThis - <song>".
- The release file is called `BeatAnalyzer.zip`. Environment variable for private repositories: `BEATANALYZER_GITHUB_TOKEN` (`BEATTHIS_GITHUB_TOKEN` still works).

### Transition from 0.0.4
- Every release also contains `BeatThis.zip`, because the updater up to 0.0.4 looks for this file.
- `resolve/BeatThis_Markers.lua` stays as a transition script: the updater up to 0.0.4 installs it, and it starts `BeatAnalyzer_Markers.lua`. *Update in Resolve* installs the new script and removes the old one from Resolve.
- Unchanged and therefore still valid: the identifier of the marker JSON and of the markers, so old JSON files work and old markers are replaced.

## [0.0.4] – 2026-11-11

### Added
- Resolve script: also creates a subtitle file named after the song (`<song>.srt`, next to the marker JSON) and imports it into the Media Pool bin `BeatThis`. One subtitle per beat, until the next beat, with four lines: type (`Downbeat (1)` / `Beat 2`), `Bar 24 - Beat 1`, `01:02.880 - 89.6 BPM`, `Confidence 75%`. The first subtitle runs from 0 s to the first beat so the times fit when the SRT sits at the start of the clip. A new run replaces the subtitle clip of the last run.
- Resolve script: if a timeline is open in which the song is on an audio track, the subtitles go onto the subtitle track "BeatThis - <song>", exactly under the first use of the song. Start position and the part trimmed at the start are taken into account; beats outside the visible part are dropped. A new run deletes this track and creates it anew. Other subtitle tracks stay but are disabled, because Resolve allows only one active subtitle track. Afterwards the script checks whether the first subtitle is at the expected frame.
- `resolve/tools/probe_timeline.lua`: check script for Resolve. Measures position and trim of the clip, creates two test subtitles, compares them with the expected frames and cleans up afterwards.
- Marker JSON: confidence per beat (`confidence`).

## [0.0.3] – 2026-11-11

### Fixed
- Resolve script: `GetSelectedClips()` in Resolve Studio 21.2 returned an entry without clip methods next to the selected clip. The script counted it as a clip ("2 clip(s): ?, …"), reported 359 skipped markers and wrongly warned that the clip did not match the JSON. Entries without `AddMarker` are now ignored and named with their type in the log.
- Resolve script: the same message "API not available" appears at most three times in the log.

## [0.0.2] – 2026-11-11

### Added
- DaVinci Resolve: export "marker JSON" and script `resolve/BeatThis_Markers.lua`. The script sets one marker per beat on the audio clip in the Media Pool (Red = downbeat, Cyan = beat). The target is the clip selected in the Media Pool, without a selection the clip with the file name from the JSON. A new run replaces the markers of the last run.
- Installation of the Resolve script straight from the app (Export → DaVinci Resolve) and automatically by `install_and_run.bat` when Resolve is installed.
- Update from GitHub: note with an update button in the header, `update.bat`, `backend/updater.py`. Replaced files go to `update-backup/<old version>/`.
- GitHub Actions: `release.yml` attaches `BeatThis.zip` to every release of a version tag, `tests.yml` checks backend, frontend and `dist/`.
- CLI: `--export-resolve`, `--only-downbeats`.
- `LICENSE` (MIT), sections "Licence" and "Credits" in the README with a note and citation for CPJKU beat_this.
- The frontend build writes the licences of the bundled packages to `dist/.vite/license.md`.
- README rewritten, with screenshots (`docs/images/`); `README_WINDOWS.md` was merged into it.

### Fixed
- Updater: a `requirements.txt` with CRLF line endings counted as changed and caused an unnecessary `pip install`.

### Removed
- Leftovers from Google AI Studio: `metadata.json`, `.env.example` and the unused packages `@google/genai`, `express`, `dotenv`, `tsx`, `motion`.
- EDL and CSV marker export for DaVinci Resolve. The EDL put markers on the timeline instead of the clip and only fitted with a clip start of 01:00:00:00 and the same frame rate.

## [0.0.1] – 2026-11-11

First versioned release.

### Added
- Project `beatanalyzer4` imported: Python backend (CPJKU beat_this / librosa fallback), React/Vite frontend, CLI, Windows batch scripts
- `VERSION` file; the version appears in the server banner and in `/api/health`
- Backend tests (`backend/tests`)

### Fixed
- Installation with Python 3.13 (Windows): `numpy<2` removed
- `install_and_run.bat`: package versions quoted (`>` was a redirect), CRLF line endings
- `npm install`: esbuild conflict with Vite 8
- beat_this via `Audio2Beats` with the decoded signal (no FFmpeg/TorchCodec dependency)
- Ready-built frontend shipped in `dist/`
