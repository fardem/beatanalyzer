"""
Tests for resolve/BeatAnalyzer_Markers.lua against a small fake of the DaVinci Resolve API.
Needs the package "lupa" (pip install lupa); without it the tests are skipped.
They do not replace a test in Resolve.
"""

import json
import os
import sys
import tempfile
import unittest
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
ROOT = BACKEND_DIR.parent
sys.path.insert(0, str(BACKEND_DIR))

try:
    from lupa import luajit21
except ImportError:  # pragma: no cover
    luajit21 = None

from analyzer import resolve_marker_data  # noqa: E402
import i18n  # noqa: E402
import resolve_plugin  # noqa: E402

SCRIPT = (ROOT / "resolve" / "BeatAnalyzer_Markers.lua").read_text(encoding="utf-8")

# Fake Resolve: media pool with clips; AddMarker refuses a second marker on the same frame (as Resolve does).
MOCK = r"""
local function clip(name, file, fps, frames)
  local c = { name = name, file = file, fps = fps, frames = frames, markers = {} }
  function c:GetName() return self.name end
  function c:GetClipProperty(key)
    if key == "File Name" then return self.file end
    if key == "FPS" then return self.fps end
    if key == "Frames" then return self.frames end
    return ""
  end
  function c:AddMarker(frame, color, name, note, duration, custom)
    if self.markers[frame] then return false end
    self.markers[frame] = { color = color, name = name, note = note, duration = duration, custom = custom }
    return true
  end
  function c:GetMarkers()
    local out = {}
    for f, m in pairs(self.markers) do
      out[f] = { color = m.color, name = m.name, note = m.note, duration = m.duration, customData = m.custom }
    end
    return out
  end
  function c:DeleteMarkerByCustomData(custom)
    for f, m in pairs(self.markers) do
      if m.custom == custom then self.markers[f] = nil; return true end
    end
    return false
  end
  return c
end
local function folder(name, clips)
  local f = { name = name, clips = clips or {}, subs = {} }
  function f:GetName() return self.name end
  function f:GetClipList() local out = {} for i, c in ipairs(self.clips) do out[i] = c end return out end
  function f:GetSubFolderList() local out = {} for i, s in ipairs(self.subs) do out[i] = s end return out end
  return f
end
MOCK = { clip = clip, selected = {}, imported = {}, texts = {} }
local song = clip("Song", "Müller Song.wav", "25", "500")
local other = clip("Other", "other.wav", "25", "500")
MOCK.song, MOCK.other = song, other
local sub = folder("Songs", { song })
local root = folder("Master", { other })
root.subs[1] = sub
MOCK.root = root
local current = root
local pool = {
  GetRootFolder = function() return root end,
  GetSelectedClips = function() return MOCK.selected end,
  GetCurrentFolder = function() return current end,
  SetCurrentFolder = function(_, f) current = f return true end,
  AddSubFolder = function(_, parent, name)
    local f = folder(name)
    parent.subs[#parent.subs + 1] = f
    return f
  end,
  ImportMedia = function(_, paths)
    local out = {}
    for _, p in ipairs(paths) do
      local name = p:match("([^/\\]+)$")
      if MOCK.fail_import then return {} end
      local c = clip(name, name, "25", "500")
      c.path = p
      c.text = PY_READ(p)        -- Resolve keeps the subtitles; the file may be deleted afterwards
      MOCK.texts[name] = c.text
      current.clips[#current.clips + 1] = c
      MOCK.imported[#MOCK.imported + 1] = p
      out[#out + 1] = c
    end
    return out
  end,
  DeleteClips = function(_, list)
    for _, c in ipairs(list) do
      if MOCK.fail_delete and MOCK.fail_delete[c.name] then return false end
    end
    local gone = {}
    for _, c in ipairs(list) do gone[c] = true end
    local function purge(f)
      local keep = {}
      for _, c in ipairs(f.clips) do if not gone[c] then keep[#keep + 1] = c end end
      f.clips = keep
      for _, s in ipairs(f.subs) do purge(s) end
    end
    purge(root)
    return true
  end,
}
MOCK.pool = pool
local function media_id(c) return "MID-" .. tostring(c.name) end
song.GetMediaId = function(self) return media_id(self) end
other.GetMediaId = function(self) return media_id(self) end

-- Timeline as measured in Resolve Studio 21.1.2 (WhisperX Workbench, probe_subtitles.lua):
-- AppendToTimeline puts an SRT only on the active subtitle track; on an empty track the SRT times count
-- from the timeline start; AddTrack("subtitle") creates an inactive track.
local function timeline_item(clip, start, left, duration)
  local it = { clip = clip, start = start, left = left, duration = duration }
  function it:GetMediaPoolItem() return self.clip end
  function it:GetStart() return self.start end
  function it:GetLeftOffset() return self.left end
  function it:GetDuration() return self.duration end
  return it
end
MOCK.timeline_item = timeline_item
local function new_timeline(fps, start_frame)
  local tl = { fps = fps, start = start_frame, audio = { {} }, subs = {} }
  function tl:GetName() return "Timeline 1" end
  function tl:GetSetting(k) if k == "timelineFrameRate" then return tostring(self.fps) end end
  function tl:GetStartFrame() return self.start end
  function tl:GetTrackCount(kind) return kind == "audio" and #self.audio or #self.subs end
  function tl:GetItemListInTrack(kind, i)
    local list = kind == "audio" and self.audio[i] or (self.subs[i] and self.subs[i].items)
    local out = {} for k, v in ipairs(list or {}) do out[k] = v end return out
  end
  function tl:AddTrack(kind)
    if kind ~= "subtitle" or MOCK.fail_add_track then return false end
    self.subs[#self.subs + 1] = { name = "Subtitle " .. (#self.subs + 1), enabled = false, items = {} }
    return true
  end
  function tl:DeleteTrack(kind, i)
    if kind ~= "subtitle" or not self.subs[i] then return false end
    table.remove(self.subs, i) return true
  end
  function tl:SetTrackEnable(kind, i, on) if self.subs[i] then self.subs[i].enabled = on end return true end
  function tl:GetIsTrackEnabled(kind, i) return self.subs[i] and self.subs[i].enabled or false end
  function tl:GetTrackName(kind, i) return self.subs[i] and self.subs[i].name end
  function tl:SetTrackName(kind, i, name) self.subs[i].name = name return true end
  return tl
end
MOCK.new_timeline = new_timeline
pool.AppendToTimeline = function(_, items)
  local tl = MOCK.timeline
  local active
  for _, t in ipairs(tl.subs) do if t.enabled then active = t end end
  if not active then return {} end
  local out = {}
  for _, c in ipairs(items) do
    local text = c.text           -- read at import; Lua io.open fails on non-ASCII paths on Windows
    local base = tl.start
    for _, it in ipairs(active.items) do base = math.max(base, it.last) end
    for h, m, sec, ms in text:gmatch("(%d+):(%d+):(%d+),(%d+) %-%->") do
      local t = h * 3600 + m * 60 + sec + ms / 1000
      local st = base + math.floor(t * tl.fps + 0.5)
      local it = { GetStart = function() return st end, last = st }
      active.items[#active.items + 1] = it
      out[#out + 1] = it
    end
  end
  return out
end
local project = {
  GetMediaPool = function() return pool end,
  GetSetting = function(_, k) if k == "timelineFrameRate" then return "25" end end,
  GetCurrentTimeline = function() return MOCK.timeline end,
  SetCurrentTimeline = function(_, tl) MOCK.timeline = tl return true end,
}
resolve = { GetProjectManager = function() return { GetCurrentProject = function() return project end } end }
BEATTHIS_NO_RUN = true
"""


