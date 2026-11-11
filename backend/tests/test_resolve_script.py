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
MOCK = { clip = clip, selected = {} }
local song = clip("Song", "Müller Song.wav", "25", "500")
local other = clip("Other", "other.wav", "25", "500")
MOCK.song, MOCK.other = song, other
local sub = { GetClipList = function() return { song } end, GetSubFolderList = function() return {} end }
local root = { GetClipList = function() return { other } end, GetSubFolderList = function() return { sub } end }
local pool = {
  GetRootFolder = function() return root end,
  GetSelectedClips = function() return MOCK.selected end,
}
local project = {
  GetMediaPool = function() return pool end,
  GetSetting = function(_, k) if k == "timelineFrameRate" then return "25" end end,
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
