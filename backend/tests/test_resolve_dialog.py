"""
Tests for the window of resolve/BeatAnalyzer_Markers.lua against a fake of Fusion's UIManager
(pattern: tests/resolve_mock.lua of the WhisperX Subtitle Workbench). disp:RunLoop() runs a Python scenario.
Needs "lupa"; they do not replace a test in Resolve.
"""

import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import test_resolve_script as trs  # noqa: E402
import i18n  # noqa: E402
import resolve_plugin  # noqa: E402
from analyzer import resolve_marker_data  # noqa: E402

try:
    from lupa import luajit21
except ImportError:  # pragma: no cover
    luajit21 = None

UI_MOCK = r"""
local function auto_table()
  return setmetatable({}, { __index = function(t, k) local v = {} rawset(t, k, v) return v end })
end
local UI = {}
local function widget(kind)
  return function(self, spec)
    spec = spec or {}
    spec.kind = kind
    if kind == "ComboBox" then
      spec.entries, spec.CurrentIndex = {}, 0
      function spec:AddItem(text) self.entries[#self.entries + 1] = text end
    end
    return spec
  end
end
for _, kind in ipairs({ "VGroup", "HGroup", "Label", "Button", "LineEdit", "ComboBox", "CheckBox", "Slider" }) do
  UI[kind] = widget(kind)
end
function UI:VGap() return { kind = "Gap" } end
function UI:HGap() return { kind = "Gap" } end
function UI:Timer(spec)
  local t = { ID = spec.ID, Interval = spec.Interval, running = false }
  function t:Start() self.running = true end
  function t:Stop() self.running = false end
  UIMOCK.timer = t
  return t
end
local function collect(spec, items)
  if type(spec) ~= "table" then return end
  if spec.ID and spec.kind then items[spec.ID] = spec end
  for _, child in ipairs(spec) do collect(child, items) end
end
local disp = { On = auto_table() }
function disp:AddWindow(spec, root)
  local items = {}
  collect(root, items)
  for _, child in ipairs(spec) do collect(child, items) end
  items[spec.ID] = { Geometry = spec.Geometry }
  local win = { On = auto_table(), spec = spec, shown = false }
  function win:GetItems() return items end
  function win:Show() self.shown = true end
  function win:Hide() self.shown = false end
  function win:RecalcLayout() end
  UIMOCK.win, UIMOCK.items = win, items
  return win
end
function disp:RunLoop() UIMOCK.loop = true PY_SCENARIO() UIMOCK.loop = false end
function disp:ExitLoop() UIMOCK.exited = true end
UIMOCK = { exited = false }
function UIMOCK.click(id)
  local h = UIMOCK.win.On[id] and rawget(UIMOCK.win.On[id], "Clicked")
  assert(h, "no handler for " .. id)
  h({ who = id })
end
function UIMOCK.check(id, on)
  UIMOCK.items[id].Checked = on
  local h = rawget(UIMOCK.win.On[id], "Clicked")
  if h then h({ who = id }) end
end
function UIMOCK.choose(id, index)
  UIMOCK.items[id].CurrentIndex = index
  local h = rawget(UIMOCK.win.On[id], "CurrentIndexChanged")
  if h then h({ who = id }) end
end
function UIMOCK.slide(id, value)
  UIMOCK.items[id].Value = value
  local h = rawget(UIMOCK.win.On[id], "ValueChanged")
  if h then h({ who = id }) end
end
function UIMOCK.tick()
  local ev = { who = "BATimer" }      -- one event; both ways of receiving it get the same table
  local done = false
  if rawget(disp.On, "Timeout") then disp.On.Timeout(ev) done = true end
  local by_id = rawget(disp.On, "BATimer")
  if by_id and rawget(by_id, "Timeout") then by_id.Timeout(ev) done = true end
  assert(done, "no timer handler")
end
function UIMOCK.close() UIMOCK.win.On.BeatAnalyzerWin.Close({}) end
fu = { UIManager = UI }
function fu:RequestFile(path, name, opts) UIMOCK.requested = { path = path, opts = opts } return UIMOCK.request_file end
function fu:MapPath(p) return p end
bmd = { UIDispatcher = function() return disp end }
"""