def sample_result(n_beats=8, interval=0.5):
    beats = []
    for i in range(n_beats):
        beats.append({
            "id": i + 1, "time": round(0.5 + i * interval, 3), "beatInBar": i % 4 + 1, "barIndex": i // 4 + 1,
            "isDownbeat": i % 4 == 0, "confidence": 0.9, "instantBpm": 120.0, "deltaMs": 500,
        })
    return {
        "metadata": {"fileName": "Müller Song.wav", "duration": 20.0},
        "beats": beats, "globalBpm": 120.0, "timeSignature": {"name": "4/4 (Standard)"},
    }


@unittest.skipIf(luajit21 is None, "lupa not installed")
class ResolveScriptTests(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        self.load_lang("en")

    def load_script(self, script):
        self.lua = luajit21.LuaRuntime(unpack_returned_tuples=True)
        self.out = []
        self.lua.globals().print = lambda *a: self.out.append(" ".join(str(x) for x in a))
        self.lua.globals().PY_READ = lambda p: Path(p).read_text(encoding="utf-8")
        self.lua.execute(MOCK)
        self.M = self.lua.execute(script)
        self.mock = self.lua.globals().MOCK

    def load_lang(self, code, home="tmp"):
        """The script as the installer writes it for this language (texts of all languages); BeatAnalyzer
        folder = the temporary folder of the test unless home is given."""
        home = self.tmp if home == "tmp" else home
        block = resolve_plugin.render_config(home, None, code, {c: i18n.texts(c) for c in i18n.LANGUAGES})
        self.load_script(resolve_plugin.apply_config(SCRIPT, block))

    def run_apply(self, json_overrides=None, colors=None):
        data = resolve_marker_data(sample_result())
        data.update(json_overrides or {})
        opts = self.lua.table_from({"colors": self.lua.table_from(colors)}) if colors else None
        ok, msg = self.M.apply(self.write_json(data), opts)
        self.assertTrue(ok, msg)
        return msg

    def srt_text(self, name="Müller Song.srt"):
        """Text of the SRT as Resolve imported it (the file itself is deleted after the import)."""
        return self.mock.texts[name]

    def srt_cues(self):
        return self.srt_text().strip().split("\n\n")

    def work_dirs(self):
        d = self.tmp / "resolve_temp"
        return [x for x in d.iterdir() if x.is_dir()] if d.exists() else []

    def intro_cue(self):
        return self.srt_cues()[0].split("\n")[2:]

    def first_beat_cue(self):
        return self.srt_cues()[1].split("\n")[2:]

    def write_json(self, data, name="Müller Song_resolve_markers.json"):
        path = self.tmp / name
        path.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
        return str(path)

    def markers(self, clip):
        return {int(f): dict(m) for f, m in clip.markers.items()}

    def test_markers_by_file_name_with_colors_and_frames(self):
        ok, msg = self.M.apply(self.write_json(resolve_marker_data(sample_result())))
        self.assertTrue(ok, msg)
        marks = self.markers(self.mock.song)
        self.assertEqual(sorted(marks), [13, 25, 38, 50, 63, 75, 88, 100])  # t * 25, .5 rounded up
        self.assertEqual(marks[13]["color"], "Red")
        self.assertEqual(marks[13]["name"], "Bar 1")
        self.assertEqual(marks[25]["color"], "Cyan")
        self.assertEqual(marks[25]["name"], "1.2")
        self.assertEqual(marks[25]["custom"], "beatthis")
        self.assertEqual(len(self.markers(self.mock.other)), 0)

    def test_selected_clip_wins_and_note_about_other_file(self):
        self.mock.selected = self.lua.table_from([self.mock.other])
        ok, msg = self.M.apply(self.write_json(resolve_marker_data(sample_result())))
        self.assertTrue(ok, msg)
        self.assertEqual(len(self.markers(self.mock.other)), 8)
        self.assertEqual(len(self.markers(self.mock.song)), 0)
        self.assertIn("is not 'Müller Song.wav'", msg)

    def test_selection_entries_that_are_not_clips_are_ignored(self):
        # Resolve Studio 21.2: GetSelectedClips() returned the clip plus an entry without clip methods
        not_a_clip = self.lua.eval("{}")
        self.mock.selected = self.lua.table_from([not_a_clip, self.mock.song, 42])
        ok, msg = self.M.apply(self.write_json(resolve_marker_data(sample_result())))
        self.assertTrue(ok, msg)
        self.assertEqual(len(self.markers(self.mock.song)), 8)
        self.assertIn("8 markers on 1 clip(s): Song", msg)
        self.assertNotIn("skipped", msg)
        self.assertNotIn("is not", msg)
        self.assertFalse([line for line in self.out if "API not available" in line], self.out)

    def bin_clips(self, name="BeatAnalyzer"):
        for f in self.mock.root.subs.values():
            if f.name == name:
                return [c.name for c in f.clips.values()]
        return None

    def test_subtitles_are_written_and_imported_with_song_name(self):
        ok, msg = self.M.apply(self.write_json(resolve_marker_data(sample_result(n_beats=5))))
        self.assertTrue(ok, msg)
        srt = self.srt_text()
        cues = srt.strip().split("\n\n")
        self.assertEqual(len(cues), 6)  # intro 0 s -> first beat, then one per beat
        self.assertEqual(cues[0].split("\n")[:2], ["1", "00:00:00,000 --> 00:00:00,500"])
        self.assertEqual(cues[1].split("\n"), ["2", "00:00:00,500 --> 00:00:01,000", "Downbeat (1)",
                                               "Bar 1 – Beat 1", "00:00.500 – 120.0 BPM", "Confidence 90%"])
        self.assertEqual(cues[2].split("\n")[2:4], ["Beat 2", "Bar 1 – Beat 2"])
        self.assertEqual(cues[5].split("\n")[1], "00:00:02,500 --> 00:00:03,000")  # last: + previous interval
        self.assertEqual(self.bin_clips(), ["Müller Song.srt"])
        self.assertIn("Subtitles: Müller Song.srt in media pool bin 'BeatAnalyzer'", msg)
        self.assertFalse((self.tmp / "Müller Song.srt").exists())      # no longer next to the JSON
        self.assertEqual(self.work_dirs(), [])                          # working folder removed
        self.assertTrue(self.lua.eval("MOCK.pool:GetCurrentFolder() == MOCK.root"))

    def test_english_intro(self):
        self.run_apply()
        self.assertEqual(self.intro_cue(), ["BeatAnalyzer", "Müller Song.wav", "120.0 BPM – 4/4"])

    def test_german_output(self):
        self.load_lang("de")
        self.run_apply()
        marks = self.markers(self.mock.song)
        self.assertEqual(marks[13]["name"], "Takt 1")
        self.assertEqual(marks[13]["note"], "0,500 s | 120,0 BPM")
        self.assertEqual(marks[25]["name"], "1.2")
        self.assertEqual(self.first_beat_cue(), ["Downbeat (1)", "Takt 1 – Beat 1", "00:00.500 – 120,0 BPM",
                                                 "Confidence 90 %"])

    def test_turkish_output_with_old_json(self):
        self.load_lang("tr")
        self.run_apply(json_overrides={"timeSignature": "4/4 (Standard)"})   # format of 0.0.5
        self.assertEqual(self.markers(self.mock.song)[13]["name"], "Ölçü 1")
        self.assertEqual(self.intro_cue(), ["BeatAnalyzer", "Müller Song.wav", "120,0 BPM – 4/4'lük"])
        self.assertEqual(self.first_beat_cue()[3], "Confidence %90")

    def test_german_messages(self):
        self.load_lang("de")
        msg = self.run_apply()
        self.assertTrue(msg.startswith("8 Marker auf 1 Clip(s): Song"), msg)
        self.mock.selected = self.lua.table_from([self.mock.other])
        ok, msg = self.M.apply(self.write_json(resolve_marker_data(sample_result())))
        self.assertIn("Hinweis: Der ausgewählte Clip ist nicht „Müller Song.wav“ aus der JSON.", msg)
        data = resolve_marker_data(sample_result())
        del data["format"]
        ok, msg = self.M.apply(self.write_json(data))
        self.assertFalse(ok)
        self.assertTrue(msg.startswith("Unbekanntes Format"), msg)

    def test_meter_suffixes(self):
        self.load_lang("tr")
        for text, expected in [("6/8", "6/8'lik"), ("9/16", "9/16'lık"), ("2/2", "2/2'lik"), ("3/4", "3/4'lük"),
                               ("5/32", "5/32"), ("abc", "abc")]:
            self.assertEqual(self.M.fmt_meter(text), expected)

    def test_failed_import_keeps_the_file(self):
        self.mock.fail_import = True
        ok, msg = self.M.apply(self.write_json(resolve_marker_data(sample_result())))
        self.assertIn("by hand", msg)
        kept = list(self.tmp.glob("resolve_temp/*/Müller Song.srt"))
        self.assertEqual(len(kept), 1)
        self.assertIn(str(kept[0]), msg)

    def test_colors_per_beat(self):
        self.run_apply(colors={"downbeat": "Green", "beat2": "Yellow", "beat3": "none", "beat4": "Pink", "other": "Cyan"})
        marks = self.markers(self.mock.song)
        self.assertEqual([marks[f]["color"] for f in sorted(marks)], ["Green", "Yellow", "Pink", "Green", "Yellow", "Pink"])
        self.assertEqual(len(self.srt_cues()), 9)          # subtitles keep all 8 beats (+ intro)

    def test_meters_with_more_than_four_beats(self):
        m = lambda typ, beat: self.lua.table_from({"type": typ, "beat": beat})
        tc = self.lua.table_from({"downbeat": "Red", "beat2": "Blue", "beat3": "Green", "beat4": "Yellow", "other": "Sand"})
        self.assertEqual([self.M.marker_color(m("beat", b), tc) for b in (2, 3, 4, 5, 6, 7)],
                         ["Blue", "Green", "Yellow", "Sand", "Sand", "Sand"])
        self.assertEqual(self.M.marker_color(m("downbeat", 1), tc), "Red")

    def test_unknown_color_falls_back_to_default(self):
        tc = self.lua.table_from({"downbeat": "Purpur", "beat2": "Cyan", "beat3": "Cyan", "beat4": "Cyan", "other": "Cyan"})
        self.assertEqual(self.M.marker_color(self.lua.table_from({"type": "downbeat", "beat": 1}), tc), "Red")
        self.assertEqual(self.M.marker_color(self.lua.table_from({"type": "beat", "beat": 2}), None), "Cyan")

    def test_only_downbeats_by_colors(self):
        msg = self.run_apply(colors={"downbeat": "Red", "beat2": "none", "beat3": "none", "beat4": "none", "other": "none"})
        self.assertEqual(sorted(self.markers(self.mock.song)), [13, 63])
        self.assertNotIn("skipped", msg)

    def test_color_list(self):
        self.assertEqual(list(self.M.MARKER_COLORS.values()),
                         ["Blue", "Cyan", "Green", "Yellow", "Red", "Pink", "Purple", "Fuchsia", "Rose", "Lavender",
                          "Sky", "Mint", "Lemon", "Sand", "Cocoa", "Cream"])
        self.assertEqual(self.M.NO_MARKER, "none")

    def run_job(self, job):
        steps = 0
        while not job.step():
            steps += 1
            self.assertLess(steps, 1000)
        return steps

    def test_job_runs_in_chunks(self):
        data = resolve_marker_data(sample_result(n_beats=50, interval=0.2))   # 10 s, fits the 20 s clip
        job, err = self.M.start(self.write_json(data), None)
        self.assertIsNotNone(job, err)
        self.assertEqual((job.phase, job.total, job.marked), ("markers", 50, 0))
        self.assertFalse(job.step())
        self.assertEqual(job.marked, 20)
        self.assertFalse(job.step())
        self.assertEqual(job.marked, 40)
        self.run_job(job)
        self.assertEqual(job.phase, "done")
        self.assertTrue(job.ok)
        self.assertTrue(job.msg.startswith("50 markers on 1 clip(s): Song"), job.msg)
        self.assertEqual(len(self.markers(self.mock.song)), 50)
        self.assertEqual(job.srt_name, "Müller Song.srt")

    def test_job_total_leaves_out_no_marker(self):
        colors = self.lua.table_from({"downbeat": "Red", "beat2": "none", "beat3": "none", "beat4": "none", "other": "none"})
        job, _ = self.M.start(self.write_json(resolve_marker_data(sample_result())), self.lua.table_from({"colors": colors}))
        self.assertEqual(job.total, 2)

    def test_start_error(self):
        data = resolve_marker_data(sample_result())
        data["fileName"] = "fehlt.wav"
        job, err = self.M.start(self.write_json(data), None)
        self.assertIsNone(job)
        self.assertIn("fehlt.wav", err)

    def test_timeline_is_fixed_at_start(self):
        tl = self.setup_timeline()
        job, _ = self.M.start(self.write_json(resolve_marker_data(sample_result())), None)
        self.assertEqual((job.timeline_name, job.track_name), ("Timeline 1", "BeatAnalyzer - Müller Song"))
        self.lua.execute("MOCK.timeline = MOCK.new_timeline(25, 0)")   # the user opens another timeline
        self.run_job(job)
        self.assertEqual(len(self.sub_tracks(tl)), 1)                  # track in the timeline of the start

    def test_no_timeline_when_switched_off(self):
        tl = self.setup_timeline()
        ok, msg = self.M.apply(self.write_json(resolve_marker_data(sample_result())), self.lua.table_from({"timeline": False}))
        self.assertTrue(ok, msg)
        self.assertEqual(self.sub_tracks(tl), [])
        self.assertNotIn("Timeline:", msg)

    def test_prepare_finds_clip_and_length(self):
        self.load_lang("de")
        info = self.M.prepare(self.write_json(resolve_marker_data(sample_result())))
        self.assertTrue(info.ok, info.error)
        self.assertEqual(info.clip_text, "Song im Media Pool · 0:20")      # mock: 500 frames at 25 fps
        self.assertEqual(list(info.warnings.values()), [])
        self.assertEqual((info.file_name, info.song), ("Müller Song.wav", "Müller Song"))
        self.assertIsNone(info.engine)

    def test_prepare_warns_about_length(self):
        self.load_lang("de")
        data = resolve_marker_data(sample_result())
        data["duration"] = 19.4                                            # 0.6 s difference
        info = self.M.prepare(self.write_json(data))
        self.assertTrue(info.ok)
        self.assertEqual(list(info.warnings.values()),
                         ["Die Laufzeit des Clips (0:20) weicht von der analysierten Datei (0:19) ab."])
        data["duration"] = 19.6                                            # 0.4 s: no warning
        self.assertEqual(list(self.M.prepare(self.write_json(data)).warnings.values()), [])

    def test_prepare_warns_about_other_file(self):
        self.load_lang("de")
        self.mock.selected = self.lua.table_from([self.mock.other])
        info = self.M.prepare(self.write_json(resolve_marker_data(sample_result())))
        self.assertTrue(info.ok)
        self.assertIn("Der ausgewählte Clip ist nicht „Müller Song.wav“ aus der JSON.", list(info.warnings.values()))

    def test_prepare_without_clip_blocks(self):
        data = resolve_marker_data(sample_result())
        data["fileName"] = "fehlt.wav"
        info = self.M.prepare(self.write_json(data))
        self.assertFalse(info.ok)
        self.assertIn("fehlt.wav", info.error)

    def test_prepare_bad_json_blocks(self):
        path = self.tmp / "kaputt.json"
        path.write_text("{kaputt", encoding="utf-8")
        info = self.M.prepare(str(path))
        self.assertFalse(info.ok)
        self.assertTrue(info.error)

    def test_explanations(self):
        self.load_lang("de")
        tl = self.setup_timeline()
        clips = self.lua.table_from([self.mock.song])
        ti = self.M.timeline_info(tl, clips)
        self.assertEqual((ti.state, ti.track, ti.tc), ("present", 1, "01:00:10:00"))
        self.assertTrue(self.M.explanation(True, ti, "Müller Song").startswith(
            "In der Timeline „Timeline 1“ liegt der Song auf A1 ab 01:00:10:00. Darunter entsteht der Subtitle Track "
            "„BeatAnalyzer - Müller Song“"))
        self.assertTrue(self.M.explanation(False, ti, "Müller Song").startswith("Die Timeline bleibt unverändert."))
        self.assertEqual(self.M.timeline_info(None, clips).state, "none")
        self.assertTrue(self.M.explanation(True, self.M.timeline_info(None, clips), "x").startswith("Keine Timeline offen."))
        self.lua.execute("MOCK.timeline = MOCK.new_timeline(25, 0)")
        absent = self.M.timeline_info(self.lua.globals().MOCK.timeline, clips)
        self.assertEqual(absent.state, "absent")
        self.assertTrue(self.M.explanation(True, absent, "x").startswith("Der Song liegt nicht in der Timeline „Timeline 1“."))

    def test_engine_text(self):
        t = lambda d: self.M.engine_text(self.lua.table_from(d))
        self.assertEqual(t({"id": "beat_this", "device": "cuda", "gpu": "RTX 3080"}), "beat_this (CUDA, RTX 3080)")
        self.assertEqual(t({"id": "beat_this", "device": "cpu"}), "beat_this (CPU)")
        self.load_lang("de")
        t = lambda d: self.M.engine_text(self.lua.table_from(d))
        self.assertEqual(t({"id": "librosa", "fallbackReason": "not_installed"}), "librosa – beat_this nicht installiert")
        self.assertIsNone(self.M.engine_text(None))

    def test_prepare_shows_engine(self):
        self.load_lang("de")
        data = resolve_marker_data(sample_result())
        data["engine"] = {"id": "beat_this", "device": "cpu", "gpu": None, "fallbackReason": None}
        self.assertEqual(self.M.prepare(self.write_json(data)).engine, "Analysiert mit beat_this (CPU)")

    def test_length_and_timecode(self):
        self.assertEqual(self.M.fmt_length(222.4), "3:42")
        self.assertEqual(self.M.fmt_length(59.6), "1:00")
        self.assertEqual(self.M.timecode(90250, 25), "01:00:10:00")
        self.assertEqual(self.M.timecode(86413, 23.976), "01:00:00:13")

    def test_removal_counts_then_removes(self):
        tl = self.setup_timeline()
        self.run_apply()
        self.mock.song.markers[400] = self.lua.table_from({"color": "Blue", "name": "Hand", "custom": ""})
        clips = self.lua.table_from([self.mock.song])
        r = self.M.removal(clips, tl)
        self.assertEqual((r.markers, r.tracks, r.srt_clips, r.song), (8, 1, 1, "Müller Song"))
        self.assertEqual(len(self.markers(self.mock.song)), 9)        # nothing removed yet
        done = self.M.remove(clips, tl)
        self.assertEqual((done.markers, done.tracks, done.srt_clips), (8, 1, 1))
        self.assertEqual(sorted(self.markers(self.mock.song)), [400])  # the hand marker stays
        self.assertEqual(self.sub_tracks(tl), [])
        self.assertEqual(self.bin_clips(), [])
        self.assertTrue(done.text.startswith("Removed: 8 markers, 1 Subtitle Track(s), 1 Subtitle clip(s)."))

    def test_removal_with_nothing_there(self):
        self.load_lang("de")
        r = self.M.removal(self.lua.table_from([self.mock.song]), None)
        self.assertEqual((r.markers, r.tracks, r.srt_clips), (0, 0, 0))
        self.assertEqual(r.text, "Nichts von BeatAnalyzer an „Müller Song“ gefunden.")
        self.assertIsNone(self.bin_clips())                           # counting does not create the folder

    def test_removal_text_asks(self):
        self.load_lang("de")
        self.run_apply()
        r = self.M.removal(self.lua.table_from([self.mock.song]), None)
        self.assertTrue(r.text.startswith("Aus „Müller Song“ entfernen: 8 BeatAnalyzer-Marker, 0 Subtitle Track(s)"))

    def test_settings_round_trip(self):
        s = self.M.load_settings()
        self.assertEqual((s.timeline, s.colors_open, s.colors.downbeat, s.json_dir), (True, False, "Red", ""))
        self.assertIsNone(s.geometry)
        s.json_dir = str(self.tmp / "Ördner")
        s.timeline = False
        s.colors.beat3 = "none"
        s.geometry = self.lua.table_from([10, 20, 600, 500])
        self.assertTrue(self.M.save_settings(s))
        s2 = self.M.load_settings()
        self.assertEqual((s2.json_dir, s2.timeline, s2.colors.beat3, s2.colors.beat2), (str(self.tmp / "Ördner"), False, "none", "Cyan"))
        self.assertEqual(list(s2.geometry.values()), [10, 20, 600, 500])
        self.assertEqual(self.M.settings_path(), str(self.tmp / "resolve_temp" / "plugin.txt"))

    def test_broken_settings_give_defaults(self):
        (self.tmp / "resolve_temp").mkdir()
        (self.tmp / "resolve_temp" / "plugin.txt").write_text(
            "kaputt\ncolor_downbeat=Purpur\ntimeline=vielleicht\ngeometry=1,2\n", encoding="utf-8")
        s = self.M.load_settings()
        self.assertEqual((s.colors.downbeat, s.timeline), ("Red", True))
        self.assertIsNone(s.geometry)

    def test_no_settings_without_home(self):
        self.load_lang("en", home=None)
        self.assertIsNone(self.M.settings_path())
        self.assertFalse(self.M.save_settings(self.M.load_settings()))

    def lua_function_source(self, name):
        start = SCRIPT.index("local function " + name + "(")
        return SCRIPT[start:SCRIPT.index("\nend\n", start)]

    def test_windows_file_functions_use_the_wide_api(self):
        # Windows cannot be run here: pin that the Unicode-safe CRT calls are used and no file stays open
        remove = self.lua_function_source("remove_file")
        self.assertIn("_wremove", remove)
        self.assertNotIn("wide_open(", remove)
        self.assertIn("_wrmdir", self.lua_function_source("remove_dir"))
        self.assertIn("_wmkdir", self.lua_function_source("make_dir"))

    def test_working_folder_that_cannot_be_created(self):
        blocker = self.tmp / "kein Ordner"
        blocker.write_text("x", encoding="utf-8")            # BA.home is a file: no folder below it
        self.load_lang("en", home=blocker)
        msg = self.run_apply()
        self.assertIn("working folder", msg)
        self.assertIn(str(blocker), msg)
        self.assertNotIn("cannot write " + "/Müller", msg)

    def test_vehicle_clip_removed_when_track_cannot_be_added(self):
        self.setup_timeline()
        self.mock.fail_add_track = True
        msg = self.run_apply()
        self.assertIn("cannot add a subtitle track", msg)
        self.assertEqual(self.bin_clips(), ["Müller Song.srt"])

    def test_hint_when_vehicle_clip_cannot_be_deleted(self):
        self.setup_timeline()
        self.mock.fail_delete = self.lua.table_from({"Müller Song (Timeline).srt": True})
        msg = self.run_apply()
        self.assertIn("Müller Song (Timeline).srt", msg)
        self.assertIn("by hand", msg)

    def test_length_warning_never_shows_the_same_value_twice(self):
        data = resolve_marker_data(sample_result())
        data["duration"] = 19.5                                  # clip 20.0 s: both round to 0:20
        info = self.M.prepare(self.write_json(data))
        self.assertEqual(list(info.warnings.values()),
                         ["The clip's duration (0:20.0) differs from the analysed file (0:19.5)."])

    def test_second_run_replaces_subtitle_clip(self):
        path = self.write_json(resolve_marker_data(sample_result()))
        self.M.apply(path)
        self.M.apply(path)
        self.assertEqual(self.bin_clips(), ["Müller Song.srt"])
        self.assertEqual(len(self.mock.imported), 2)

    def test_missing_confidence_shows_dash(self):
        data = resolve_marker_data(sample_result(n_beats=1))
        del data["markers"][0]["confidence"]
        self.M.apply(self.write_json(data))
        srt = self.srt_text()
        self.assertIn("00:00.500 – 120.0 BPM\nConfidence –\n", srt)

    # Timeline at 25 fps starting at 01:00:00:00 (frame 90000). The song lies at 10 s, 1 s trimmed at the
    # front, 3 s long: song seconds 1.0-4.0 are visible, song second 0 is at timeline second 9.
    def setup_timeline(self, extra_items=()):
        self.lua.execute("MOCK.timeline = MOCK.new_timeline(25, 90000)")
        tl = self.lua.globals().MOCK.timeline
        item = self.lua.globals().MOCK.timeline_item(self.mock.song, 90000 + 250, 25, 75)
        tl.audio[1][1] = item
        for track, start in extra_items:
            if track not in tl.audio:
                tl.audio[track] = self.lua.table()
            other = self.lua.globals().MOCK.timeline_item(self.mock.song, start, 0, 500)
            tl.audio[track][len(tl.audio[track]) + 1] = other
        return tl

    def sub_tracks(self, tl):
        return [(t.name, t.enabled, [it.GetStart() for it in t["items"].values()]) for t in tl.subs.values()]

    def test_timeline_subtitles_under_the_song(self):
        tl = self.setup_timeline()
        ok, msg = self.M.apply(self.write_json(resolve_marker_data(sample_result())))
        self.assertTrue(ok, msg)
        tracks = self.sub_tracks(tl)
        self.assertEqual(len(tracks), 1)
        name, enabled, starts = tracks[0]
        self.assertEqual((name, enabled), ("BeatAnalyzer - Müller Song", True))
        # beats 1.0, 1.5 ... 3.5 s of the song -> timeline 10.0 ... 12.5 s
        self.assertEqual(starts, [90250, 90263, 90275, 90288, 90300, 90313])  # .5 frames rounded up
        self.assertIn("Timeline: 6 subtitles on track ST1 'BeatAnalyzer - Müller Song'", msg)
        self.assertNotIn("difference", msg)
        srt = self.srt_text("Müller Song (Timeline).srt")
        self.assertTrue(srt.startswith("1\n00:00:10,000 --> 00:00:10,500\nBeat 2\nBar 1 – Beat 2"), srt[:80])
        self.assertIn("00:00:12,500 --> 00:00:13,000", srt)  # last subtitle ends at the clip end
        self.assertIn("00:01.000 – 120.0 BPM", srt)          # line 3 keeps the song time
        self.assertEqual(sorted(self.bin_clips()), ["Müller Song.srt"])   # the timeline SRT is only on the track
        self.assertEqual(self.work_dirs(), [])

    def test_timeline_second_run_replaces_track_and_keeps_other_tracks(self):
        tl = self.setup_timeline()
        self.lua.execute("""
            local tl = MOCK.timeline
            tl:AddTrack("subtitle")
            tl.subs[1].name = "Dialog"
            tl.subs[1].enabled = true
            tl.subs[1].items[1] = { GetStart = function() return 90010 end, last = 90020 }
        """)
        path = self.write_json(resolve_marker_data(sample_result()))
        self.M.apply(path)
        ok, msg = self.M.apply(path)
        self.assertTrue(ok, msg)
        tracks = self.sub_tracks(tl)
        self.assertEqual([(n, e, len(s)) for n, e, s in tracks],
                         [("Dialog", False, 1), ("BeatAnalyzer - Müller Song", True, 6)])
        self.assertIn("(old track replaced)", msg)

    def test_timeline_uses_first_use_of_the_song(self):
        tl = self.setup_timeline(extra_items=[(2, 90000 + 50)])  # earlier use on A2 at 2 s, nothing trimmed
        ok, msg = self.M.apply(self.write_json(resolve_marker_data(sample_result())))
        starts = self.sub_tracks(tl)[0][2]
        self.assertEqual(len(starts), 8)
        self.assertEqual(starts[0], 90000 + 50 + 13)  # 0.5 s x 25 fps = 12.5, rounded up

    def test_no_timeline_track_when_song_is_not_in_timeline(self):
        self.lua.execute("MOCK.timeline = MOCK.new_timeline(25, 90000)")
        ok, msg = self.M.apply(self.write_json(resolve_marker_data(sample_result())))
        self.assertTrue(ok, msg)
        self.assertNotIn("Timeline:", msg)
        self.assertEqual(self.sub_tracks(self.lua.globals().MOCK.timeline), [])

    def test_second_run_replaces_own_markers_and_keeps_manual_ones(self):
        self.mock.song.AddMarker(self.mock.song, 300, "Green", "manual", "", 1, "")
        path = self.write_json(resolve_marker_data(sample_result()))
        self.M.apply(path)
        ok, msg = self.M.apply(path)
        self.assertTrue(ok, msg)
        marks = self.markers(self.mock.song)
        self.assertEqual(len(marks), 9)
        self.assertEqual(marks[300]["color"], "Green")

    def test_markers_after_clip_end_are_skipped(self):
        ok, msg = self.M.apply(self.write_json(resolve_marker_data(sample_result(n_beats=50))))
        self.assertTrue(ok, msg)
        self.assertEqual(len(self.markers(self.mock.song)), 39)  # 0.5 ... 19.5 s; 20.0 s = frame 500 = clip end
        self.assertIn("11 markers skipped", msg)

    def test_only_downbeats(self):
        self.M.apply(self.write_json(resolve_marker_data(sample_result(), only_downbeats=True)))
        marks = self.markers(self.mock.song)
        self.assertEqual(sorted(marks), [13, 63])
        self.assertTrue(all(m["color"] == "Red" for m in marks.values()))

    def test_ntsc_frame_rate(self):
        self.mock.song.fps = "29.97"
        self.M.apply(self.write_json(resolve_marker_data(sample_result(n_beats=1))))
        self.assertEqual(sorted(self.markers(self.mock.song)), [15])  # 0.5 * 30000/1001 = 14.985

    def test_no_clip_found(self):
        data = resolve_marker_data(sample_result())
        data["fileName"] = "missing.wav"
        ok, msg = self.M.apply(self.write_json(data))
        self.assertFalse(ok)
        self.assertIn("No clip found", msg)

    def test_wrong_format(self):
        ok, msg = self.M.apply(self.write_json({"beats": [1, 2]}))
        self.assertFalse(ok)
        self.assertIn("Unknown format", msg)

    def test_json_decoder(self):
        decode = self.M.json_decode
        v = decode('{"a": [1, -2.5e2, true, false, null], "s": "x\\"\\u00fc\\n", "e": {}}')
        self.assertEqual(v["a"][1], 1)
        self.assertEqual(v["a"][2], -250)
        self.assertEqual(v["s"], 'x"ü\n')
        with self.assertRaises(Exception):
            decode('{"a": 1,}')


if __name__ == "__main__":
    unittest.main()


@unittest.skipIf(luajit21 is None, "lupa not installed")
class ProbeScriptTests(unittest.TestCase):
    def test_probe_timeline_runs_and_cleans_up(self):
        lua = luajit21.LuaRuntime(unpack_returned_tuples=True)
        out = []
        lua.globals().print = lambda *a: out.append(" ".join(str(x) for x in a))
        lua.globals().PY_READ = lambda p: Path(p).read_text(encoding="utf-8")
        lua.execute(MOCK)
        tmp = tempfile.mkdtemp()
        lua.globals().PROBE_TMP = tmp
        lua.execute("""
            MOCK.timeline = MOCK.new_timeline(25, 90000)
            local tl = MOCK.timeline
            function tl:GetStartTimecode() return "01:00:00:00" end
            local it = MOCK.timeline_item(MOCK.song, 90250, 25, 75)
            function it:GetEnd() return self.start + self.duration end
            function it:GetRightOffset() return 0 end
            function it:GetName() return "Song" end
            tl.audio[1][1] = it
            MOCK.selected = { MOCK.song }
            local project = resolve:GetProjectManager():GetCurrentProject()
            resolve.GetProjectManager = function()
              return { GetCurrentProject = function() return project end, SaveProject = function() return true end }
            end
            resolve.GetVersionString = function() return "mock" end
            Resolve = function() return resolve end
            os.getenv = function() return PROBE_TMP end
        """)
        lua.execute((ROOT / "resolve" / "tools" / "probe_timeline.lua").read_text(encoding="utf-8"))
        text = "\n".join(out)
        self.assertIn("[probe] RESULT: OK", text)
        self.assertIn("Test track and test clip removed", text)
        self.assertEqual(len(list(lua.globals().MOCK.timeline.subs.values())), 0)


@unittest.skipIf(luajit21 is None, "lupa not installed")
class RenameTransitionTests(unittest.TestCase):
    def setUp(self):
        self.lua = luajit21.LuaRuntime(unpack_returned_tuples=True)
        self.out = []
        self.lua.globals().print = lambda *a: self.out.append(" ".join(str(x) for x in a))
        self.lua.globals().PY_READ = lambda p: Path(p).read_text(encoding="utf-8")
        self.lua.execute(MOCK)
        self.tmp = Path(tempfile.mkdtemp())

    def test_old_track_name_is_replaced(self):
        M = self.lua.execute(SCRIPT)
        self.lua.execute("""
            MOCK.timeline = MOCK.new_timeline(25, 90000)
            MOCK.timeline.audio[1][1] = MOCK.timeline_item(MOCK.song, 90000, 0, 500)
            MOCK.timeline:AddTrack("subtitle")
            MOCK.timeline.subs[1].name = "BeatThis - Müller Song"
            MOCK.timeline.subs[1].items[1] = { GetStart = function() return 90010 end, last = 90010 }
        """)
        path = self.tmp / "Müller Song_resolve_markers.json"
        path.write_text(json.dumps(resolve_marker_data(sample_result()), ensure_ascii=False), encoding="utf-8")
        ok, msg = M.apply(str(path))
        self.assertTrue(ok, msg)
        names = [t.name for t in self.lua.globals().MOCK.timeline.subs.values()]
        self.assertEqual(names, ["BeatAnalyzer - Müller Song"])
        self.assertIn("(old track replaced)", msg)

    def test_transition_script_starts_the_new_script(self):
        # Both files in one folder, as in Resolve's Scripts/Utility; dofile gives the stub its own path
        for name in ("BeatAnalyzer_Markers.lua", "BeatThis_Markers.lua"):
            (self.tmp / name).write_text((ROOT / "resolve" / name).read_text(encoding="utf-8"), encoding="utf-8")
        self.lua.execute("BEATTHIS_NO_RUN = nil")
        self.lua.globals().STUB = str(self.tmp / "BeatThis_Markers.lua")
        self.lua.execute("dofile(STUB)")
        text = "\n".join(self.out)
        version = (ROOT / "VERSION").read_text(encoding="utf-8").strip()
        self.assertIn(f"[BeatAnalyzer] BeatAnalyzer_Markers {version}", text)
        self.assertIn("No window available.", text)     # main() ran; no window without Resolve
        self.assertNotIn("Not found or not started", text)
