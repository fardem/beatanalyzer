"""
Tests for resolve/BeatThis_Markers.lua against a small fake of the DaVinci Resolve API.
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

SCRIPT = (ROOT / "resolve" / "BeatThis_Markers.lua").read_text(encoding="utf-8")

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
MOCK = { clip = clip, selected = {}, imported = {} }
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
      local c = clip(name, name, "25", "500")
      c.path = p
      current.clips[#current.clips + 1] = c
      MOCK.imported[#MOCK.imported + 1] = p
      out[#out + 1] = c
    end
    return out
  end,
  DeleteClips = function(_, list)
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
    if kind ~= "subtitle" then return false end
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
    local text = PY_READ(c.path)  -- Resolve reads the file itself; Lua io.open fails on non-ASCII paths on Windows
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
        self.lua = luajit21.LuaRuntime(unpack_returned_tuples=True)
        self.out = []
        self.lua.globals().print = lambda *a: self.out.append(" ".join(str(x) for x in a))
        self.lua.globals().PY_READ = lambda p: Path(p).read_text(encoding="utf-8")
        self.lua.execute(MOCK)
        self.M = self.lua.execute(SCRIPT)
        self.mock = self.lua.globals().MOCK
        self.tmp = Path(tempfile.mkdtemp())

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

    def bin_clips(self, name="BeatThis"):
        for f in self.mock.root.subs.values():
            if f.name == name:
                return [c.name for c in f.clips.values()]
        return None

    def test_subtitles_are_written_and_imported_with_song_name(self):
        ok, msg = self.M.apply(self.write_json(resolve_marker_data(sample_result(n_beats=5))))
        self.assertTrue(ok, msg)
        srt = (self.tmp / "Müller Song.srt").read_text(encoding="utf-8")
        cues = srt.strip().split("\n\n")
        self.assertEqual(len(cues), 6)  # intro 0 s -> first beat, then one per beat
        self.assertEqual(cues[0].split("\n")[:2], ["1", "00:00:00,000 --> 00:00:00,500"])
        self.assertEqual(cues[1].split("\n"), ["2", "00:00:00,500 --> 00:00:01,000", "Downbeat (1)",
                                               "Takt 1 - Beat 1", "00:00.500 - 120.0 BPM - 90%"])
        self.assertEqual(cues[2].split("\n")[2:4], ["Beat 2", "Takt 1 - Beat 2"])
        self.assertEqual(cues[5].split("\n")[1], "00:00:02,500 --> 00:00:03,000")  # last: + previous interval
        self.assertEqual(self.bin_clips(), ["Müller Song.srt"])
        self.assertIn("Subtitles: Müller Song.srt in media pool bin 'BeatThis'", msg)
        self.assertTrue(self.lua.eval("MOCK.pool:GetCurrentFolder() == MOCK.root"))

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
        srt = (self.tmp / "Müller Song.srt").read_text(encoding="utf-8")
        self.assertIn("00:00.500 - 120.0 BPM - -", srt)

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
        self.assertEqual((name, enabled), ("BeatThis - Müller Song", True))
        # beats 1.0, 1.5 ... 3.5 s of the song -> timeline 10.0 ... 12.5 s
        self.assertEqual(starts, [90250, 90263, 90275, 90288, 90300, 90313])  # .5 frames rounded up
        self.assertIn("Timeline: 6 subtitles on track ST1 'BeatThis - Müller Song'", msg)
        self.assertNotIn("difference", msg)
        srt = (self.tmp / "Müller Song (Timeline).srt").read_text(encoding="utf-8")
        self.assertTrue(srt.startswith("1\n00:00:10,000 --> 00:00:10,500\nBeat 2\nTakt 1 - Beat 2"), srt[:80])
        self.assertIn("00:00:12,500 --> 00:00:13,000", srt)  # last subtitle ends at the clip end
        self.assertIn("00:01.000 - 120.0 BPM", srt)          # line 3 keeps the song time
        self.assertEqual(sorted(self.bin_clips()), ["Müller Song (Timeline).srt", "Müller Song.srt"])

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
                         [("Dialog", False, 1), ("BeatThis - Müller Song", True, 6)])
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