@unittest.skipIf(luajit21 is None, "lupa not installed")
class DialogTests(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        self.lua = luajit21.LuaRuntime(unpack_returned_tuples=True)
        self.out = []
        self.lua.globals().print = lambda *a: self.out.append(" ".join(str(x) for x in a))
        self.lua.globals().PY_READ = lambda p: Path(p).read_text(encoding="utf-8")
        self.lua.execute(trs.MOCK)
        self.lua.execute(UI_MOCK)
        block = resolve_plugin.render_config(self.tmp, None, "de", {c: i18n.texts(c) for c in i18n.LANGUAGES})
        self.M = self.lua.execute(resolve_plugin.apply_config(trs.SCRIPT, block))
        self.mock = self.lua.globals().MOCK
        self.ui = self.lua.globals().UIMOCK
        self.json_path = str(self.tmp / "Müller Song_resolve_markers.json")
        Path(self.json_path).write_text(json.dumps(resolve_marker_data(trs.sample_result()), ensure_ascii=False),
                                        encoding="utf-8")

    # --- helpers ---------------------------------------------------------------------------------------

    def run_dialog(self, scenario):
        errors, ran = [], []

        def wrapped():
            ran.append(True)
            try:
                self.assertEqual(self.ui.win.spec.ID, "BeatAnalyzerWin")
                scenario()
            except Exception as e:  # report assertion errors of the scenario after the loop
                errors.append(e)
        self.lua.globals().PY_SCENARIO = wrapped
        self.M.main()
        if errors:
            raise errors[0]
        self.assertEqual(ran, [True], "the window loop did not run the scenario")

    def item(self, id):
        return self.ui["items"][id]

    def click(self, id):
        self.ui.click(id)

    def check(self, id, on):
        self.ui.check(id, on)

    def choose(self, id, index):
        self.ui.choose(id, index)

    def tick(self, n=1):
        for _ in range(n):
            self.ui.tick()

    def close(self):
        self.ui.close()

    def exited(self):
        return self.ui.exited

    def request_file(self, path):
        self.ui.request_file = path

    def pick_json(self):
        self.request_file(self.json_path)
        self.click("Choose")
        self.tick(20)

    def markers(self, clip):
        return {int(f): dict(m) for f, m in clip.markers.items()}

    # --- tests -----------------------------------------------------------------------------------------

    def test_ok_disabled_until_json_with_clip(self):
        def scenario():
            self.assertFalse(self.item("OK").Enabled)
            self.assertEqual(self.item("JsonPath").Text, "Keine JSON gewählt.")
            self.close()
        self.run_dialog(scenario)
        self.assertTrue(self.exited())

    def test_choose_json_shows_clip_and_explanation(self):
        def scenario():
            self.pick_json()
            self.assertEqual(self.item("ClipInfo").Text, "Song im Media Pool · 0:20")
            self.assertTrue(self.item("OK").Enabled)
            self.assertTrue(self.item("Explain").Text.startswith("Keine Timeline offen."))
            self.check("Timeline", False)
            self.assertTrue(self.item("Explain").Text.startswith("Die Timeline bleibt unverändert."))
            self.close()
        self.run_dialog(scenario)
        self.assertEqual(self.ui.requested.opts.FReqS_Filter, "BeatAnalyzer JSON (*.json)|*.json")

    def test_missing_clip_keeps_ok_disabled(self):
        data = resolve_marker_data(trs.sample_result())
        data["fileName"] = "fehlt.wav"
        Path(self.json_path).write_text(json.dumps(data), encoding="utf-8")

        def scenario():
            self.pick_json()
            self.assertFalse(self.item("OK").Enabled)
            self.assertIn("fehlt.wav", self.item("ClipInfo").Text)
            self.close()
        self.run_dialog(scenario)

    def test_work_blocks_close_and_finishes(self):
        def scenario():
            self.pick_json()
            self.click("OK")
            self.assertFalse(self.item("OK").Enabled)
            self.assertFalse(self.item("Choose").Enabled)
            self.close()                                         # X during the work
            self.assertFalse(self.exited())
            self.tick(1)
            self.assertIn("8 / 8", self.item("Status").Text)     # 8 beats, CHUNK 20 -> one step
            self.assertIn("Was jetzt passiert:", self.item("Status").Text)
            self.tick(5)
            self.assertIn("8 Marker auf 1 Clip(s): Song", self.item("Status").Text)
            self.close()
            self.assertTrue(self.exited())
        self.run_dialog(scenario)
        self.assertEqual(len(self.markers(self.mock.song)), 8)

    def test_colors_hidden_until_checked_and_used(self):
        def scenario():
            self.assertTrue(self.item("ColorBeat2").Hidden)
            self.check("Colors", True)
            self.assertFalse(self.item("ColorBeat2").Hidden)
            self.assertEqual(len(self.item("ColorBeat2").entries), 17)
            self.assertEqual(self.item("ColorBeat2").entries[17], "kein Marker")
            self.choose("ColorBeat2", 16)                        # entry 16 (0-based) = no marker
            self.pick_json()
            self.click("OK")
            self.tick(10)
            self.close()
        self.run_dialog(scenario)
        self.assertEqual(len(self.markers(self.mock.song)), 6)  # beat 2 of both bars is missing

    def test_remove_asks_first(self):
        self.M.apply(self.json_path, None)

        def scenario():
            self.pick_json()
            self.click("Remove")
            self.assertTrue(self.item("Status").Text.startswith("Aus „Müller Song“ entfernen: 8 BeatAnalyzer-Marker"))
            self.assertFalse(self.item("RemoveYes").Hidden)
            self.assertEqual(len(self.markers(self.mock.song)), 8)
            self.click("RemoveYes")
            self.assertTrue(self.item("Status").Text.startswith("Entfernt: 8 Marker"))
            self.assertTrue(self.item("RemoveYes").Hidden)
            self.assertEqual(len(self.markers(self.mock.song)), 0)
            self.close()
        self.run_dialog(scenario)

    def test_remove_without_json_uses_only_the_selection(self):
        # a media pool item without a file name (e.g. a timeline) must not become a target
        self.lua.execute('local t = MOCK.clip("Timeline 1", "", "25", "0"); table.insert(MOCK.root.clips, t)')

        def scenario():
            self.tick(20)
            self.assertFalse(self.item("Remove").Enabled)
            self.mock.selected = self.lua.table_from([self.mock.song])
            self.tick(20)
            self.assertTrue(self.item("Remove").Enabled)
            self.close()
        self.run_dialog(scenario)

    def test_window_closed_during_work_ends_at_the_end(self):
        def scenario():
            self.pick_json()
            self.click("OK")
            self.close()                                         # Resolve may close the window anyway
            self.assertFalse(self.exited())
            self.tick(10)
            self.assertTrue(self.exited())                       # the loop ends when the work is done
        self.run_dialog(scenario)
        self.assertEqual(len(self.markers(self.mock.song)), 8)

    def test_text_labels_reserve_their_height(self):
        # Resolve does not grow wrapped labels by itself (seen in Resolve: texts overlapped)
        def scenario():
            for id, lines in (("ClipInfo", 1), ("Warnings", 2), ("Engine", 1), ("Explain", 4), ("Status", 6)):
                size = self.item(id).MinimumSize
                self.assertIsNotNone(size, id)
                self.assertGreaterEqual(size[2], 16 * lines, id)
            self.close()
        self.run_dialog(scenario)

    def test_json_line_shows_the_file_name_and_the_path_as_tooltip(self):
        def scenario():
            self.pick_json()
            self.assertEqual(self.item("JsonPath").Text, "Müller Song_resolve_markers.json")
            self.assertEqual(self.item("JsonPath").ToolTip, self.json_path)
            self.close()
        self.run_dialog(scenario)

    def test_window_has_a_minimum_size_and_a_small_saved_size_grows(self):
        (self.tmp / "resolve_temp").mkdir()
        (self.tmp / "resolve_temp" / "plugin.txt").write_text("geometry=50,60,432,470\n", encoding="utf-8")

        def scenario():
            spec = self.ui.win.spec
            self.assertEqual(list(spec.MinimumSize.values()), [600, 640])
            self.assertEqual(list(spec.Geometry.values()), [50, 60, 600, 640])
            self.close()
        self.run_dialog(scenario)

    def test_empty_lines_are_hidden(self):
        def scenario():
            self.pick_json()
            self.assertTrue(self.item("Warnings").Hidden)               # no warning for this JSON
            self.assertFalse(self.item("Engine").Hidden)
            self.close()
        self.run_dialog(scenario)

    def test_result_does_not_repeat_the_analysis_program(self):
        def scenario():
            self.pick_json()
            self.click("OK")
            self.tick(10)
            self.assertNotIn("Analyse-Programm", self.item("Status").Text)
            self.close()
        self.run_dialog(scenario)

    def test_long_warnings_get_the_height_they_need(self):
        # seen in Resolve: two warnings of two lines each were cut to two lines
        data = resolve_marker_data(trs.sample_result())
        data["fileName"] = "10. Waiting For Tonight (Hex's Momentous Radio Mix).mp3"
        data["duration"] = 292.0
        Path(self.json_path).write_text(json.dumps(data), encoding="utf-8")
        self.lua.execute("MOCK.selected = { MOCK.song }")

        def scenario():
            self.ui["items"]["BeatAnalyzerWin"].Geometry = self.lua.table_from([0, 0, 432, 600])   # narrow window
            self.pick_json()
            self.assertEqual(len(self.item("Warnings").Text.split("\n")), 2)
            self.assertGreaterEqual(self.item("Warnings").MinimumSize[2], 4 * 17)
            self.assertGreaterEqual(self.item("Explain").MinimumSize[2], 2 * 17)
            self.close()
        self.run_dialog(scenario)
        self.assertTrue(any("Window: requested" in line for line in self.out), self.out)   # size in the Console

    def test_long_clip_message_gets_the_lines_it_needs(self):
        # seen in Resolve (600 px window): "no clip" with a long file name wraps to 3 lines, 2 were reserved
        data = resolve_marker_data(trs.sample_result())
        data["fileName"] = "10. Waiting For Tonight (Hex's Momentous Radio Mix).mp3"
        Path(self.json_path).write_text(json.dumps(data), encoding="utf-8")
        self.lua.execute("MOCK.selected = {}; MOCK.pool_clips = {}")

        def scenario():
            self.ui["items"]["BeatAnalyzerWin"].Geometry = self.lua.table_from([0, 0, 600, 640])
            self.pick_json()
            text = self.item("ClipInfo").Text
            self.assertIn("Waiting For Tonight", text)
            self.assertGreater(len(text), 140, text)
            self.assertGreaterEqual(self.item("ClipInfo").MinimumSize[2], 3 * 17, text)
            self.close()
        self.run_dialog(scenario)

    def test_unknown_engine_line_gets_the_lines_it_needs(self):
        # seen in Resolve: "Analyse-Programm: in der JSON nicht angegeben (...)" wraps to 2 lines, 1 was reserved
        data = resolve_marker_data(trs.sample_result())
        data.pop("engine", None)
        Path(self.json_path).write_text(json.dumps(data), encoding="utf-8")

        def scenario():
            self.ui["items"]["BeatAnalyzerWin"].Geometry = self.lua.table_from([0, 0, 600, 640])
            self.pick_json()
            text = self.item("Engine").Text
            self.assertGreater(len(text), 80, text)
            self.assertGreaterEqual(self.item("Engine").MinimumSize[2], 2 * 17, text)
            self.close()
        self.run_dialog(scenario)

    def test_settings_saved_on_close(self):
        def scenario():
            self.check("Colors", True)
            self.choose("ColorBeat2", 16)
            self.check("Timeline", False)
            self.pick_json()
            self.close()
        self.run_dialog(scenario)
        text = (self.tmp / "resolve_temp" / "plugin.txt").read_text(encoding="utf-8")
        self.assertIn("color_beat2=none\n", text)
        self.assertIn("timeline=0\n", text)
        self.assertIn("colors_open=1\n", text)
        self.assertIn("json_dir=" + str(self.tmp) + "\n", text)

    def test_settings_restored_at_start(self):
        (self.tmp / "resolve_temp").mkdir()
        (self.tmp / "resolve_temp" / "plugin.txt").write_text(
            "timeline=0\ncolors_open=1\ncolor_downbeat=Green\njson_dir=" + str(self.tmp) + "\n", encoding="utf-8")

        def scenario():
            self.assertFalse(self.item("Timeline").Checked)
            self.assertTrue(self.item("Colors").Checked)
            self.assertFalse(self.item("ColorDownbeat").Hidden)
            self.assertEqual(self.item("ColorDownbeat").CurrentIndex, 2)     # Green
            self.request_file(None)
            self.click("Choose")
            self.close()
        self.run_dialog(scenario)
        self.assertEqual(self.ui.requested.path, str(self.tmp))



@unittest.skipIf(luajit21 is None, "lupa not installed")
class AnalysisDialogTests(DialogTests):
    """Way "Ausgewählten Clip analysieren" (Teilprojekt 3); Python is played by the test."""

    def setUp(self):
        super().setUp()
        block = resolve_plugin.render_config(self.tmp, self.tmp / "venv" / "bin" / "python", "de",
                                             {c: i18n.texts(c) for c in i18n.LANGUAGES})
        self.M = self.lua.execute(resolve_plugin.apply_config(trs.SCRIPT, block))
        (self.tmp / "venv" / "bin").mkdir(parents=True)
        (self.tmp / "venv" / "bin" / "python").write_text("", encoding="utf-8")
        self.spawned = []
        self.M.spawn = lambda cmd: self.spawned.append(cmd) or True
        self.lua.execute("MOCK.song.filepath = '/Musik/Müller Song.wav'")

    def job_dir(self):
        dirs = [d for d in (self.tmp / "resolve_temp").iterdir() if d.is_dir()]
        self.assertEqual(len(dirs), 1)
        return dirs[0]

    def python_writes(self, step=None, done=None, markers=True):
        d = self.job_dir()
        if step:
            (d / "progress.txt").write_text(f"step={step}\n", encoding="utf-8")
        if done:
            if done == "ok" and markers:
                (d / "markers.json").write_text(json.dumps(resolve_marker_data(trs.sample_result()),
                                                           ensure_ascii=False), encoding="utf-8")
            (d / "done.txt").write_text(f"state={done}\n" + ("markers=markers.json\n" if done == "ok" else "")
                                        + ("message=kaputt\n" if done == "error" else ""), encoding="utf-8")

    def select_song(self):
        self.lua.execute("MOCK.selected = { MOCK.song }")

    def start_analysis(self, slider=None):
        self.select_song()
        self.check("WayAnalyze", True)
        self.tick(20)
        if slider is not None:
            self.ui.slide("Smooth", slider)
        self.click("OK")

    def test_ways_exclude_each_other(self):
        def scenario():
            self.assertTrue(self.item("WayJson").Checked)
            self.assertFalse(self.item("WayAnalyze").Checked)
            self.assertTrue(self.item("Smooth").Hidden)
            self.check("WayAnalyze", True)
            self.assertFalse(self.item("WayJson").Checked)
            self.assertFalse(self.item("Smooth").Hidden)
            self.assertTrue(self.item("Choose").Hidden)
            self.check("WayJson", True)
            self.assertFalse(self.item("WayAnalyze").Checked)
            self.assertFalse(self.item("Choose").Hidden)
            self.close()
        self.run_dialog(scenario)

    def test_analyze_way_shows_the_selected_clip(self):
        def scenario():
            self.select_song()
            self.check("WayAnalyze", True)
            self.tick(20)
            self.assertEqual(self.item("ClipInfo").Text, "Song im Media Pool · 0:20")
            self.assertTrue(self.item("OK").Enabled)
            self.lua.execute("MOCK.selected = {}")
            self.tick(20)
            self.assertEqual(self.item("ClipInfo").Text, "Im Media Pool genau einen Audio-Clip auswählen.")
            self.assertFalse(self.item("OK").Enabled)
            self.close()
        self.run_dialog(scenario)

    def test_smooth_slider_default_90_shown_and_saved(self):
        def scenario():
            self.check("WayAnalyze", True)
            self.assertEqual(self.item("Smooth").Value, 90)
            self.assertEqual(self.item("SmoothValue").Text, "90 %")
            self.assertIn("0 %", self.item("Smooth").ToolTip)
            self.ui.slide("Smooth", 0)
            self.assertEqual(self.item("SmoothValue").Text, "aus")
            self.close()
        self.run_dialog(scenario)
        text = (self.tmp / "resolve_temp" / "plugin.txt").read_text(encoding="utf-8")
        self.assertIn("smooth=0", text)
        self.assertIn("way=analyze", text)

    def test_analysis_runs_and_sets_the_markers(self):
        def scenario():
            self.start_analysis(slider=100)
            self.assertEqual(len(self.spawned), 1)
            job = (self.job_dir() / "job.txt").read_text(encoding="utf-8")
            self.assertIn("audio=/Musik/Müller Song.wav", job)
            self.assertIn("protect=1", job)
            self.assertFalse(self.item("Cancel").Hidden)
            self.assertFalse(self.item("OK").Enabled)
            self.python_writes(step="analyze")
            self.tick(25)
            self.assertIn("Analysieren", self.item("Status").Text)
            self.lua.execute("MOCK.selected = {}")                 # the selection may change meanwhile
            self.python_writes(done="ok")
            self.tick(60)
            self.assertTrue(self.item("Cancel").Hidden)
            self.assertIn("Marker", self.item("Status").Text)
            self.close()
        self.run_dialog(scenario)
        self.assertEqual(len(self.markers(self.mock.song)), 8)
        self.assertFalse((self.tmp / "resolve_temp").exists() and any(
            d.is_dir() for d in (self.tmp / "resolve_temp").iterdir()))   # job folder removed

    def test_cancel_returns_to_the_selection(self):
        def scenario():
            self.start_analysis()
            d = self.job_dir()
            self.click("Cancel")
            self.assertTrue((d / "cancel.txt").exists())
            self.assertTrue(self.item("OK").Enabled)
            self.assertTrue(self.item("Cancel").Hidden)
            self.assertIn("abgebrochen", self.item("Status").Text)
            self.python_writes(done="ok")                          # Python finishes anyway: ignored
            self.tick(60)
            self.close()
        self.run_dialog(scenario)
        self.assertEqual(self.markers(self.mock.song), {})

    def test_error_of_the_analysis_changes_nothing(self):
        def scenario():
            self.start_analysis()
            self.python_writes(done="error")
            self.tick(25)
            self.assertIn("kaputt", self.item("Status").Text)
            self.assertTrue(self.item("OK").Enabled)
            self.close()
        self.run_dialog(scenario)
        self.assertEqual(self.markers(self.mock.song), {})

    def test_python_does_not_start(self):
        def scenario():
            self.start_analysis()
            self.lua.execute("os.time = (function(t) return function() return t() + 120 end end)(os.time)")
            self.tick(25)
            self.assertIn("Python ist nicht gestartet", self.item("Status").Text)
            self.assertTrue(self.item("OK").Enabled)
            self.close()
        self.run_dialog(scenario)

    def test_window_x_during_analysis_cancels(self):
        def scenario():
            self.start_analysis()
            d = self.job_dir()
            self.close()
            self.assertTrue((d / "cancel.txt").exists())
            self.assertTrue(self.exited())
        self.run_dialog(scenario)
        self.assertEqual(self.markers(self.mock.song), {})


@unittest.skipIf(luajit21 is None, "lupa not installed")
class AnalysisTimelineTests(AnalysisDialogTests):
    def test_timeline_markers_go_to_the_timeline_open_at_ok(self):
        self.lua.execute("""
          MOCK.timeline = MOCK.new_timeline(25, 0)
          MOCK.timeline.audio[1] = { MOCK.timeline_item(MOCK.song, 0, 0, 500) }
          MOCK.first_tl = MOCK.timeline
        """)

        def scenario():
            self.check("Timeline", False)                       # no subtitle track: only the markers
            self.start_analysis()
            self.lua.execute("""
              MOCK.timeline = MOCK.new_timeline(25, 0)         -- the user opens another timeline meanwhile
              MOCK.timeline.audio[1] = { MOCK.timeline_item(MOCK.song, 0, 0, 500) }
              MOCK.second_tl = MOCK.timeline
            """)
            self.python_writes(done="ok")
            self.tick(60)
            self.close()
        self.run_dialog(scenario)
        first = self.lua.eval("MOCK.first_tl.audio[1][1].markers")
        second = self.lua.eval("MOCK.second_tl.audio[1][1].markers")
        self.assertEqual(len(list(first.keys())), 8)
        self.assertEqual(len(list(second.keys())), 0)


if __name__ == "__main__":
    unittest.main()
