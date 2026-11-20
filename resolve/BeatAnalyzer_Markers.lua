--[[
BeatAnalyzer_Markers.lua - DaVinci Resolve script of BeatAnalyzer.
Opens a window: choose a marker JSON exported by BeatAnalyzer ("DaVinci Resolve" tab), check the target clip,
its length and the open timeline, then put one marker per beat on the audio clip in the media pool.
Media pool markers show on every use of the clip in every timeline. Colours per beat of the bar (downbeat,
beat 2-4, others, or no marker) can be set in the window. "Remove BeatAnalyzer markers" takes them off again.

Target clip: the clips selected in the media pool; with no selection, every media pool clip whose
file name equals "fileName" in the JSON. OK stays locked without a target clip.
Markers written by this script carry the custom data MARKER_TAG; a new run removes them first,
markers set by hand stay. The work runs in steps on a timer, so the window stays responsive and locked.

Subtitles: <song>.srt (one subtitle per beat, all beats) is written into a working folder
<BeatAnalyzer>/resolve_temp/<date-time>, imported into the media pool bin BIN_NAME and deleted again.
With the tick box set and the song on an audio track of the timeline open at OK, <song> (Timeline).srt with
timeline times goes onto the subtitle track "BeatAnalyzer - <song>" under the first use of the song; the
clip of that file is deleted from the media pool afterwards (the subtitles on the track stay). A new run
deletes that track and creates it again. resolve/tools/probe_timeline.lua checks the placement in Resolve.

Texts, language and the BeatAnalyzer folder come from the BA-CONFIG block (backend/resolve_plugin.py).
The window remembers its settings in <BeatAnalyzer>/resolve_temp/plugin.txt.

Install: copy to %APPDATA%\Blackmagic Design\DaVinci Resolve\Support\Fusion\Scripts\Utility\
Run:     Workspace -> Scripts -> BeatAnalyzer_Markers
Log:     Workspace -> Console (lines starting with "[BeatAnalyzer]")

Written for DaVinci Resolve Studio 21.2. The free version blocks file access for scripts.
]]

local VERSION = "0.6.5"   -- same as the file VERSION; the installer compares it

local M = { VERSION = VERSION }

-- >>> BA-CONFIG (written by backend/resolve_plugin.py - do not edit by hand) >>>
local BA = {
  home = nil,
  python = nil,
  lang = "en",
  texts = {
    ["en"] = {
      ["_meta.decimal"] = ".",
      ["_meta.html_lang"] = "en",
      ["_meta.name"] = "English",
      ["_meta.percent"] = "{v}%",
      ["output.bar_beat"] = "Bar {bar} – Beat {beat}",
      ["output.confidence"] = "Confidence {value}",
      ["output.intro"] = "{made_by}\n{file}\n{bpm} BPM – {meter}",
      ["output.kind_beat"] = "Beat {beat}",
      ["output.kind_downbeat"] = "Downbeat (1)",
      ["output.marker_cue"] = "Cue {n}",
      ["output.marker_downbeat"] = "Bar {bar}",
      ["output.marker_note"] = "{time} s | {bpm} BPM",
      ["output.marker_section_change"] = "Section {label} ◆",
      ["output.marker_section_down"] = "Section {label} ▼ {db} dB",
      ["output.marker_section_up"] = "Section {label} ▲ {db} dB",
      ["output.meter"] = "{num}/{den}{suffix}",
      ["output.meter_suffix.16"] = "",
      ["output.meter_suffix.2"] = "",
      ["output.meter_suffix.4"] = "",
      ["output.meter_suffix.8"] = "",
      ["output.model_line"] = "Model: {name} – use under the {license} licence",
      ["output.time_bpm"] = "{clock} – {bpm} BPM",
      ["plugin.analyze_many"] = "Several clips selected – please select exactly one audio clip.",
      ["plugin.analyze_no_path"] = "The selected item has no file (e.g. a Timeline or a Compound Clip).",
      ["plugin.analyze_none"] = "Select exactly one audio clip in the Media Pool.",
      ["plugin.btn_analyze"] = "Analyse",
      ["plugin.btn_apply"] = "Apply markers",
      ["plugin.btn_cancel"] = "Cancel",
      ["plugin.btn_choose"] = "Choose …",
      ["plugin.btn_close"] = "Close",
      ["plugin.btn_ok"] = "OK",
      ["plugin.btn_remove"] = "Remove BeatAnalyzer markers",
      ["plugin.btn_remove_yes"] = "Remove",
      ["plugin.cancel_hint"] = "Cancel works only during the analysis.",
      ["plugin.check_colors"] = "Adjust marker colours",
      ["plugin.check_timeline"] = "Create a Subtitle Track in the Timeline",
      ["plugin.choose_title"] = "BeatAnalyzer – choose marker JSON",
      ["plugin.clip_found"] = "{names} in the Media Pool · {length}",
      ["plugin.color_beat"] = "Beat {n}",
      ["plugin.color_cue"] = "Cue mark",
      ["plugin.color_downbeat"] = "Downbeat",
      ["plugin.color_none"] = "no marker",
      ["plugin.color_other"] = "other",
      ["plugin.color_section"] = "Section change",
      ["plugin.color_webapp"] = "From the web app",
      ["plugin.engine"] = "Analysed with {engine}",
      ["plugin.engine_unknown"] = "Analysis program: not given in the JSON (older JSON or analysed in the browser)",
      ["plugin.explain_absent"] = "The song is not in the Timeline '{timeline}'. Only the Subtitle in the Media Pool is created.",
      ["plugin.explain_no_timeline"] = "No Timeline is open. Only the Subtitle in the Media Pool is created.",
      ["plugin.explain_off"] = "The Timeline stays unchanged. The Subtitle with all beats lies in the folder BeatAnalyzer in the Media Pool and can be dragged from there into any Timeline.",
      ["plugin.explain_present"] = "In the Timeline '{timeline}' the song lies on A{track} from {tc}. Below it the Subtitle Track '{track_name}' is created and made active. Resolve allows only one active Subtitle Track; the others stay but are switched off.",
      ["plugin.explain_present_many"] = "In the Timeline '{timeline}' the song lies on {tracks}. Each of these tracks gets its own Subtitle Track, e.g. '{track_name}'. Resolve allows only one active Subtitle Track; the others stay but are disabled.",
      ["plugin.explain_short_absent"] = "Song not in the Timeline '{timeline}' – only the Subtitle in the Media Pool.",
      ["plugin.explain_short_no_timeline"] = "No Timeline open – only the Subtitle in the Media Pool.",
      ["plugin.explain_short_off"] = "The Timeline stays unchanged, Subtitle in the folder BeatAnalyzer.",
      ["plugin.explain_short_present"] = "The Subtitle Track goes under the song ({tracks}).",
      ["plugin.explain_short_tl_markers"] = "Markers also on the clips in the Timeline ({items}).",
      ["plugin.explain_tl_markers"] = "The song's clips in this Timeline ({items}) get the markers as well.",
      ["plugin.json_none"] = "No JSON chosen.",
      ["plugin.md_confirm"] = "I use md_beat_this for non-commercial purposes only (CC BY-NC 4.0)",
      ["plugin.md_confirm_needed"] = "Tick the licence box to analyse with md_beat_this.",
      ["plugin.md_notice"] = "md_beat_this is licensed under CC BY-NC 4.0 and may only be used for non-commercial purposes, within the terms of the CC BY-NC 4.0 licence: {url}",
      ["plugin.model_beat_this"] = "beat_this (MIT)\nStandard · also commercial",
      ["plugin.model_md"] = "md_beat_this (CC BY-NC 4.0)\nNon-commercial only",
      ["plugin.model_tip"] = "beat_this (CPJKU, MIT): standard, also for commercial work.\nmd_beat_this (Masked Diffusion, CC BY-NC 4.0): non-commercial use only; installed separately (see README).",
      ["plugin.msg_analysis_error"] = "Analysis failed: {message}. Nothing in the project has changed.",
      ["plugin.msg_bad_format"] = "Unknown format '{format}', expected '{expected}'. Export the file in BeatAnalyzer under Export -> DaVinci Resolve.",
      ["plugin.msg_bin_missing"] = "media pool bin '{bin}' not available",
      ["plugin.msg_cancelled"] = "Analysis cancelled. Nothing in the project has changed.",
      ["plugin.msg_cannot_read"] = "Cannot read the file: {path}",
      ["plugin.msg_job_folder"] = "Cannot create the working folder for the analysis in resolve_temp.",
      ["plugin.msg_markers"] = "{n} markers on {clips} clip(s): {names}",
      ["plugin.msg_mp3_shift"] = "MP3: markers moved by {ms} ms (Resolve plays MP3 that much later).",
      ["plugin.msg_no_clip"] = "No clip found. Select the audio clip in the media pool, or import '{file}' into the media pool.",
      ["plugin.msg_no_markers"] = "The JSON contains no markers.",
      ["plugin.msg_no_project"] = "No project is open.",
      ["plugin.msg_no_python"] = "Python of BeatAnalyzer not found. Click 'Install in Resolve' in the web app or install BeatAnalyzer again.",
      ["plugin.msg_no_start"] = "Python did not start ({python}). Install BeatAnalyzer again or click 'Install in Resolve' in the web app.",
      ["plugin.msg_no_work_dir"] = "Subtitles: cannot create a working folder in {path}",
      ["plugin.msg_not_imported"] = "Resolve did not import {path}",
      ["plugin.msg_not_json"] = "The file is not a BeatAnalyzer marker JSON.",
      ["plugin.msg_other_file"] = "Note: the selected clip is not '{file}' from the JSON.",
      ["plugin.msg_removing"] = "Removing BeatAnalyzer markers …",
      ["plugin.msg_skipped"] = "{n} markers skipped (outside the clip or not accepted by Resolve).",
      ["plugin.msg_srt_import"] = "Subtitles: {why} - import {path} by hand",
      ["plugin.msg_srt_ok"] = "Subtitles: {srt} in media pool bin '{bin}'",
      ["plugin.msg_srt_write"] = "Subtitles: cannot write {path}",
      ["plugin.msg_timeout"] = "The analysis was not finished after 10 minutes and was cancelled. Nothing in the project has changed.",
      ["plugin.msg_tl_activate"] = "Timeline: cannot activate the new subtitle track.",
      ["plugin.msg_tl_add"] = "Timeline: cannot add a subtitle track.",
      ["plugin.msg_tl_count"] = "Timeline: placed {placed} subtitles, the SRT has {count}.",
      ["plugin.msg_tl_empty"] = "Timeline: no beats in the part of the song that is in the timeline.",
      ["plugin.msg_tl_import"] = "Timeline: {why}",
      ["plugin.msg_tl_markers"] = "Timeline '{timeline}': {n} markers on {items} clip(s) of the song.",
      ["plugin.msg_tl_none_placed"] = "Timeline: Resolve placed no subtitles.",
      ["plugin.msg_tl_offset"] = "Timeline: first subtitle at frame {actual}, expected {expected} (difference {diff} frames). Please run resolve/tools/probe_timeline.lua and send the console output.",
      ["plugin.msg_tl_ok"] = "Timeline: {n} subtitles on track ST{track} '{name}'{replaced}",
      ["plugin.msg_tl_replaced"] = " (old track replaced)",
      ["plugin.msg_tl_vehicle_left"] = "Timeline: the clip '{clip}' could not be removed from the Media Pool - delete it by hand.",
      ["plugin.msg_tl_write"] = "Timeline: cannot write {path}",
      ["plugin.note_mp3"] = "MP3: Resolve plays MP3 files about 50 ms later; BeatAnalyzer moves the markers to match.",
      ["plugin.note_mp3_json"] = "MP3: the markers are set {ms} ms later (Resolve plays MP3 files that much later).",
      ["plugin.note_mp3_json_zero"] = "MP3: no correction needed (the file has no encoder delay; Resolve plays it on time).",
      ["plugin.reason_analyzer_failed"] = "the analyzer could not be loaded",
      ["plugin.reason_inference_failed"] = "analysis with beat_this failed",
      ["plugin.reason_md_not_installed"] = "md_beat_this not installed",
      ["plugin.reason_model_load_failed"] = "beat_this model could not be loaded",
      ["plugin.reason_not_installed"] = "beat_this not installed",
      ["plugin.remove_confirm"] = "Remove from '{song}': {markers} BeatAnalyzer markers, {tracks} Subtitle Track(s) in the open Timeline, {srt} Subtitle clip(s) in the folder BeatAnalyzer? Markers set by hand stay.",
      ["plugin.remove_done"] = "Removed: {markers} markers, {tracks} Subtitle Track(s), {srt} Subtitle clip(s).",
      ["plugin.remove_nothing"] = "Nothing from BeatAnalyzer found on '{song}'.",
      ["plugin.sec_output"] = "2. Output in Resolve",
      ["plugin.sec_source"] = "1. Source & analysis model",
      ["plugin.smooth_label"] = "Smoothing",
      ["plugin.smooth_off"] = "off",
      ["plugin.smooth_tip"] = "0 % = off: bars as beat_this hears them.\nMore % = a more even grid.\n100 % = fully smoothed; starts anew only where the '1' is clearly elsewhere.\nThe beats never change.\nRubato, free jazz, no fixed metre: use 0 %.",
      ["plugin.step_analysis"] = "Analysis of '{clip}'",
      ["plugin.step_analysis_hint"] = "Cancel works only now. Up to here nothing in the project has changed.",
      ["plugin.step_analyze"] = "detecting beats",
      ["plugin.step_bin"] = "Folder BeatAnalyzer in the Media Pool, Subtitle '{srt}'",
      ["plugin.step_markers"] = "Markers on the clip '{clip}' in the Media Pool",
      ["plugin.step_markers_hint"] = "Resolve sets every marker on its own, this takes a while.",
      ["plugin.step_model"] = "loading the model",
      ["plugin.step_track"] = "Subtitle Track '{track}' in '{timeline}'",
      ["plugin.step_write"] = "writing the result",
      ["plugin.task_analyze"] = "Analysing the track",
      ["plugin.task_markers"] = "Setting markers",
      ["plugin.task_subtitle"] = "Creating the Subtitle",
      ["plugin.task_track"] = "Subtitle Track in the Timeline",
      ["plugin.tasks_title"] = "Tasks",
      ["plugin.title"] = "BeatAnalyzer {version}",
      ["plugin.wait"] = "Please wait – the window closes only at the end.",
      ["plugin.wait_short"] = "Please wait …",
      ["plugin.warn_length"] = "The clip's duration ({clip}) differs from the analysed file ({json}).",
      ["plugin.warn_mp3"] = "MP3: Resolve plays MP3 files about 50 ms later than BeatAnalyzer analyses them. This JSON has no correction (older JSON or analysed in the browser): the markers lie that much before the beat. Analyse again with the server or use the song as WAV or FLAC.",
      ["plugin.warn_other_file"] = "The selected clip is not '{file}' from the JSON.",
      ["plugin.way_analyze"] = "Analyse the selected clip",
      ["plugin.way_json"] = "Load JSON",
      ["plugin.work_title"] = "What happens now:",
    },
  },
}
-- <<< BA-CONFIG <<<

-- ─── Settings ────────────────────────────────────────────────────────────────

local DOWNBEAT_COLOR = "Red"     -- marker colour of beat 1 of each bar
local BEAT_COLOR     = "Cyan"    -- marker colour of all other beats
local MARKER_TAG     = "beatthis"     -- kept from the BeatThis versions (up to 0.0.4), so their markers are replaced too
local BIN_NAME       = "BeatAnalyzer"  -- media pool bin for the subtitle files
local TRACK_PREFIX   = "BeatAnalyzer - "
local OLD_TRACK_PREFIX = "BeatThis - "       -- track name up to 0.0.4, deleted on a new run as well
local JSON_FORMAT    = "beatthis-resolve-markers/1"   -- format id kept: JSON files of older versions still work
M.DOWNBEAT_COLOR, M.BEAT_COLOR, M.MARKER_TAG, M.JSON_FORMAT = DOWNBEAT_COLOR, BEAT_COLOR, MARKER_TAG, JSON_FORMAT

-- ─── Basics ──────────────────────────────────────────────────────────────────

local G_io      = rawget(_G, "io")
local G_jit     = rawget(_G, "jit")
local G_os      = rawget(_G, "os")
local G_package = rawget(_G, "package")
local IS_WIN = (G_jit ~= nil and G_jit.os == "Windows")
  or (G_package ~= nil and type(G_package.config) == "string" and G_package.config:sub(1, 1) == "\\")

local lines = {}
local function log(...)
  local parts = {}
  for i = 1, select("#", ...) do
    parts[#parts + 1] = tostring((select(i, ...)))
  end
  local text = table.concat(parts, " ")
  lines[#lines + 1] = text
  print("[BeatAnalyzer] " .. text)
end
M.log_lines = lines

local function round(x)
  return math.floor(x + 0.5)
end

-- ─── Texts ───────────────────────────────────────────────────────────────────
-- Texts come from the BA-CONFIG block (lang/<code>.json, written by the installer); English is the fallback.

local function lookup(key)
  local texts = BA.texts or {}
  local value = (texts[BA.lang] or {})[key]
  if value == nil then
    value = (texts.en or {})[key]
  end
  return value
end

-- Text for the key with {name} placeholders filled from vars; unknown placeholders stay as they are.
local function T(key, vars)
  local text = lookup(key) or key
  if vars then
    text = text:gsub("{([%w_]+)}", function(name)
      local v = vars[name]
      return v ~= nil and tostring(v) or nil
    end)
  end
  return text
end
M.T = T

-- Number with the decimal sign of the language: fmt_num(89.6, 1) -> "89,6" in German.
local function fmt_num(x, decimals)
  local text = string.format("%." .. decimals .. "f", tonumber(x) or 0)
  return (text:gsub("%.", lookup("_meta.decimal") or "."))
end
M.fmt_num = fmt_num

-- Percent in the format of the language ("75 %", "75%", "%75"); nil -> "–".
local function fmt_pct(fraction)
  local f = tonumber(fraction)
  if not f then
    return "–"
  end
  return T("_meta.percent", { v = round(f * 100) })
end
M.fmt_pct = fmt_pct

-- Time signature from "4/4" or "4/4 (Standard)" (marker JSON up to 0.0.5) in the format of the language:
-- Turkish "4/4'lük", "6/8'lik". Text without a time signature stays unchanged.
local function fmt_meter(text)
  local num, den = tostring(text or ""):match("^%s*(%d+)/(%d+)")
  if not num then
    return tostring(text or "")
  end
  return T("output.meter", { num = num, den = den, suffix = lookup("output.meter_suffix." .. den) or "" })
end
M.fmt_meter = fmt_meter

local resolve = rawget(_G, "resolve")
if resolve == nil and type(rawget(_G, "Resolve")) == "function" then
  resolve = Resolve()
end
local fu = rawget(_G, "fu") or rawget(_G, "fusion")
if fu == nil and resolve ~= nil then
  local ok, f = pcall(function() return resolve:Fusion() end)
  fu = ok and f or nil
end

-- Call a method of a Resolve object; errors are logged (the same one at most 3 times), never thrown.
local api_problems = {}
local function api(obj, method, ...)
  if obj == nil then
    return nil
  end
  local okf, fn = pcall(function() return obj[method] end)
  if not okf or type(fn) ~= "function" then
    api_problems[method] = (api_problems[method] or 0) + 1
    if api_problems[method] <= 3 then
      log("API not available:", method)
    end
    return nil
  end
  local ok, a, b = pcall(fn, obj, ...)
  if not ok then
    api_problems[method] = (api_problems[method] or 0) + 1
    if api_problems[method] <= 3 then
      log("API error in " .. method .. ":", a)
    end
    return nil
  end
  return a, b
end

-- A media pool clip: an object with the marker methods. GetSelectedClips() of Resolve Studio 21.2
-- also returned an entry without them, which must not be treated as a clip.
local function is_clip(obj)
  local t = type(obj)
  if t ~= "userdata" and t ~= "table" then
    return false
  end
  local ok, fn = pcall(function() return obj.AddMarker end)
  return ok and type(fn) == "function"
end

-- ─── JSON ────────────────────────────────────────────────────────────────────

-- Minimal JSON decoder (objects, arrays, strings with escapes, numbers, true/false/null).
local function json_decode(text)
  local pos = 1

  local function fail(msg)
    error(string.format("JSON error at character %d: %s", pos, msg), 0)
  end

  local function skip()
    pos = text:find("[^ \t\r\n]", pos) or (#text + 1)
  end

  local value

  local function utf8_char(cp)
    if cp < 0x80 then
      return string.char(cp)
    elseif cp < 0x800 then
      return string.char(0xC0 + math.floor(cp / 0x40), 0x80 + cp % 0x40)
    elseif cp < 0x10000 then
      return string.char(0xE0 + math.floor(cp / 0x1000), 0x80 + math.floor(cp / 0x40) % 0x40, 0x80 + cp % 0x40)
    end
    return string.char(0xF0 + math.floor(cp / 0x40000), 0x80 + math.floor(cp / 0x1000) % 0x40,
                       0x80 + math.floor(cp / 0x40) % 0x40, 0x80 + cp % 0x40)
  end

  local escapes = { ['"'] = '"', ["\\"] = "\\", ["/"] = "/", b = "\b", f = "\f", n = "\n", r = "\r", t = "\t" }

  local function str()
    pos = pos + 1
    local out = {}
    while true do
      local c = text:sub(pos, pos)
      if c == "" then
        fail("unterminated string")
      elseif c == '"' then
        pos = pos + 1
        return table.concat(out)
      elseif c == "\\" then
        local e = text:sub(pos + 1, pos + 1)
        if e == "u" then
          local hex = text:sub(pos + 2, pos + 5)
          local cp = tonumber(hex, 16) or fail("bad \\u escape")
          pos = pos + 6
          if cp >= 0xD800 and cp <= 0xDBFF and text:sub(pos, pos + 1) == "\\u" then
            local lo = tonumber(text:sub(pos + 2, pos + 5), 16)
            if lo and lo >= 0xDC00 and lo <= 0xDFFF then
              cp = 0x10000 + (cp - 0xD800) * 0x400 + (lo - 0xDC00)
              pos = pos + 6
            end
          end
          out[#out + 1] = utf8_char(cp)
        else
          out[#out + 1] = escapes[e] or fail("bad escape \\" .. e)
          pos = pos + 2
        end
      else
        local stop = text:find('["\\]', pos) or (#text + 1)
        out[#out + 1] = text:sub(pos, stop - 1)
        pos = stop
      end
    end
  end

  function value()
    skip()
    local c = text:sub(pos, pos)
    if c == "{" then
      local obj = {}
      pos = pos + 1
      skip()
      if text:sub(pos, pos) == "}" then
        pos = pos + 1
        return obj
      end
      while true do
        skip()
        if text:sub(pos, pos) ~= '"' then fail("expected key") end
        local k = str()
        skip()
        if text:sub(pos, pos) ~= ":" then fail("expected ':'") end
        pos = pos + 1
        obj[k] = value()
        skip()
        local d = text:sub(pos, pos)
        pos = pos + 1
        if d == "}" then return obj end
        if d ~= "," then fail("expected ',' or '}'") end
      end
    elseif c == "[" then
      local arr = {}
      pos = pos + 1
      skip()
      if text:sub(pos, pos) == "]" then
        pos = pos + 1
        return arr
      end
      while true do
        arr[#arr + 1] = value()
        skip()
        local d = text:sub(pos, pos)
        pos = pos + 1
        if d == "]" then return arr end
        if d ~= "," then fail("expected ',' or ']'") end
      end
    elseif c == '"' then
      return str()
    elseif text:sub(pos, pos + 3) == "true" then
      pos = pos + 4
      return true
    elseif text:sub(pos, pos + 4) == "false" then
      pos = pos + 5
      return false
    elseif text:sub(pos, pos + 3) == "null" then
      pos = pos + 4
      return nil
    end
    local num = text:match("^-?%d+%.?%d*[eE]?[-+]?%d*", pos)
    if not num or num == "" then fail("unexpected character '" .. c .. "'") end
    pos = pos + #num
    return tonumber(num) or fail("bad number " .. num)
  end

  local result = value()
  skip()
  if pos <= #text then fail("text after the JSON value") end
  return result
end
M.json_decode = json_decode

-- ─── Files ───────────────────────────────────────────────────────────────────

-- On Windows, io.open in Resolve's Lua cannot open paths with non-ASCII characters.
-- _wfopen with the UTF-8 path converted to UTF-16 can.
local ffi_lib, msvcrt = nil, nil

-- UTF-8 -> UTF-16 for the _w functions of msvcrt (only after wide_open has loaded ffi).
local function wide(s)
  local ffi = ffi_lib
  local n = ffi.C.MultiByteToWideChar(65001, 0, s, -1, nil, 0)
  local buf = ffi.new("wchar_t[?]", n)
  ffi.C.MultiByteToWideChar(65001, 0, s, -1, buf, n)
  return buf
end
-- ffi and msvcrt, loaded once (Windows only); false if not available.
local function load_msvcrt()
  if not IS_WIN then
    return false
  end
  if ffi_lib == nil then
    local okr, ffi = pcall(require, "ffi")
    if not okr or not ffi then
      ffi_lib = false
      return false
    end
    pcall(ffi.cdef, [[
      int MultiByteToWideChar(unsigned int cp, unsigned long flags, const char* s, int n, wchar_t* out, int outn);
      void* _wfopen(const wchar_t* name, const wchar_t* mode);
      size_t fread(void* buf, size_t size, size_t n, void* f);
      size_t fwrite(const void* buf, size_t size, size_t n, void* f);
      int fclose(void* f);
      int _wremove(const wchar_t* name);
      int _wrmdir(const wchar_t* name);
      int _wmkdir(const wchar_t* name);
    ]])
    local okl, lib = pcall(ffi.load, "msvcrt")
    ffi_lib, msvcrt = ffi, okl and lib or nil
  end
  return ffi_lib and msvcrt and true or false
end

local function wide_open(path, mode)
  if not load_msvcrt() then
    return nil
  end
  local f = msvcrt._wfopen(wide(path), wide(mode))
  if f == nil then
    return nil
  end
  return f
end

local function read_file_wide(path)
  local ok, text = pcall(function()
    local f = wide_open(path, "rb")
    if not f then
      return nil
    end
    local chunks, buf = {}, ffi_lib.new("char[65536]")
    while true do
      local got = tonumber(msvcrt.fread(buf, 1, 65536, f))
      if got <= 0 then break end
      chunks[#chunks + 1] = ffi_lib.string(buf, got)
    end
    msvcrt.fclose(f)
    return table.concat(chunks)
  end)
  if ok then
    return text
  end
  log("Wide read failed:", text)
  return nil
end

local function read_file(path)
  if type(G_io) == "table" and type(G_io.open) == "function" then
    local f = G_io.open(path, "rb")
    if f then
      local text = f:read("*a")
      f:close()
      return text
    end
  end
  return read_file_wide(path)
end
M.read_file = read_file

-- Write text to a file. On Windows a path with non-ASCII characters goes through _wfopen,
-- because io.open would create the file under a garbled name instead of failing.
local function write_file(path, text)
  if IS_WIN and path:find("[\128-\255]") then
    local ok, done = pcall(function()
      local f = wide_open(path, "wb")
      if not f then
        return false
      end
      local n = tonumber(msvcrt.fwrite(text, 1, #text, f))
      msvcrt.fclose(f)
      return n == #text
    end)
    return ok and done
  end
  if type(G_io) == "table" and type(G_io.open) == "function" then
    local f = G_io.open(path, "wb")
    if f then
      f:write(text)
      f:close()
      return true
    end
  end
  return false
end
M.write_file = write_file

local SEP = IS_WIN and "\\" or "/"

-- Delete a file. On Windows through _wremove (Unicode paths; os.remove cannot open non-ASCII paths).
local function remove_file(path)
  if IS_WIN and load_msvcrt() then
    local ok, r = pcall(function() return msvcrt._wremove(wide(path)) end)
    return ok and r == 0
  end
  return G_os ~= nil and G_os.remove(path) == true
end
M.remove_file = remove_file

-- Delete an empty folder. On Windows through _wrmdir (remove() of the CRT cannot delete folders).
local function remove_dir(path)
  local done = false
  if IS_WIN and load_msvcrt() then
    local ok, r = pcall(function() return msvcrt._wrmdir(wide(path)) end)
    done = ok and r == 0
  else
    done = G_os ~= nil and G_os.remove(path) == true   -- POSIX: removes an empty folder
  end
  if not done then
    log("Cannot remove the folder", path)
  end
  return done
end
M.remove_dir = remove_dir

-- Create one folder. On Windows through _wmkdir (Unicode paths, no console window); else mkdir -p.
-- True only if the folder was created; an existing folder gives false.
local function make_dir(path)
  if IS_WIN and load_msvcrt() then
    local ok, r = pcall(function() return msvcrt._wmkdir(wide(path)) end)
    return ok and r == 0
  end
  if not (G_os and type(G_os.execute) == "function") then
    return false
  end
  local r = G_os.execute("mkdir '" .. path:gsub("'", "'\\''") .. "' 2>/dev/null")
  return r == 0 or r == true
end

local function work_base()
  return BA.home and (BA.home .. SEP .. "resolve_temp")
    or (G_os and (G_os.getenv("TEMP") or G_os.getenv("TMP"))) or "/tmp"
end
M.work_base = work_base

-- New working folder for the SRT files: <BeatAnalyzer>/resolve_temp/<date-time>-<random>, without a known
-- BeatAnalyzer folder in the temp folder of the system. nil if it cannot be created.
function M.work_dir()
  local base = work_base()
  make_dir(base)   -- usually there already
  local path = base .. SEP .. G_os.date("%Y%m%d-%H%M%S") .. "-" .. string.format("%04d", math.random(0, 9999))
  if not make_dir(path) then
    log("Cannot create the working folder", path)
    return nil
  end
  return path
end

-- ─── Markers ─────────────────────────────────────────────────────────────────

local function parse_fps(value)
  local s = tostring(value or ""):match("%d+[%.,]?%d*")
  local n = s and tonumber((s:gsub(",", "."))) or nil
  if n == nil or n <= 0 then
    return nil
  end
  return n
end
M.parse_fps = parse_fps

-- 29.97 -> 30000/1001 (likewise 23.976, 47.952, 59.94, 119.88)
local function exact_fps(fps)
  for _, base in ipairs({ 24, 30, 48, 60, 120 }) do
    local ntsc = base * 1000 / 1001
    if math.abs(fps - ntsc) < 0.005 then
      return ntsc
    end
  end
  return fps
end
M.exact_fps = exact_fps

-- Check the decoded JSON and return its marker list, or nil and a message.
local function validate(data)
  if type(data) ~= "table" then
    return nil, T("plugin.msg_not_json")
  end
  if data.format ~= JSON_FORMAT then
    return nil, T("plugin.msg_bad_format", { format = tostring(data.format), expected = JSON_FORMAT })
  end
  if type(data.markers) ~= "table" or #data.markers == 0 then
    return nil, T("plugin.msg_no_markers")
  end
  return data.markers
end
M.validate = validate

local function clip_list(folder, out)
  for _, clip in pairs(api(folder, "GetClipList") or {}) do
    out[#out + 1] = clip
  end
  for _, sub in pairs(api(folder, "GetSubFolderList") or {}) do
    clip_list(sub, out)
  end
  return out
end

-- Clips selected in the media pool; without a selection the clips with the file name from the JSON.
-- Clips selected in the media pool (entries without clip methods are ignored).
local function selected_clips(media_pool)
  local selected, ignored = {}, {}
  for key, clip in pairs(api(media_pool, "GetSelectedClips") or {}) do
    if is_clip(clip) then
      selected[#selected + 1] = clip
    else
      ignored[#ignored + 1] = tostring(key) .. "=" .. type(clip)
    end
  end
  local text = table.concat(ignored, ", ")
  if #ignored > 0 and text ~= M.last_ignored then   -- the window checks every second: log it once
    log("Selection: ignored entries that are not clips:", text)
  end
  M.last_ignored = text
  return selected
end
M.selected_clips = selected_clips

local function target_clips(media_pool, file_name)
  local selected = selected_clips(media_pool)
  if #selected > 0 then
    return selected, "selection"
  end
  local found = {}
  for _, clip in ipairs(clip_list(api(media_pool, "GetRootFolder"), {})) do
    if is_clip(clip) and tostring(api(clip, "GetClipProperty", "File Name") or "") == file_name then
      found[#found + 1] = clip
    end
  end
  return found, "file name"
end
M.target_clips = target_clips

-- ─── Analysis job (Teilprojekt 3) ─────────────────────────────────────────────
-- The script writes job.txt into a new working folder, starts backend/resolve_job.py with the Python of the venv
-- without a window and polls progress.txt / done.txt (see backend/resolve_job.py).

local JOB_FORMAT = "beatanalyzer-resolve-job/1"
local JOB_FILES = { "job.txt", "progress.txt", "progress.txt.tmp", "done.txt", "done.txt.tmp", "markers.json",
                    "markers.json.tmp", "cancel.txt", "log.txt" }

-- True if the file can be opened (non-ASCII paths on Windows through _wfopen).
local function file_exists(path)
  if type(G_io) == "table" and type(G_io.open) == "function" then
    local f = G_io.open(path, "rb")
    if f then
      f:close()
      return true
    end
  end
  if IS_WIN then
    local ok, f = pcall(wide_open, path, "rb")
    if ok and f then
      msvcrt.fclose(f)
      return true
    end
  end
  return false
end
M.NO_START_SECONDS, M.TIMEOUT_SECONDS, M.JOB_MAX_AGE = 60, 600, 86400

-- "Glätten" 1 ... 100 % -> protection of clear "1"s 0.5 ... 1.0 (as in the web app); 0 = off
function M.slider_to_protect(v)
  v = math.max(0, math.min(100, tonumber(v) or 90))
  return math.floor((0.5 + v / 200) * 1000 + 0.5) / 1000
end

local function read_kv(path)
  local text = read_file(path)
  if not text then
    return nil
  end
  local out = {}
  for line in (text .. "\n"):gmatch("(.-)\r?\n") do
    local k, v = line:match("^%s*([^=]-)%s*=%s*(.-)%s*$")
    if k and k ~= "" then
      out[k] = v
    end
  end
  return out
end

local function jobs_list()
  return work_base() .. SEP .. "jobs.txt"
end

-- New job folder with job.txt. opts: lang, slider (0 ... 100), model ("beat_this" | "md_beat_this"), now (for
-- tests). Returns the folder or nil, error.
function M.new_job(audio_path, opts)
  opts = opts or {}
  local dir = M.work_dir()
  if not dir then
    return nil, T("plugin.msg_job_folder")
  end
  local slider = tonumber(opts.slider) or 90
  local text = table.concat({
    "format=" .. JOB_FORMAT,
    "audio=" .. tostring(audio_path),
    "lang=" .. tostring(opts.lang or BA.lang or "en"),
    "smooth=" .. (slider > 0 and "1" or "0"),
    "protect=" .. string.format("%g", M.slider_to_protect(slider > 0 and slider or 90)),
    "model=" .. (opts.model == "md_beat_this" and "md_beat_this" or "beat_this"),
  }, "\n") .. "\n"
  if not write_file(dir .. SEP .. "job.txt", text) then
    return nil, T("plugin.msg_job_folder")
  end
  -- remembered for cleanup_jobs: Lua cannot list a folder
  local list = read_file(jobs_list()) or ""
  write_file(jobs_list(), list .. tostring(opts.now or G_os.time()) .. "\t" .. dir .. "\n")
  return dir
end

-- Start the job without a window. M.spawn is the fallback (and the hook for tests).
function M.spawn(cmd)
  local r = G_os.execute(cmd)
  return r == 0 or r == true
end

local function quote(s)
  if IS_WIN then
    return '"' .. s .. '"'
  end
  return "'" .. s:gsub("'", "'\\''") .. "'"
end

local function shell_execute(python, params)
  if not load_msvcrt() then
    return false
  end
  local ok, r = pcall(function()
    pcall(ffi_lib.cdef, [[
      void* ShellExecuteW(void* hwnd, const wchar_t* op, const wchar_t* file, const wchar_t* params,
                          const wchar_t* dir, int show);
    ]])
    local shell32 = ffi_lib.load("shell32")
    local h = shell32.ShellExecuteW(nil, wide("open"), wide(python), wide(params), nil, 0)   -- 0 = SW_HIDE
    return tonumber(ffi_lib.cast("intptr_t", h)) > 32
  end)
  if not ok then
    log("ShellExecuteW failed:", r)
  end
  return ok and r
end
M.shell_execute = shell_execute   -- hook for tests (on Windows the first way to start Python)

function M.launch(job_dir)
  if not BA.python or not BA.home or not file_exists(BA.python) then   -- e.g. the venv was deleted
    return false, T("plugin.msg_no_python")
  end
  local script = BA.home .. SEP .. "backend" .. SEP .. "resolve_job.py"
  local params = quote(script) .. " " .. quote(job_dir)
  log("Start:", BA.python, params)
  if IS_WIN and M.shell_execute(BA.python, params) then
    return true
  end
  local cmd = quote(BA.python) .. " " .. params
  if IS_WIN then
    cmd = 'start "" /b ' .. cmd
  else
    cmd = cmd .. " >/dev/null 2>&1 &"
  end
  if M.spawn(cmd) then
    return true
  end
  return false, T("plugin.msg_no_start", { python = BA.python })
end

-- State of a job: running (step), ok (markers_path), error (message), cancelled, no_start, timeout.
function M.poll(job_dir, started, now)
  local done = read_kv(job_dir .. SEP .. "done.txt")
  if done and done.state then
    return { state = done.state, message = done.message,
             markers_path = done.markers and (job_dir .. SEP .. done.markers) or nil }
  end
  local progress = read_kv(job_dir .. SEP .. "progress.txt")
  local elapsed = (now or G_os.time()) - (started or 0)
  if not progress and elapsed > M.NO_START_SECONDS then
    return { state = "no_start" }
  end
  if elapsed > M.TIMEOUT_SECONDS then
    return { state = "timeout" }
  end
  return { state = "running", step = progress and progress.step or nil }
end

function M.cancel(job_dir)
  return write_file(job_dir .. SEP .. "cancel.txt", "")
end

function M.remove_job(job_dir)
  for _, name in ipairs(JOB_FILES) do
    remove_file(job_dir .. SEP .. name)
  end
  return remove_dir(job_dir)
end

-- Remove job folders older than a day (a crash or a closed Resolve leaves them behind).
function M.cleanup_jobs(now)
  local list = read_file(jobs_list())
  if not list then
    return 0
  end
  local keep, removed = {}, 0
  for line in list:gmatch("[^\n]+") do
    local t, dir = line:match("^(%d+)\t(.+)$")
    if t and not file_exists(dir .. SEP .. "job.txt") then
      -- gone already (removed after a successful run): forget it quietly
    elseif t and (file_exists(dir .. SEP .. "done.txt") or (now or G_os.time()) - tonumber(t) > M.JOB_MAX_AGE) then
      -- Python is done (also after Cancel), or the job hangs for more than a day
      M.remove_job(dir)
      removed = removed + 1
    elseif t then
      keep[#keep + 1] = line
    end
  end
  write_file(jobs_list(), #keep > 0 and (table.concat(keep, "\n") .. "\n") or "")
  return removed
end

-- The clip to analyse: exactly one selected clip with a file path. Returns clip or nil, "none"|"many"|"no_path".
function M.analysis_target(media_pool)
  local clips = selected_clips(media_pool)
  if #clips == 0 then
    return nil, "none"
  elseif #clips > 1 then
    return nil, "many"
  end
  local path = api(clips[1], "GetClipProperty", "File Path")
  if type(path) ~= "string" or path == "" then
    return nil, "no_path"
  end
  return clips[1], nil
end

local function remove_own_markers(clip)
  local removed = 0
  for _ = 1, 100000 do
    if not api(clip, "DeleteMarkerByCustomData", MARKER_TAG) then
      break
    end
    removed = removed + 1
  end
  return removed
end

-- Put the markers on one media pool clip. Returns added, skipped, removed.
-- Marker colours of Resolve; "none" = no marker for this beat of the bar.
M.MARKER_COLORS = { "Blue", "Cyan", "Green", "Yellow", "Red", "Pink", "Purple", "Fuchsia", "Rose", "Lavender",
                    "Sky", "Mint", "Lemon", "Sand", "Cocoa", "Cream" }
M.NO_MARKER = "none"
-- md_beat_this (Masked Diffusion, CC BY-NC 4.0): non-commercial use only; shown in the window with its address
M.MD_URL = "https://github.com/fosfrancesco/md_beat_this"

-- cue: cue marks set in the web app while listening (key M); section: section changes of the song structure
M.DEFAULT_COLORS = { downbeat = DOWNBEAT_COLOR, beat2 = BEAT_COLOR, beat3 = BEAT_COLOR, beat4 = BEAT_COLOR,
                     other = BEAT_COLOR, cue = "Yellow", section = "Purple" }
local COLOR_OK = {}
for _, c in ipairs(M.MARKER_COLORS) do
  COLOR_OK[c] = true
end

-- Colour of a marker by its beat in the bar: downbeat, beat 2-4, all others; nil = no marker.
-- An unknown colour falls back to the default of that slot. Cue marks and section changes from the web app have
-- their own colours (adjustable in the window, test 0.6.0) and are set also when their beat slot is "no marker";
-- with "no marker" for cue / section they keep the colour of their beat.
function M.marker_color(m, colors)
  local own = tonumber(m.cue) and "cue"
    or ((m.section == "up" or m.section == "down" or m.section == "change") and "section") or nil
  if own then
    local c = colors and colors[own]
    if c ~= M.NO_MARKER then
      return COLOR_OK[c] and c or M.DEFAULT_COLORS[own]
    end
  end
  local slot = m.type == "downbeat" and "downbeat"
    or ((tonumber(m.beat) or 0) >= 2 and (tonumber(m.beat) or 0) <= 4 and ("beat" .. tonumber(m.beat)))
    or "other"
  local color = colors and colors[slot]
  if color == M.NO_MARKER then
    return nil
  end
  return COLOR_OK[color] and color or M.DEFAULT_COLORS[slot]
end


-- ─── Subtitles ──────────────────────────────────────────────────────────────

local function srt_time(sec)
  local ms = math.max(0, round(sec * 1000))
  return string.format("%02d:%02d:%02d,%03d", math.floor(ms / 3600000), math.floor(ms / 60000) % 60,
                       math.floor(ms / 1000) % 60, ms % 1000)
end

local function clock(sec)
  local ms = math.max(0, round(sec * 1000))
  return string.format("%02d:%02d.%03d", math.floor(ms / 60000), math.floor(ms / 1000) % 60, ms % 1000)
end

M.INFO_GAP = 0.5   -- seconds before the first beat needed for an own info subtitle; else it goes under that beat

-- Info block of every subtitle: BeatAnalyzer, file, tempo and meter, model with licence (if the JSON has one).
-- "BeatAnalyzer 0.6.1": the program and version that made the JSON (older JSON without it: this script's version)
function M.made_by(data)
  local gen = type(data) == "table" and type(data.generator) == "table" and data.generator or nil
  local version = gen and gen.version and tostring(gen.version) or VERSION
  return "BeatAnalyzer " .. version
end

function M.info_lines(data)
  local text = T("output.intro", { made_by = M.made_by(data), file = tostring(data.fileName or ""),
                                   bpm = tonumber(data.globalBpm) and fmt_num(data.globalBpm, 1) or "?",
                                   meter = fmt_meter(data.timeSignature or "?") })
  local model = type(data.engine) == "table" and type(data.engine.model) == "table" and data.engine.model or nil
  if model and model.name then
    text = text .. "\n" .. T("output.model_line", { name = tostring(model.name),
                                                     license = tostring(model.license or "?") })
  end
  return text
end

-- SRT with one subtitle per marker, shown until the next one. Four lines per beat, in the language of
-- BA.lang (English here):
--   Downbeat (1) | Beat 2
--   Bar 24 – Beat 1
--   01:02.880 – 89.6 BPM
--   Confidence 75%
-- Plus the info block (M.info_lines) per part of the song: its own subtitle before the first beat when there are
-- at least M.INFO_GAP seconds, else under the lines of the first beat. Without opts (media-pool SRT) a first
-- subtitle from 0 s to the first beat keeps the timing when the SRT is placed at the clip start.
-- opts.from / opts.to: only beats in this part of the song (seconds), the last subtitle ends at "to".
-- opts.shift: seconds added to every time (position of song second 0 in the timeline).
-- opts.segments: several such parts { shift, from, to } (every use of the song on one audio track).
-- Returns the SRT text, the number of subtitles and the time of the first one (after the shift).
local function build_srt(data, opts)
  opts = opts or {}
  -- opts.segments: several parts of the song, each { shift, from, to } (one per use of the song on a track)
  local segments = opts.segments or { { shift = opts.shift or 0, from = opts.from, to = opts.to } }
  local info = M.info_lines(data)
  -- md_beat_this gives no confidence: no "Confidence" line (other JSONs without a value show "–")
  local no_confidence = type(data.engine) == "table" and data.engine.id == "md_beat_this"
  local cues = {}
  for _, seg in ipairs(segments) do
    local shift, from, to = seg.shift or 0, seg.from, seg.to
    local markers = {}
    for _, m in ipairs(data.markers) do
      local t = tonumber(m.time)
      if t and (not from or t >= from - 1e-6) and (not to or t < to) then
        markers[#markers + 1] = m
      end
    end
    if #markers > 0 then
      local first = tonumber(markers[1].time)
      local start = from or 0
      -- info block before the first beat of this part, or under the first beat when there is no room
      local info_under = first - start < M.INFO_GAP
      if not info_under then
        cues[#cues + 1] = { start + shift, first + shift, info }
      elseif not from and first > 0.05 then
        -- media-pool SRT: a cue from 0 s keeps the timing when the SRT is placed at the clip start, even when the
        -- room is too short to read the info block there (it is also under the first beat then)
        cues[#cues + 1] = { shift, first + shift, info }
      end
      for i, m in ipairs(markers) do
        local t = tonumber(m.time)
        local nxt = markers[i + 1] and tonumber(markers[i + 1].time)
        if not nxt then
          local prev = markers[i - 1] and tonumber(markers[i - 1].time)
          nxt = t + (prev and math.max(0.1, t - prev) or 0.5)
          if to and nxt > to then
            nxt = to
          end
        end
        local bar, beat = tonumber(m.bar) or 0, tonumber(m.beat) or 0
        local kind = m.type == "downbeat" and T("output.kind_downbeat") or T("output.kind_beat", { beat = beat })
        local lines = {
          kind,
          T("output.bar_beat", { bar = bar, beat = beat }),
          T("output.time_bpm", { clock = clock(t), bpm = fmt_num(m.bpm, 1) }),
        }
        if not no_confidence then
          lines[#lines + 1] = T("output.confidence", { value = fmt_pct(m.confidence) })
        end
        if i == 1 and info_under then
          lines[#lines + 1] = info   -- no empty line: in an SRT it would end the subtitle
        end
        cues[#cues + 1] = { t + shift, nxt + shift, table.concat(lines, "\n") }
      end
    end
  end
  if #cues == 0 then
    return "", 0, nil
  end
  table.sort(cues, function(a, b) return a[1] < b[1] end)
  local out = {}
  for i, c in ipairs(cues) do
    out[#out + 1] = string.format("%d\n%s --> %s\n%s\n", i, srt_time(c[1]), srt_time(c[2]), c[3])
  end
  return table.concat(out, "\n"), #cues, cues[1][1]
end
M.build_srt = build_srt

-- Name of a marker: "Bar 24" on a downbeat, "24.2" on other beats; cue marks and section changes from the web
-- app put their own label in front, e.g. "Cue 2 – Bar 33" or "Section B ▲ +6 dB – Bar 33" (B: the letter of the
-- part in the song structure; older JSON without a letter gives "Section ▲ +6 dB – Bar 33").
function M.marker_name(m)
  local name = m.type == "downbeat" and T("output.marker_downbeat", { bar = tonumber(m.bar) or 0 })
    or string.format("%d.%d", tonumber(m.bar) or 0, tonumber(m.beat) or 0)
  if tonumber(m.cue) then
    return T("output.marker_cue", { n = math.floor(tonumber(m.cue)) }) .. " – " .. name
  elseif m.section == "up" or m.section == "down" or m.section == "change" then
    local d = tonumber(m.sectionDelta) or 0
    local db = (d > 0 and "+" or (d < 0 and "−" or "")) .. string.format("%d", math.floor(math.abs(d) + 0.5))
    local label = type(m.sectionLabel) == "string" and m.sectionLabel or ""
    local text = T("output.marker_section_" .. m.section, { db = db, label = label }):gsub("%s+", " ")
    return text .. " – " .. name
  end
  return name
end

-- Note of a marker: the same parts as its subtitle, e.g. "Takt 24 – Beat 2 | 106,860 s | 120,0 BPM | Confidence 75 %".
-- With `data` (the first marker of a clip): "BeatAnalyzer 0.6.1" in front (test 0.6.0 b2).
function M.marker_note(m, data)
  local parts = {
    T("output.bar_beat", { bar = tonumber(m.bar) or 0, beat = tonumber(m.beat) or 0 }),
    T("output.marker_note", { time = fmt_num(m.time, 3), bpm = fmt_num(m.bpm, 1) }),
  }
  if tonumber(m.confidence) then
    parts[#parts + 1] = T("output.confidence", { value = fmt_pct(m.confidence) })
  end
  if data then
    table.insert(parts, 1, M.made_by(data))
  end
  return table.concat(parts, " | ")
end

-- "C:\\Downloads\\x.json" + "01. Song.flac" -> "C:\\Downloads\\01. Song.srt"
-- "<dir>" + "01. Song.flac" -> "<dir>/01. Song.srt"; without a file name the name of the JSON.
local function srt_path(dir, file_name, json_path)
  local base = file_name:gsub("%.[^%.]*$", "")
  if base == "" then
    base = (json_path:match("([^/\\]+)$") or "BeatAnalyzer"):gsub("%.[^%.]*$", "")
  end
  base = base:gsub('[<>:"/\\|%?%*]', "_")
  return dir .. SEP .. base .. ".srt", base .. ".srt"
end
M.srt_path = srt_path

-- The bin BIN_NAME; created if missing unless only_find is set.
local function find_bin(media_pool, only_find)
  local root = api(media_pool, "GetRootFolder")
  for _, sub in pairs(api(root, "GetSubFolderList") or {}) do
    if api(sub, "GetName") == BIN_NAME then
      return sub
    end
  end
  if only_find then
    return nil
  end
  return api(media_pool, "AddSubFolder", root, BIN_NAME)
end

-- Import the SRT into the bin BIN_NAME; a clip of the same name from an earlier run is replaced.
local function import_subtitles(media_pool, path, name)
  local bin = find_bin(media_pool)
  if not bin then
    return nil, T("plugin.msg_bin_missing", { bin = BIN_NAME })
  end
  local old = {}
  for _, clip in pairs(api(bin, "GetClipList") or {}) do
    if is_clip(clip) and api(clip, "GetName") == name then
      old[#old + 1] = clip
    end
  end
  if #old > 0 then
    api(media_pool, "DeleteClips", old)
  end
  local previous = api(media_pool, "GetCurrentFolder")
  api(media_pool, "SetCurrentFolder", bin)
  local items = api(media_pool, "ImportMedia", { path })
  if previous then
    api(media_pool, "SetCurrentFolder", previous)
  end
  local item = items and items[1]
  if not item then
    return nil, T("plugin.msg_not_imported", { path = path })
  end
  log(string.format("Subtitles imported: %s (%d replaced)", tostring(api(item, "GetName") or name), #old))
  return item
end

-- ─── Timeline ───────────────────────────────────────────────────────────────
-- Resolve Studio 21.1.2 (tested for the WhisperX Workbench, resolve/tools/probe_timeline.lua checks it here):
-- AppendToTimeline puts an SRT only on the active subtitle track; on an empty track the SRT times count
-- from the timeline start; recordFrame is ignored; AddTrack("subtitle") creates an inactive track.
-- So the SRT for the timeline carries timeline times and goes onto a new, only active subtitle track.

local function media_key(clip)
  local id = api(clip, "GetMediaId")
  if id and id ~= "" then
    return "id:" .. tostring(id)
  end
  return "path:" .. tostring(api(clip, "GetClipProperty", "File Path") or api(clip, "GetName") or "?")
end

-- First use (smallest start) of one of the clips on an audio track: timeline item or nil.
-- All clips of the song in a timeline (audio and video tracks), for the markers on the timeline clips.
function M.timeline_items(tl, clips)
  local keys, out = {}, {}
  for _, c in ipairs(clips or {}) do
    keys[media_key(c)] = true
  end
  if not tl then
    return out
  end
  for _, kind in ipairs({ "audio", "video" }) do
    local n = tonumber(api(tl, "GetTrackCount", kind)) or 0
    for i = 1, n do
      for _, item in ipairs(api(tl, "GetItemListInTrack", kind, i) or {}) do
        local mpi = api(item, "GetMediaPoolItem")
        if mpi and keys[media_key(mpi)] then
          out[#out + 1] = item
        end
      end
    end
  end
  return out
end

-- Audio tracks with the song: { { track = i, items = { ... } }, ... } in track order.
local function song_tracks(tl, clips)
  local keys, out = {}, {}
  for _, c in ipairs(clips or {}) do
    keys[media_key(c)] = true
  end
  local n = tl and tonumber(api(tl, "GetTrackCount", "audio")) or 0
  for i = 1, n do
    local list = {}
    for _, item in ipairs(api(tl, "GetItemListInTrack", "audio", i) or {}) do
      local mpi = api(item, "GetMediaPoolItem")
      if mpi and keys[media_key(mpi)] then
        list[#list + 1] = item
      end
    end
    if #list > 0 then
      out[#out + 1] = { track = i, items = list }
    end
  end
  return out
end
M.song_tracks = song_tracks

-- Our subtitle track of a song: "BeatAnalyzer - <song>", "BeatAnalyzer - <song> (A<n>)" or "BeatThis - <song>".
local function is_song_track(name, song)
  if type(name) ~= "string" then
    return false
  end
  if name == TRACK_PREFIX .. song or name == OLD_TRACK_PREFIX .. song then
    return true
  end
  local prefix = TRACK_PREFIX .. song .. " (A"
  return name:sub(1, #prefix) == prefix and name:sub(#prefix + 1):match("^%d+%)$") ~= nil
end

local function first_use(tl, clips)
  local keys = {}
  for _, c in ipairs(clips) do
    keys[media_key(c)] = true
  end
  local best, best_start, best_track
  local n = tonumber(api(tl, "GetTrackCount", "audio")) or 0
  for i = 1, n do
    for _, item in ipairs(api(tl, "GetItemListInTrack", "audio", i) or {}) do
      local mpi = api(item, "GetMediaPoolItem")
      local start = tonumber(api(item, "GetStart"))
      if mpi and start and keys[media_key(mpi)] and (not best_start or start < best_start) then
        best, best_start, best_track = item, start, i
      end
    end
  end
  return best, best_track
end
M.first_use = first_use

local function subtitle_count(tl, i)
  local items = api(tl, "GetItemListInTrack", "subtitle", i)
  return type(items) == "table" and #items or 0   -- # not pairs(): pairs() reports 1 on an empty track
end

-- Delete all subtitle tracks of the song (every form of the name, see is_song_track), from the last one,
-- so the indexes stay valid.
local function delete_song_tracks(tl, song)
  local n = tonumber(api(tl, "GetTrackCount", "subtitle")) or 0
  local deleted = 0
  for i = n, 1, -1 do
    if is_song_track(api(tl, "GetTrackName", "subtitle", i), song) and api(tl, "DeleteTrack", "subtitle", i) then
      deleted = deleted + 1
    end
  end
  return deleted
end

-- Only one subtitle track can be active: deactivate all others, then activate the target.
local function activate_only(tl, target)
  local n = tonumber(api(tl, "GetTrackCount", "subtitle")) or 0
  for i = 1, n do
    if i ~= target then
      api(tl, "SetTrackEnable", "subtitle", i, false)
    end
  end
  api(tl, "SetTrackEnable", "subtitle", target, true)
  return api(tl, "GetIsTrackEnabled", "subtitle", target) == true
end

-- One subtitle track for the given parts (all uses of the song on one audio track). Returns a result line
-- and true if a file was kept (failed import).
-- First phase for one audio track: the SRT file. Returns prep (count, first, srt_name, srt_file, track_name) or
-- nil, a result line and true if a file was kept.
local function write_track_srt(data, segments, dir, base, track_no, several)
  local text, count, first = build_srt(data, { segments = segments })
  if count == 0 then
    return nil, T("plugin.msg_tl_empty")
  end
  local srt_name = base .. " (Timeline" .. (several and (" A" .. track_no) or "") .. ").srt"
  local srt_file = dir .. SEP .. srt_name
  if not write_file(srt_file, text) then
    return nil, T("plugin.msg_tl_write", { path = srt_file }), true
  end
  return { count = count, first = first, srt_name = srt_name, srt_file = srt_file,
           track_name = TRACK_PREFIX .. base .. (several and (" (A" .. track_no .. ")") or "") }
end

-- Second phase: import the SRT and put it on a new subtitle track.
local function place_track(media_pool, tl, prep, replaced, fps, tl_start)
  local count, first, srt_name, srt_file, track_name = prep.count, prep.first, prep.srt_name, prep.srt_file,
                                                      prep.track_name
  local srt_item, ierr = import_subtitles(media_pool, srt_file, srt_name)
  if not srt_item then
    return T("plugin.msg_srt_import", { why = tostring(ierr), path = srt_file }), true
  end
  -- The subtitles on the track belong to the project: the clip and the file are only the way there.
  -- Called on every path after the import; a clip that cannot be deleted stays and is named in the result.
  local function drop_vehicle(msg)
    local deleted_clip = api(media_pool, "DeleteClips", { srt_item })
    remove_file(srt_file)
    if not deleted_clip then
      msg = msg .. "\n" .. T("plugin.msg_tl_vehicle_left", { clip = srt_name })
    end
    return msg
  end

  local before = tonumber(api(tl, "GetTrackCount", "subtitle")) or 0
  api(tl, "AddTrack", "subtitle")
  local target = tonumber(api(tl, "GetTrackCount", "subtitle")) or 0
  if target <= before then
    return drop_vehicle(T("plugin.msg_tl_add"))
  end
  if not activate_only(tl, target) then
    api(tl, "DeleteTrack", "subtitle", target)
    return drop_vehicle(T("plugin.msg_tl_activate"))
  end
  api(media_pool, "AppendToTimeline", { srt_item })
  local placed = subtitle_count(tl, target)
  if placed == 0 then
    api(tl, "DeleteTrack", "subtitle", target)
    return drop_vehicle(T("plugin.msg_tl_none_placed"))
  end
  api(tl, "SetTrackName", "subtitle", target, track_name)

  local msg = T("plugin.msg_tl_ok", { n = placed, track = target, name = track_name,
                                     replaced = replaced and T("plugin.msg_tl_replaced") or "" })
  if placed ~= count then
    msg = msg .. "\n" .. T("plugin.msg_tl_count", { placed = placed, count = count })
  end
  local actual
  for _, it in ipairs(api(tl, "GetItemListInTrack", "subtitle", target) or {}) do
    local st = tonumber(api(it, "GetStart"))
    if st and (not actual or st < actual) then
      actual = st
    end
  end
  local expected = tl_start + round(first * fps)
  log(string.format("Timeline: first subtitle at frame %s, expected %d", tostring(actual), expected))
  if actual and math.abs(actual - expected) > 1 then
    msg = msg .. "\n" .. T("plugin.msg_tl_offset", { actual = actual, expected = expected, diff = actual - expected })
  end
  return drop_vehicle(msg)
end

-- Subtitles under the song in the open timeline: one track per audio track with the song (user: one per track),
-- each with all uses of the song on that track, only their visible parts. Returns the result lines, or nil when
-- the song is not on an audio track of the timeline.
local function place_in_timeline(media_pool, tl, data, clips, dir, base)
  local groups = song_tracks(tl, clips)
  if #groups == 0 then
    log("Timeline: the song is not on an audio track of '" .. tostring(api(tl, "GetName") or "?") .. "'")
    return nil
  end
  local fps = exact_fps(parse_fps(api(tl, "GetSetting", "timelineFrameRate")) or 25)
  local tl_start = tonumber(api(tl, "GetStartFrame")) or 0
  local lines, kept, preps = {}, false, {}
  for _, g in ipairs(groups) do
    local segments = {}
    for _, item in ipairs(g.items) do
      local start = tonumber(api(item, "GetStart")) or tl_start
      local left = tonumber(api(item, "GetLeftOffset")) or 0
      local duration = tonumber(api(item, "GetDuration")) or 0
      local seg = { from = left / fps, to = (left + duration) / fps, shift = (start - tl_start - left) / fps }
      segments[#segments + 1] = seg
      log(string.format("Timeline '%s' A%d: song at frame %d (start %d), left offset %d, duration %d, %.3f fps -> song %.3f-%.3f s, shift %.3f s",
          tostring(api(tl, "GetName") or "?"), g.track, start, tl_start, left, duration, fps, seg.from, seg.to,
          seg.shift))
    end
    local prep, line, k = write_track_srt(data, segments, dir, base, g.track, #groups > 1)
    if prep then
      preps[#preps + 1] = prep
    else
      lines[#lines + 1] = line
      kept = kept or k == true
    end
  end
  if #preps == 0 then   -- nothing new to place: the tracks of the last run stay as they are
    return table.concat(lines, "\n"), kept
  end
  -- The old tracks go before the import: Resolve may refuse to delete a clip that a timeline still uses, so the
  -- clip of the last run can only be replaced once its track is gone. Only now, when the new files exist.
  local replaced = delete_song_tracks(tl, base) > 0
  for _, prep in ipairs(preps) do
    local line, k = place_track(media_pool, tl, prep, replaced, fps, tl_start)
    lines[#lines + 1] = line
    kept = kept or k == true
  end
  return table.concat(lines, "\n"), kept
end
M.place_in_timeline = place_in_timeline

-- Apply a marker JSON file. Returns true/false and a message for the user.
-- ─── Remove ──────────────────────────────────────────────────────────────────
-- Everything BeatAnalyzer put on a song: own markers on the clips, the subtitle tracks "BeatAnalyzer - <song>"
-- (and "BeatThis - <song>") in the open timeline, the subtitle clips of the song in the bin BeatAnalyzer.

local function removal_targets(clips, tl)
  local song = tostring(api(clips[1], "GetClipProperty", "File Name") or api(clips[1], "GetName") or "")
  song = song:gsub("%.[^%.]*$", "")
  local t = { song = song, markers = 0, tracks = 0, srt_clips = 0, srt_items = {} }
  for _, clip in ipairs(clips) do
    for _, m in pairs(api(clip, "GetMarkers") or {}) do
      if type(m) == "table" and m.customData == MARKER_TAG then
        t.markers = t.markers + 1
      end
    end
  end
  for _, item in ipairs(M.timeline_items(tl, clips)) do
    for _, m in pairs(api(item, "GetMarkers") or {}) do
      if type(m) == "table" and m.customData == MARKER_TAG then
        t.markers = t.markers + 1
      end
    end
  end
  if tl then
    local n = tonumber(api(tl, "GetTrackCount", "subtitle")) or 0
    for i = 1, n do
      if is_song_track(api(tl, "GetTrackName", "subtitle", i), song) then
        t.tracks = t.tracks + 1
      end
    end
  end
  local pm = api(resolve, "GetProjectManager")
  local project = pm and api(pm, "GetCurrentProject")
  t.media_pool = project and api(project, "GetMediaPool")
  local bin = t.media_pool and find_bin(t.media_pool, true)
  for _, clip in pairs(bin and api(bin, "GetClipList") or {}) do
    local name = is_clip(clip) and api(clip, "GetName")
    if name == song .. ".srt" or name == song .. " (Timeline).srt" then
      t.srt_items[#t.srt_items + 1] = clip
    end
  end
  t.srt_clips = #t.srt_items
  return t
end

-- What "Remove BeatAnalyzer markers" would delete, with the question for the window; deletes nothing.
function M.removal(clips, tl)
  local t = removal_targets(clips, tl)
  if t.markers + t.tracks + t.srt_clips == 0 then
    t.text = T("plugin.remove_nothing", { song = t.song })
  else
    t.text = T("plugin.remove_confirm", { song = t.song, markers = t.markers, tracks = t.tracks, srt = t.srt_clips })
  end
  return t
end

-- Delete it; markers set by hand stay.
function M.remove(clips, tl)
  local t = removal_targets(clips, tl)
  local done = { markers = 0, tracks = 0, srt_clips = 0 }
  for _, clip in ipairs(clips) do
    done.markers = done.markers + remove_own_markers(clip)
  end
  for _, item in ipairs(M.timeline_items(tl, clips)) do
    done.markers = done.markers + remove_own_markers(item)
  end
  if tl then
    done.tracks = delete_song_tracks(tl, t.song)
  end
  if #t.srt_items > 0 and api(t.media_pool, "DeleteClips", t.srt_items) then
    done.srt_clips = #t.srt_items
  end
  done.text = T("plugin.remove_done", { markers = done.markers, tracks = done.tracks, srt = done.srt_clips })
  log(done.text)
  return done
end

-- ─── Selection ───────────────────────────────────────────────────────────────
-- What the window shows before OK: the clip, warnings, the analysis program, the timeline.

M.LENGTH_TOLERANCE = 0.5   -- seconds between the length in the JSON and the clip before a warning

-- 222.4 -> "3:42"; with tenths: "3:42.4"
function M.fmt_length(seconds, tenths)
  local x = tonumber(seconds) or 0
  if tenths then
    local t = round(x * 10) / 10
    return string.format("%d:%04.1f", math.floor(t / 60), t - 60 * math.floor(t / 60))
  end
  local total = round(x)
  return string.format("%d:%02d", math.floor(total / 60), total % 60)
end

-- Frame number -> "01:00:10:00" at a whole frame rate (23.976 counts as 24).
function M.timecode(frame, fps)
  local f = round(tonumber(fps) or 25)
  local n = math.max(0, round(tonumber(frame) or 0))
  return string.format("%02d:%02d:%02d:%02d", math.floor(n / (3600 * f)), math.floor(n / (60 * f)) % 60,
                       math.floor(n / f) % 60, n % f)
end

-- "beat_this (CUDA, RTX 3080)", "beat_this (CPU)", "md_beat_this (CPU)", "librosa – <reason>" from the field
-- engine of the JSON.
function M.engine_text(engine)
  if type(engine) ~= "table" or not engine.id then
    return nil
  end
  if engine.id == "beat_this" or engine.id == "md_beat_this" then
    local parts = { string.upper(tostring(engine.device or "?")) }
    if type(engine.gpu) == "string" and engine.gpu ~= "" then
      parts[#parts + 1] = engine.gpu
    end
    return tostring(engine.id) .. " (" .. table.concat(parts, ", ") .. ")"
  end
  local key = tostring(engine.fallbackReason)
  if engine.requestedModel == "md_beat_this" and key == "not_installed" then
    key = "md_not_installed"   -- md_beat_this was chosen but is not installed
  end
  local reason = engine.fallbackReason and lookup("plugin.reason_" .. key)
  return tostring(engine.id) .. (reason and (" – " .. reason) or "")
end

-- Length of a media pool clip in seconds: from "Frames", else from the timecode "Duration" (Resolve 21.2 gives
-- no "Frames" for audio clips). fallback_fps: frame rate of the project when the clip has none.
local function clip_seconds(clip, fallback_fps)
  local fps = exact_fps(parse_fps(api(clip, "GetClipProperty", "FPS")) or fallback_fps or 25)
  local frames = tonumber(api(clip, "GetClipProperty", "Frames"))
  if frames and frames > 0 then
    return frames / fps
  end
  local h, m, sec, f = tostring(api(clip, "GetClipProperty", "Duration") or ""):match("^(%d+):(%d+):(%d+)[:;](%d+)$")
  if not h then
    return nil
  end
  return tonumber(h) * 3600 + tonumber(m) * 60 + tonumber(sec) + tonumber(f) / round(fps)
end

-- Everything the window needs to know about a marker JSON before OK. info.ok = OK may be pressed.
-- Resolve plays MP3 files without dropping the encoder delay at the start (≈ 50 ms, measured in test 0.2.2);
-- BeatAnalyzer drops it, so markers on an MP3 clip lie that much before the audible beat.
function M.is_mp3(name)
  return tostring(name or ""):lower():match("%.mp3$") ~= nil
end

function M.prepare(path)
  local info = { ok = false, warnings = {} }
  local text = read_file(path)
  if not text then
    info.error = T("plugin.msg_cannot_read", { path = tostring(path) })
    return info
  end
  local okj, data = pcall(json_decode, text)
  if not okj then
    info.error = tostring(data)
    return info
  end
  local markers, err = validate(data)
  if not markers then
    info.error = err
    return info
  end
  info.data = data
  info.file_name = tostring(data.fileName or "")
  info.song = (info.file_name:gsub("%.[^%.]*$", ""))
  info.engine = M.engine_text(data.engine)
  info.engine = info.engine and T("plugin.engine", { engine = info.engine }) or T("plugin.engine_unknown")
  local pm = api(resolve, "GetProjectManager")
  local project = pm and api(pm, "GetCurrentProject") or nil
  if not project then
    info.error = T("plugin.msg_no_project")
    return info
  end
  local clips, how = target_clips(api(project, "GetMediaPool"), info.file_name)
  info.clips, info.how = clips, how
  if #clips == 0 then
    info.error = T("plugin.msg_no_clip", { file = info.file_name })
    return info
  end
  local names = {}
  for _, clip in ipairs(clips) do
    names[#names + 1] = tostring(api(clip, "GetName") or "?")
  end
  local seconds = clip_seconds(clips[1], parse_fps(api(project, "GetSetting", "timelineFrameRate")))
  info.clip_text = T("plugin.clip_found", { names = table.concat(names, ", "),
                                            length = seconds and M.fmt_length(seconds) or "?" })
  if how == "selection" and info.file_name ~= "" then
    for _, clip in ipairs(clips) do
      if tostring(api(clip, "GetClipProperty", "File Name") or "") ~= info.file_name then
        info.warnings[#info.warnings + 1] = T("plugin.warn_other_file", { file = info.file_name })
        break
      end
    end
  end
  info.notes = {}
  for _, clip in ipairs(clips) do
    if M.is_mp3(api(clip, "GetClipProperty", "File Name")) then
      local off = tonumber(data.resolveOffset)
      if off and off > 0 then   -- shown before OK (test 0.2.4: the correction was not visible on this way)
        info.notes[#info.notes + 1] = T("plugin.note_mp3_json", { ms = fmt_num(off * 1000, 0) })
      elseif off then   -- checked by the server: this MP3 has no encoder delay frame, Resolve plays it on time
        info.notes[#info.notes + 1] = T("plugin.note_mp3_json_zero")
      else
        info.warnings[#info.warnings + 1] = T("plugin.warn_mp3")   -- older JSON or browser analysis: no offset
      end
      break
    end
  end
  local json_seconds = tonumber(data.duration)
  if seconds and json_seconds and math.abs(seconds - json_seconds) >= M.LENGTH_TOLERANCE then
    local tenths = M.fmt_length(seconds) == M.fmt_length(json_seconds)   -- never "(0:20) ... (0:20)"
    info.warnings[#info.warnings + 1] = T("plugin.warn_length", { clip = M.fmt_length(seconds, tenths),
                                                                   json = M.fmt_length(json_seconds, tenths) })
  end
  info.ok = true
  return info
end

-- Where the song lies in a timeline: state "none" (no timeline), "absent" or "present" with track and timecode.
function M.timeline_info(tl, clips)
  if not tl then
    return { state = "none" }
  end
  local name = tostring(api(tl, "GetName") or "?")
  local item, track = first_use(tl, clips or {})
  local items = #M.timeline_items(tl, clips or {})
  local tracks = {}
  for _, g in ipairs(song_tracks(tl, clips or {})) do
    tracks[#tracks + 1] = "A" .. g.track
  end
  if not item then
    return { state = "absent", name = name, items = items }
  end
  local fps = parse_fps(api(tl, "GetSetting", "timelineFrameRate")) or 25
  return { state = "present", name = name, track = track, tc = M.timecode(api(item, "GetStart"), fps),
           items = items, tracks = table.concat(tracks, ", ") }
end

-- The text under the tick box "Subtitle Track in the Timeline".
-- Short text for the window and the long one for its tooltip (the user found the long one too much).
function M.explanation(checked, tinfo, song)
  local long = M.subtitle_explanation(checked, tinfo, song)
  local short
  if not checked then
    short = T("plugin.explain_short_off")
  elseif tinfo.state == "present" then
    short = T("plugin.explain_short_present", { tracks = tinfo.tracks or ("A" .. tostring(tinfo.track)) })
  elseif tinfo.state == "absent" then
    short = T("plugin.explain_short_absent", { timeline = tinfo.name })
  else
    short = T("plugin.explain_short_no_timeline")
  end
  if (tonumber(tinfo.items) or 0) > 0 then
    long = long .. " " .. T("plugin.explain_tl_markers", { items = tinfo.items })
    short = short .. " " .. T("plugin.explain_short_tl_markers", { items = tinfo.items })
  end
  return short, long
end

function M.subtitle_explanation(checked, tinfo, song)
  if not checked then
    return T("plugin.explain_off")
  end
  if tinfo.state == "present" and type(tinfo.tracks) == "string" and tinfo.tracks:find(",") then
    local first = tinfo.tracks:match("^(A%d+)")
    return T("plugin.explain_present_many", { timeline = tinfo.name, tracks = tinfo.tracks,
                                              track_name = TRACK_PREFIX .. tostring(song or "") .. " (" .. first .. ")" })
  end
  if tinfo.state == "present" then
    return T("plugin.explain_present", { timeline = tinfo.name, track = tinfo.track, tc = tinfo.tc,
                                         track_name = TRACK_PREFIX .. tostring(song or "") })
  elseif tinfo.state == "absent" then
    return T("plugin.explain_absent", { timeline = tinfo.name })
  end
  return T("plugin.explain_no_timeline")
end

-- ─── Run in steps ────────────────────────────────────────────────────────────
-- M.start() reads and checks everything and fixes project, clips and timeline; job:step() then does a small
-- part (at most CHUNK markers), so the window stays responsive. M.apply() runs all steps at once.

M.CHUNK = 20

local Job = {}
Job.__index = Job

function M.start(path, opts)
  opts = opts or {}
  local info = M.prepare(path)
  if not info.ok then
    return nil, info.error
  end
  local data, clips, how, file_name = info.data, info.clips, info.how, info.file_name
  if opts.clips then   -- the clip analysed from Resolve, fixed at OK (the selection may have changed)
    clips, how = opts.clips, "analysis"
  end
  local markers = data.markers
  local pm = api(resolve, "GetProjectManager")
  local project = api(pm, "GetCurrentProject")
  local media_pool = api(project, "GetMediaPool")
  log(string.format("%d clip(s) by %s, %d markers in %s", #clips, how, #markers, path))
  -- MP3: Resolve plays the Xing frame and the encoder delay first, the analysis dropped them: move every beat
  -- by resolveOffset (markers and subtitles), only when the clip really is an MP3
  local shift = tonumber(data.resolveOffset) or 0
  if shift > 0 and shift < 0.5 and clips[1] and M.is_mp3(api(clips[1], "GetClipProperty", "File Name") or file_name) then
    for _, m in ipairs(markers) do
      m.time = (tonumber(m.time) or 0) + shift
    end
    log(string.format("MP3: markers moved by %.1f ms", shift * 1000))
  else
    shift = 0
  end

  local job = setmetatable({
    path = path, opts = opts, data = data, markers = markers, project = project, media_pool = media_pool,
    file_name = file_name, clips = clips, how = how, phase = "markers", marked = 0, total = 0, mp3_shift = shift,
    clip_index = 1, marker_index = 1, added = 0, skipped = 0, names = {},
    fallback_fps = parse_fps(api(project, "GetSetting", "timelineFrameRate")) or 25,
  }, Job)
  for _, m in ipairs(markers) do
    if M.marker_color(m, opts.colors) then
      job.total = job.total + 1
    end
  end
  job.total = job.total * #clips
  local _, srt_name = srt_path("", file_name, path)
  job.srt_name = srt_name
  job.base = (srt_name:gsub("%.srt$", ""))
  job.track_name = TRACK_PREFIX .. job.base
  if opts.timeline == false then
    job.timeline = nil
  elseif opts.timeline ~= nil then
    job.timeline = opts.timeline
  else
    job.timeline = api(project, "GetCurrentTimeline")
  end
  job.timeline_name = job.timeline and tostring(api(job.timeline, "GetName") or "?") or nil
  -- markers on the song's clips in the timeline: always, also without the subtitle track
  local marker_tl = opts.marker_timeline or job.timeline
    or (opts.timeline == false and api(project, "GetCurrentTimeline")) or nil
  job.tl_items = M.timeline_items(marker_tl, clips)
  job.tl_name = marker_tl and tostring(api(marker_tl, "GetName") or "?") or nil
  job.tl_fps = exact_fps(parse_fps(marker_tl and api(marker_tl, "GetSetting", "timelineFrameRate"))
                         or job.fallback_fps)
  job.tl_index, job.tl_marker_index, job.tl_added = 1, 1, 0
  job.total = job.total + (#clips > 0 and job.total / #clips or 0) * #job.tl_items
  job.step = function() return Job.step(job) end   -- works as job:step() and as job.step() (tests)
  return job, nil
end

-- Up to CHUNK markers; the first step on a clip removes the markers of the last run.
function Job:mark_some()
  local budget = M.CHUNK
  while budget > 0 and self.clip_index <= #self.clips do
    local clip = self.clips[self.clip_index]
    if self.marker_index == 1 then
      self.cur = {
        fps = exact_fps(parse_fps(api(clip, "GetClipProperty", "FPS")) or self.fallback_fps),
        frames = tonumber(api(clip, "GetClipProperty", "Frames")),
        removed = remove_own_markers(clip), added = 0, skipped = 0,
      }
    end
    local c = self.cur
    while budget > 0 and self.marker_index <= #self.markers do
      local m = self.markers[self.marker_index]
      self.marker_index = self.marker_index + 1
      local color = M.marker_color(m, self.opts.colors)
      if color then
        budget = budget - 1
        self.marked = self.marked + 1
        local frame = round((tonumber(m.time) or -1) * c.fps)
        if frame < 0 or (c.frames and frame >= c.frames) then
          c.skipped = c.skipped + 1
        else
          local name = M.marker_name(m)
          local note = M.marker_note(m, c.added == 0 and self.data or nil)   -- first marker: "BeatAnalyzer x.y.z"
          if api(clip, "AddMarker", frame, color, name, note, 1, MARKER_TAG) then
            c.added = c.added + 1
          else
            c.skipped = c.skipped + 1
          end
        end
      end
    end
    if self.marker_index > #self.markers then
      log(string.format("%s: %d markers added, %d skipped, %d old removed (%.3f fps)",
          tostring(api(clip, "GetName") or "?"), c.added, c.skipped, c.removed, c.fps))
      self.added, self.skipped = self.added + c.added, self.skipped + c.skipped
      self.names[#self.names + 1] = tostring(api(clip, "GetName") or "?")
      self.clip_index, self.marker_index = self.clip_index + 1, 1
    end
  end
  if self.clip_index > #self.clips then
    local msg = T("plugin.msg_markers", { n = self.added, clips = #self.clips, names = table.concat(self.names, ", ") })
    if (self.mp3_shift or 0) > 0 then
      msg = msg .. "\n" .. T("plugin.msg_mp3_shift", { ms = fmt_num(self.mp3_shift * 1000, 0) })
    end
    if self.skipped > 0 then
      msg = msg .. "\n" .. T("plugin.msg_skipped", { n = self.skipped })
    end
    if self.how == "selection" and self.file_name ~= "" then
      for _, clip in ipairs(self.clips) do
        if tostring(api(clip, "GetClipProperty", "File Name") or "") ~= self.file_name then
          msg = msg .. "\n" .. T("plugin.msg_other_file", { file = self.file_name })
          break
        end
      end
    end
    self.msg = msg
    self.phase = #self.tl_items > 0 and "tl_markers" or "subtitles"
  end
end

-- Markers on the song's clips in the timeline, up to CHUNK per step. Frames count from the start of the
-- timeline clip; a clip trimmed at the start (left offset) shows only the beats of its visible part.
function Job:mark_timeline()
  local budget = M.CHUNK
  while budget > 0 and self.tl_index <= #self.tl_items do
    local item = self.tl_items[self.tl_index]
    if self.tl_marker_index == 1 then
      self.tl_cur = {
        left = tonumber(api(item, "GetLeftOffset")) or 0,
        duration = tonumber(api(item, "GetDuration")),
        removed = remove_own_markers(item),
      }
      log(string.format("Timeline clip %d: left offset %s, duration %s frames", self.tl_index,
          tostring(self.tl_cur.left), tostring(self.tl_cur.duration)))
    end
    local c = self.tl_cur
    while budget > 0 and self.tl_marker_index <= #self.markers do
      local m = self.markers[self.tl_marker_index]
      self.tl_marker_index = self.tl_marker_index + 1
      local color = M.marker_color(m, self.opts.colors)
      if color then
        budget = budget - 1
        self.marked = self.marked + 1
        -- Resolve counts the markers of a timeline clip from the start of the source file (test 0.1.7: subtracting
        -- the left offset shifted them on a trimmed clip); only the visible part gets markers
        local frame = round((tonumber(m.time) or -1) * self.tl_fps)
        if frame >= c.left and (not c.duration or frame < c.left + c.duration) then
          local name = M.marker_name(m)
          local note = M.marker_note(m, not c.noted and self.data or nil)   -- first marker: "BeatAnalyzer x.y.z"
          if api(item, "AddMarker", frame, color, name, note, 1, MARKER_TAG) then
            c.noted = true
            self.tl_added = self.tl_added + 1
          end
        end
      end
    end
    if self.tl_marker_index > #self.markers then
      self.tl_index, self.tl_marker_index = self.tl_index + 1, 1
    end
  end
  if self.tl_index > #self.tl_items then
    self.msg = self.msg .. "\n" .. T("plugin.msg_tl_markers", { n = self.tl_added, items = #self.tl_items,
                                                                timeline = self.tl_name or "?" })
    self.phase = "subtitles"
  end
end

-- Subtitles: written into a working folder, imported, then file and folder are deleted. A file whose import
-- failed stays, so it can be imported by hand.
function Job:subtitles()
  self.dir = self.opts.work_dir or M.work_dir()
  self.keep = false
  local srt_file = srt_path(self.dir or "", self.file_name, self.path)
  if not self.dir then
    self.msg = self.msg .. "\n" .. T("plugin.msg_no_work_dir", { path = work_base() })
  elseif not write_file(srt_file, build_srt(self.data)) then
    self.msg = self.msg .. "\n" .. T("plugin.msg_srt_write", { path = srt_file })
  else
    local item, ierr = import_subtitles(self.media_pool, srt_file, self.srt_name)
    if item then
      self.msg = self.msg .. "\n" .. T("plugin.msg_srt_ok", { srt = self.srt_name, bin = BIN_NAME })
      remove_file(srt_file)
    else
      self.msg = self.msg .. "\n" .. T("plugin.msg_srt_import", { why = tostring(ierr), path = srt_file })
      self.keep = true
    end
  end
  self.phase = "timeline"
end

-- The subtitle track goes into the timeline that was open at the start, even if another one is open now.
function Job:timeline_step()
  local tl = self.timeline
  if tl and self.dir then
    local before = api(self.project, "GetCurrentTimeline")
    api(self.project, "SetCurrentTimeline", tl)
    local line, kept = place_in_timeline(self.media_pool, tl, self.data, self.clips, self.dir, self.base)
    if line then
      self.msg = self.msg .. "\n" .. line
    end
    self.keep = self.keep or kept == true
    if before and before ~= tl then   -- the user had opened another timeline meanwhile: show it again
      api(self.project, "SetCurrentTimeline", before)
    end
  end
  if self.dir and not self.keep then
    remove_dir(self.dir)
  end
  self.ok = self.added > 0
  self.phase = "done"
end

-- One step; true when the job is done.
function Job:step()
  if self.phase == "markers" then
    self:mark_some()
  elseif self.phase == "tl_markers" then
    self:mark_timeline()
  elseif self.phase == "subtitles" then
    self:subtitles()
  elseif self.phase == "timeline" then
    self:timeline_step()
  end
  return self.phase == "done"
end

-- Apply a marker JSON file in one go. Returns true/false and a message for the user.
function M.apply(path, opts)
  local job, err = M.start(path, opts)
  if not job then
    return false, err
  end
  while not job:step() do
  end
  return job.ok, job.msg
end

-- ─── Settings of the window ──────────────────────────────────────────────────
-- <BeatAnalyzer>/resolve_temp/plugin.txt, lines key=value. Without a known BeatAnalyzer folder nothing is kept.

local COLOR_SLOTS = { "downbeat", "beat2", "beat3", "beat4", "other", "cue", "section" }

function M.settings_path()
  return BA.home and (BA.home .. SEP .. "resolve_temp" .. SEP .. "plugin.txt") or nil
end

function M.load_settings()
  local s = { json_dir = "", timeline = true, colors_open = false, colors = {}, geometry = nil, way = "analyze",
              smooth = 90, model = "beat_this" }
  for _, slot in ipairs(COLOR_SLOTS) do
    s.colors[slot] = M.DEFAULT_COLORS[slot]
  end
  local path = M.settings_path()
  local text = path and read_file(path)
  for line in tostring(text or ""):gmatch("[^\r\n]+") do
    local key, value = line:match("^([%w_]+)=(.*)$")
    if key == "json_dir" then
      s.json_dir = value
    elseif key == "timeline" or key == "colors_open" then
      if value == "1" or value == "0" then
        s[key] = value == "1"
      end
    elseif key == "way" and (value == "json" or value == "analyze") then
      s.way = value
    elseif key == "model" and (value == "beat_this" or value == "md_beat_this") then
      s.model = value   -- the licence check for md_beat_this is not saved: it is asked in every window
    elseif key == "smooth" and tonumber(value) then
      s.smooth = math.max(0, math.min(100, math.floor(tonumber(value))))
    elseif key == "geometry" then
      local x, y, w, h = value:match("^(-?%d+),(-?%d+),(%d+),(%d+)$")
      if x then
        s.geometry = { tonumber(x), tonumber(y), tonumber(w), tonumber(h) }
      end
    elseif key and key:match("^color_") then
      local slot = key:sub(7)
      if s.colors[slot] and (COLOR_OK[value] or value == M.NO_MARKER) then
        s.colors[slot] = value
      end
    end
  end
  return s
end

function M.save_settings(s)
  local path = M.settings_path()
  if not path then
    return false
  end
  make_dir(BA.home .. SEP .. "resolve_temp")
  local lines = { "# BeatAnalyzer - settings of the Resolve window",
                  "json_dir=" .. tostring(s.json_dir or ""):gsub("[\r\n]", ""),
                  "timeline=" .. (s.timeline and "1" or "0"),
                  "colors_open=" .. (s.colors_open and "1" or "0"),
                  "way=" .. (s.way == "analyze" and "analyze" or "json"),
                  "smooth=" .. tostring(math.floor(tonumber(s.smooth) or 90)),
                  "model=" .. (s.model == "md_beat_this" and "md_beat_this" or "beat_this") }
  for _, slot in ipairs(COLOR_SLOTS) do
    lines[#lines + 1] = "color_" .. slot .. "=" .. tostring((s.colors or {})[slot] or M.DEFAULT_COLORS[slot])
  end
  local g = s.geometry
  if type(g) == "table" and tonumber(g[1]) and tonumber(g[4]) then
    lines[#lines + 1] = string.format("geometry=%d,%d,%d,%d", g[1], g[2], g[3], g[4])
  end
  return write_file(path, table.concat(lines, "\n") .. "\n")
end

-- ─── Dialogs ─────────────────────────────────────────────────────────────────

-- Master layout: flat leaf rows in root VGroup (never set Hidden on VGroup/HGroup in Resolve
-- UIManager), section header bars (#SecSource/#SecOutput), 2-button model selector, explicit
-- per-button StyleSheets (since Resolve ignores parent #ID button selectors), and live swatches.

local TICK_MS = 50
local WIN_MIN = { 660, 360 }
local WIN_HEIGHT = 440
local LINE_PX, CHAR_PX = 19, 8
local REFRESH_TICKS = 20
local LABEL_WIDTH = 86

local COLOR_IDS = { cue = "ColorCue", section = "ColorSection",
                    downbeat = "ColorDownbeat", beat2 = "ColorBeat2", beat3 = "ColorBeat3", beat4 = "ColorBeat4",
                    other = "ColorOther" }

-- Swatches in the colours of Resolve's own marker menu (taken from it, test 0.6.1 F7), so the window shows what
-- Resolve will set.
local SWATCH_HEX = {
  Blue = "#007FE3", Cyan = "#00CED0", Green = "#00AD00", Yellow = "#F09D00",
  Red = "#E12401", Pink = "#FF44C8", Purple = "#9013FE", Fuchsia = "#C02E6F",
  Rose = "#FFA1B9", Lavender = "#A193C8", Sky = "#92E2FD", Mint = "#72DB00",
  Lemon = "#DCE95A", Sand = "#C4915E", Cocoa = "#6E5143", Cream = "#F5EBE1",
}
M.SWATCH_HEX = SWATCH_HEX

-- Colours of the web app (Tailwind; the same meaning gets the same colour in both):
--   slate = surface and text, cyan = main action / chosen / note (beat_this, MP3), amber = licence of
--   md_beat_this, rose = remove / error, emerald = done. Resolve's marker colours (SWATCH_HEX) are Resolve's own.
local C = {
  slate950 = "#020617", slate900 = "#0F172A", slate800 = "#1E293B", slate700 = "#334155", slate600 = "#475569",
  slate500 = "#64748B", slate400 = "#94A3B8", slate300 = "#CBD5E1", slate200 = "#E2E8F0", slate100 = "#F1F5F9",
  cyan950 = "#083344", cyan800 = "#155E75", cyan500 = "#06B6D4", cyan400 = "#22D3EE", cyan300 = "#67E8F9",
  cyan200 = "#A5F3FC",
  amber500 = "#F59E0B", amber400 = "#FBBF24", amber200 = "#FDE68A",
  rose600 = "#E11D48", rose500 = "#F43F5E", rose300 = "#FDA4AF",
  emerald300 = "#6EE7B7",
  -- web app tints (colour/alpha over slate-900, as the browser mixes them)
  cyanTint = "#0D2133",     -- bg-cyan-950/35 (chosen beat_this tile)
  cyanNoteBg = "#0C2234",   -- bg-cyan-950/40 (MP3 note)
  cyanNoteBd = "#134257",   -- border-cyan-800/60
  amberTint = "#1F181E",    -- bg-amber-950/30 (chosen md_beat_this tile)
  amberNoteBg = "#22181C",  -- bg-amber-950/35 (licence notice)
  amberNoteBd = "#885114",  -- border-amber-600/60
  roseNoteBg = "#2E0F1F",   -- bg-rose-950/50 (error)
  roseNoteBd = "#7F1D3A",   -- border-rose-800/80
  emeraldBg = "#0A2A2A",    -- bg-emerald-950/50 (done)
  emeraldBd = "#0F5C4A",    -- border-emerald-800/60
}

local function btn_css(bg, fg, border, hover_bg, bold)
  return "QPushButton { background-color: " .. bg .. "; color: " .. fg .. "; border: 1px solid " .. border
    .. "; border-radius: 6px; padding: 6px 14px;" .. (bold and " font-weight: bold;" or "") .. " }"
    .. (hover_bg and (" QPushButton:hover { background-color: " .. hover_bg .. "; }") or "")
end

-- main action (web app: bg-cyan-500, text-slate-950, hover cyan-400)
local PRIMARY_BTN_CSS = btn_css(C.cyan500, C.slate950, C.cyan500, C.cyan400, true)
-- secondary (web app: bg-slate-800, border-slate-700, hover slate-700)
local NEUTRAL_BTN_CSS = btn_css(C.slate800, C.slate200, C.slate700, C.slate700, false)
local DISABLED_BTN_CSS = btn_css(C.slate900, C.slate600, C.slate800, nil, false)
-- remove (web app: rose)
local DANGER_BTN_CSS = btn_css(C.rose600, "#FFFFFF", C.rose600, C.rose500, true)

local function tile_css(bg, fg, border, width, hover_bg, bold)
  return "QPushButton { background-color: " .. bg .. "; color: " .. fg .. "; border: " .. width .. "px solid "
    .. border .. "; border-radius: 8px; padding: 6px 12px;" .. (bold and " font-weight: bold;" or "") .. " }"
    .. (hover_bg and (" QPushButton:hover { background-color: " .. hover_bg .. "; border-color: " .. C.slate600
                      .. "; }") or "")
end

-- model tiles as in the web app: beat_this chosen = cyan, md_beat_this chosen = amber, not chosen = slate
local MODEL_BT_ACTIVE_CSS = tile_css(C.cyanTint, C.slate100, C.cyan500, 2, nil, true)
local MODEL_MD_ACTIVE_CSS = tile_css(C.amberTint, C.slate100, C.amber500, 2, nil, true)
local MODEL_IDLE_CSS = tile_css(C.slate900, C.slate400, C.slate700, 1, C.slate800, false)
local MODEL_MUTED_SELECTED_CSS = tile_css(C.slate800, C.slate400, C.slate600, 1, nil, false)
local MODEL_MUTED_IDLE_CSS = tile_css(C.slate900, C.slate600, C.slate800, 1, nil, false)

local function tab_css(sel_bg, sel_fg, sel_border, fg)
  return "QTabBar { font-size: 12px; } QTabBar::tab { background-color: " .. C.slate900 .. "; color: " .. fg
    .. "; border: 1px solid " .. C.slate800 .. "; padding: 6px 18px; min-width: 155px; margin-right: 6px;"
    .. " border-radius: 6px; } QTabBar::tab:hover { color: " .. C.slate200 .. "; border-color: " .. C.slate700
    .. "; } QTabBar::tab:selected { background-color: " .. sel_bg .. "; color: " .. sel_fg .. "; border: 1px solid "
    .. sel_border .. "; }"
end

-- the two ways (web app: chosen tab bg-cyan-950, text-cyan-300, border-cyan-800). Not bold: Qt sizes a tab for
-- the normal font, so bold text was cut off ("usgewählten Clip analysierei", Resolve test 0.2.14).
local TAB_ACTIVE_CSS = tab_css(C.cyan950, C.cyan300, C.cyan800, C.slate400)
local TAB_MUTED_CSS = tab_css(C.slate800, C.slate400, C.slate700, C.slate600)

local SECTION_HDR_CSS = "background-color: " .. C.slate800 .. "; border-top: 1px solid " .. C.slate700
  .. "; border-bottom: 1px solid " .. C.slate800 .. "; padding: 4px 8px; color: " .. C.slate300
  .. "; font-weight: bold; font-size: 11px;"

local function box_css(bg, border, fg)
  return "background-color: " .. bg .. "; border: 1px solid " .. border .. "; border-radius: 6px; padding: 5px 10px;"
    .. " color: " .. fg .. ";"
end
local NOTE_CSS = box_css(C.cyanNoteBg, C.cyanNoteBd, C.cyan200)       -- note, e.g. MP3
local LICENCE_CSS = box_css(C.amberNoteBg, C.amberNoteBd, C.amber200) -- licence of md_beat_this, warnings
local STATUS_CSS = box_css(C.slate950, C.slate800, C.slate300)        -- tasks and messages
local DONE_CSS = box_css(C.emeraldBg, C.emeraldBd, C.emerald300)      -- result of the work
local ERROR_CSS = box_css(C.roseNoteBg, C.roseNoteBd, C.rose300)      -- error, cancelled

local CLIP_OK_CSS = "color: " .. C.slate100 .. "; font-weight: bold;"
local CLIP_BAD_CSS = "color: " .. C.rose300 .. "; font-weight: bold;"
local CLIP_NONE_CSS = "color: " .. C.slate400 .. "; font-weight: bold;"
local LABEL_CSS = "color: " .. C.slate400 .. ";"
local VALUE_CSS = "color: " .. C.slate200 .. ";"

local DIALOG_STYLE = "#BeatAnalyzerWin { background-color: " .. C.slate900 .. "; color: " .. C.slate200 .. "; }"

local function color_index(color)
  for i, c in ipairs(M.MARKER_COLORS) do
    if c == color then
      return i - 1
    end
  end
  return #M.MARKER_COLORS   -- the last entry: no marker
end

local function swatch_style(color)
  local hex = SWATCH_HEX[color]
  if hex then
    return "background-color: " .. hex .. "; border: 1px solid " .. C.slate600 .. "; border-radius: 2px;"
  end
  return "background-color: " .. C.slate800 .. "; border: 1px dashed " .. C.slate600 .. "; border-radius: 2px;"
end

function M.main()
  log("BeatAnalyzer_Markers " .. VERSION)
  local bmd = rawget(_G, "bmd")
  if not (fu and fu.UIManager and bmd and bmd.UIDispatcher) then
    log("No window available.")
    return
  end
  local ui = fu.UIManager
  local disp = bmd.UIDispatcher(ui)
  local settings = M.load_settings()
  local S = { state = "select", ticks = 0, ok_ready = false, way_idx = settings.way == "json" and 1 or 0,
              model = (settings.model == "md_beat_this") and "md_beat_this" or "beat_this" }

  local BTN_ANALYZE = T("plugin.btn_analyze")
  local BTN_APPLY = T("plugin.btn_apply")
  local SEC_SOURCE = T("plugin.sec_source")
  local SEC_OUTPUT = T("plugin.sec_output")
  local MODEL_BT_TEXT = T("plugin.model_beat_this")
  local MODEL_MD_TEXT = T("plugin.model_md")

  local function section_header(id, title)
    return ui:Label({ ID = id, Text = title, Weight = 0, MinimumSize = { 0, 24 },
                      StyleSheet = SECTION_HDR_CSS })
  end

  local function h_divider(id)
    return ui:Label({ ID = id, Text = "", Weight = 0, MinimumSize = { 0, 1 }, MaximumSize = { 9999, 1 },
                      StyleSheet = "background-color: " .. C.slate800 .. ";" })
  end

  local function color_col(slot, label)
    local id = COLOR_IDS[slot]
    return ui:VGroup({ Weight = 1, Spacing = 4,
      ui:HGroup({ Weight = 0, Spacing = 5,
        ui:Label({ ID = id .. "Swatch", Text = "", Weight = 0, MinimumSize = { 10, 10 }, MaximumSize = { 10, 10 } }),
        ui:Label({ ID = id .. "Label", Text = label, Weight = 1,
                   StyleSheet = "color: " .. C.slate300 .. "; font-size: 11px;" }) }),
      ui:ComboBox({ ID = id, Weight = 0 }) })
  end

  local function mini_swatch(slot)
    return ui:Label({ ID = COLOR_IDS[slot] .. "Mini", Text = "", Weight = 0,
                      MinimumSize = { 9, 9 }, MaximumSize = { 9, 9 } })
  end

  local saved = settings.geometry or { 300, 150 }
  local geometry = { saved[1], saved[2], WIN_MIN[1], WIN_HEIGHT }
  local initial_way_idx = settings.way == "json" and 1 or 0   -- the window opens on the way used last

  local win = disp:AddWindow({ ID = "BeatAnalyzerWin", WindowTitle = T("plugin.title", { version = VERSION }),
                              Geometry = geometry, MinimumSize = WIN_MIN, StyleSheet = DIALOG_STYLE },
    ui:VGroup({ Spacing = 6,
      -- Resolve ignores the requested width (and Resize) and sizes the window by its content, so the width changed
      -- with every song name. An empty row with a minimum width holds the window at least that wide.
      ui:Label({ ID = "WidthGuard", Text = "", Weight = 0, MinimumSize = { WIN_MIN[1] - 20, 1 } }),

      -- 0. Pinned Context Overview (Clip + Timeline at a glance)
      ui:HGroup({ Weight = 0, Spacing = 10,
        ui:Label({ ID = "ClipInfo", Text = "", WordWrap = true, Weight = 1, MinimumSize = { 0, 20 },
                   StyleSheet = CLIP_OK_CSS }),
        ui:Label({ ID = "OverviewTimeline", Text = "", Weight = 0,
                   Alignment = { AlignRight = true, AlignVCenter = true },
                   StyleSheet = LABEL_CSS }) }),

      -- 1. Source & Analysis Model Section Header + Tabs
      section_header("SecSource", SEC_SOURCE),

      ui:TabBar({ ID = "WayTabs", Weight = 0, Expanding = false, DrawBase = false, UsesScrollButtons = false,
                  StyleSheet = TAB_ACTIVE_CSS }),

      -- Analyse Mode Controls (leaf widgets toggled via Hidden; never hide VGroup/HGroup)
      ui:HGroup({ Weight = 0, Spacing = 8,
        ui:Button({ ID = "ModelBeatThis", Text = MODEL_BT_TEXT, Weight = 1, MinimumSize = { 0, 44 },
                    ToolTip = T("plugin.model_tip"), StyleSheet = MODEL_BT_ACTIVE_CSS }),
        ui:Button({ ID = "ModelMd", Text = MODEL_MD_TEXT, Weight = 1, MinimumSize = { 0, 44 },
                    ToolTip = T("plugin.model_tip"), StyleSheet = MODEL_IDLE_CSS }) }),

      ui:Label({ ID = "MdNotice", Text = T("plugin.md_notice", { url = M.MD_URL }), WordWrap = true,
                 Weight = 0, MinimumSize = { 0, 48 }, MaximumSize = { 9999, 48 }, Hidden = true,
                 Alignment = { AlignVCenter = true, AlignLeft = true },
                 StyleSheet = LICENCE_CSS }),
      ui:CheckBox({ ID = "MdConfirm", Text = T("plugin.md_confirm"), Checked = false, Weight = 0,
                    MinimumSize = { 0, 24 }, Hidden = true }),

      ui:HGroup({ Weight = 0, Spacing = 8,
        ui:Label({ ID = "SmoothLabel", Text = T("plugin.smooth_label"), Weight = 0,
                   MinimumSize = { LABEL_WIDTH, 0 }, ToolTip = T("plugin.smooth_tip"),
                   StyleSheet = LABEL_CSS }),
        ui:Slider({ ID = "Smooth", Minimum = 0, Maximum = 100, Value = settings.smooth, Weight = 1,
                    ToolTip = T("plugin.smooth_tip") }),
        ui:Label({ ID = "SmoothValue", Text = "", Weight = 0, MinimumSize = { 50, 0 },
                   StyleSheet = VALUE_CSS }) }),

      -- Load JSON Controls (leaf widgets toggled via Hidden)
      ui:HGroup({ Weight = 0, Spacing = 8,
        ui:Label({ ID = "JsonLabel", Text = "JSON:", Weight = 0, Hidden = true,
                   MinimumSize = { LABEL_WIDTH, 0 }, StyleSheet = LABEL_CSS }),
        ui:Label({ ID = "JsonPath", Text = T("plugin.json_none"), WordWrap = true, Weight = 1,
                   MinimumSize = { 0, 20 }, Hidden = true }),
        ui:Button({ ID = "Choose", Text = T("plugin.btn_choose"), Weight = 0, Hidden = true,
                    StyleSheet = NEUTRAL_BTN_CSS }) }),
      ui:Label({ ID = "Engine", Text = "", WordWrap = true, Weight = 0, MinimumSize = { 0, 18 },
                 Hidden = true, StyleSheet = LABEL_CSS }),

      -- Dedicated Alert / Note Banner (leaf Label toggled via Hidden)
      ui:Label({ ID = "Warnings", Text = "", WordWrap = true, Weight = 0, MinimumSize = { 0, 28 }, Hidden = true,
                 Alignment = { AlignTop = true, AlignLeft = true },
                 StyleSheet = NOTE_CSS }),

      -- 2. Resolve Output Section Header + Controls
      section_header("SecOutput", SEC_OUTPUT),

      ui:CheckBox({ ID = "Timeline", Text = T("plugin.check_timeline"), Checked = settings.timeline, Weight = 0 }),
      ui:Label({ ID = "Explain", Text = "", WordWrap = true, Weight = 0, MinimumSize = { 0, 34 },
                 StyleSheet = LABEL_CSS }),
      h_divider("OutputDivider"),
      ui:HGroup({ Weight = 0, Spacing = 8,
        ui:CheckBox({ ID = "Colors", Text = T("plugin.check_colors"), Checked = settings.colors_open, Weight = 1 }),
        mini_swatch("downbeat"),
        mini_swatch("beat2"),
        mini_swatch("beat3"),
        mini_swatch("beat4"),
        mini_swatch("other"),
        -- a thin line before the two colours from the web app (the heading when open)
        ui:Label({ ID = "ColorWebAppMini", Text = "", Weight = 0, MinimumSize = { 1, 12 }, MaximumSize = { 1, 12 },
                   ToolTip = T("plugin.color_webapp"), StyleSheet = "background-color: " .. C.slate600 .. ";" }),
        mini_swatch("cue"),
        mini_swatch("section") }),
      ui:HGroup({ Weight = 0, Spacing = 8,
        color_col("downbeat", T("plugin.color_downbeat")),
        color_col("beat2", T("plugin.color_beat", { n = 2 })),
        color_col("beat3", T("plugin.color_beat", { n = 3 })),
        color_col("beat4", T("plugin.color_beat", { n = 4 })),
        color_col("other", T("plugin.color_other")) }),
      -- markers from the web app: cue marks and section changes (test 0.6.0: own, adjustable colours); one heading
      -- with a line over both columns says where they come from (test 0.6.2 G5)
      ui:HGroup({ Weight = 0, Spacing = 8,
        ui:VGroup({ Weight = 2, Spacing = 4,
          -- margin-top: half a line of air above the heading (test 0.6.3 B2: it stuck to the beat colours)
          ui:Label({ ID = "ColorWebAppHdr", Text = T("plugin.color_webapp"), Weight = 0, MinimumSize = { 0, 26 },
                     Alignment = { AlignBottom = true, AlignLeft = true },
                     StyleSheet = "color: " .. C.cyan300 .. "; font-size: 11px; margin-top: 8px; border-bottom: 1px solid "
                       .. C.cyan800 .. "; padding-bottom: 2px;" }),
          ui:HGroup({ Weight = 0, Spacing = 8,
            color_col("cue", T("plugin.color_cue")),
            color_col("section", T("plugin.color_section")) }) }),
        ui:Label({ Text = "", Weight = 3 }) }),

      -- 3. Dynamic Status / Progress Label (hidden when idle so there is zero dead space)
      ui:Label({ ID = "Status", Text = "", WordWrap = true, Weight = 0, MinimumSize = { 0, 44 }, Hidden = true,
                 Alignment = { AlignTop = true, AlignLeft = true },
                 StyleSheet = STATUS_CSS }),

      ui:VGap(0, 1),
      h_divider("DivFooter"),

      -- 4. Logical Action Bar (direct StyleSheets on every button)
      ui:HGroup({ Weight = 0, Spacing = 8,
        ui:Button({ ID = "Remove", Text = T("plugin.btn_remove"), Weight = 0, StyleSheet = NEUTRAL_BTN_CSS }),
        ui:Button({ ID = "RemoveYes", Text = T("plugin.btn_remove_yes"), Weight = 0, Hidden = true,
                    StyleSheet = DANGER_BTN_CSS }),
        ui:HGap(0, 1),
        ui:Button({ ID = "Cancel", Text = T("plugin.btn_cancel"), Weight = 0, Hidden = true,
                    StyleSheet = NEUTRAL_BTN_CSS }),
        ui:Button({ ID = "Close", Text = T("plugin.btn_close"), Weight = 0, StyleSheet = NEUTRAL_BTN_CSS }),
        ui:Button({ ID = "OK", Text = BTN_ANALYZE, Weight = 0, Enabled = false, StyleSheet = DISABLED_BTN_CSS }) }) }))
  local itm = win:GetItems()

  local function set(id, prop, value)
    pcall(function() itm[id][prop] = value end)
  end
  local function get(id, prop)
    local ok, v = pcall(function() return itm[id][prop] end)
    return ok and v or nil
  end

  local function window_width()
    local ok, g = pcall(function() return itm.BeatAnalyzerWin.Geometry end)
    return ok and type(g) == "table" and tonumber(g[3]) or geometry[3]
  end
  local function wrapped_lines(line, per_line)
    local n, used = 1, 0
    for word in line:gmatch("%S+") do
      local w = #word:gsub("[\128-\191]", "")
      if used == 0 then
        used = w
      elseif used + 1 + w <= per_line then
        used = used + 1 + w
      else
        n, used = n + 1, w
      end
      while used > per_line do
        n, used = n + 1, used - per_line
      end
    end
    return n
  end
  -- Resolve does not grow a wrapped label with its text: reserve the lines it needs at the current width.
  local function fit(id, text, min_lines, extra_inset, extra_h)
    local per_line = math.max(24, math.floor((window_width() - 90 - (extra_inset or 0)) / CHAR_PX))
    local lines = 0
    for line in (tostring(text or "") .. "\n"):gmatch("(.-)\n") do
      lines = lines + wrapped_lines(line, per_line)
    end
    set(id, "MinimumSize", { 0, math.max(min_lines or 1, lines) * LINE_PX + 8 + (extra_h or 0) })
  end
  local function fit_box(id, text, min_lines, char_px, extra_h)
    local per_line = math.max(32, math.floor((window_width() - 48) / (char_px or 6)))
    local lines = 0
    for line in (tostring(text or "") .. "\n"):gmatch("(.-)\n") do
      lines = lines + wrapped_lines(line, per_line)
    end
    local h = math.max(min_lines or 1, lines) * 18 + (extra_h or 14)
    set(id, "MinimumSize", { 0, h })
    set(id, "MaximumSize", { 9999, h })
  end
  -- The UIManager lays a window out for another size than it draws (WhisperX Workbench): lay out now
  -- and once more on the next tick.
  local function relayout()
    pcall(function() win:RecalcLayout() end)
    S.relayout = true
  end
  -- kind: nil = tasks and messages, "done" = green, "error" = red, "ask" = amber (question before removing)
  local function status(text, kind)
    local t = tostring(text or "")
    local empty = (t == "")
    set("Status", "Text", t)
    set("Status", "StyleSheet", kind == "done" and DONE_CSS or kind == "error" and ERROR_CSS
      or kind == "ask" and LICENCE_CSS or STATUS_CSS)
    set("Status", "Hidden", empty)
    if not empty then
      fit_box("Status", t, 1, 6.5, 16)
    end
    relayout()
  end

  pcall(function() itm.WayTabs:AddTab(T("plugin.way_analyze")) end)
  pcall(function() itm.WayTabs:AddTab(T("plugin.way_json")) end)
  set("WayTabs", "CurrentIndex", initial_way_idx)
  set("Status", "Hidden", true)
  set("Warnings", "Hidden", true)

  for slot, id in pairs(COLOR_IDS) do
    for _, c in ipairs(M.MARKER_COLORS) do
      pcall(function() itm[id]:AddItem(c) end)
    end
    pcall(function() itm[id]:AddItem(T("plugin.color_none")) end)
    set(id, "CurrentIndex", color_index(settings.colors[slot]))
  end

  local function read_colors()
    local colors = {}
    for slot, id in pairs(COLOR_IDS) do
      local i = tonumber(get(id, "CurrentIndex")) or 0
      colors[slot] = M.MARKER_COLORS[i + 1] or M.NO_MARKER
    end
    return colors
  end

  local function update_swatches()
    local colors = read_colors()
    for slot, id in pairs(COLOR_IDS) do
      local css = swatch_style(colors[slot])
      set(id .. "Swatch", "StyleSheet", css)
      set(id .. "Mini", "StyleSheet", css)
    end
  end

  local function colors_visibility()
    local open = get("Colors", "Checked") == true
    for _, id in pairs(COLOR_IDS) do
      set(id, "Hidden", not open)
      set(id .. "Label", "Hidden", not open)
      set(id .. "Swatch", "Hidden", not open)
      set(id .. "Mini", "Hidden", open)
    end
    set("ColorWebAppHdr", "Hidden", not open)
    set("ColorWebAppMini", "Hidden", open)
    relayout()
  end

  local function project()
    local pm = api(resolve, "GetProjectManager")
    return pm and api(pm, "GetCurrentProject") or nil
  end
  local function current_timeline()
    local p = project()
    return p and api(p, "GetCurrentTimeline") or nil
  end

  local function remove_clips()
    if S.info and S.info.ok then
      return S.info.clips
    end
    local p = project()
    return p and selected_clips(api(p, "GetMediaPool")) or {}
  end

  local function analyze_way()
    return (tonumber(get("WayTabs", "CurrentIndex")) or S.way_idx or 0) == 0
  end

  local function model_value()
    return S.model == "md_beat_this" and "md_beat_this" or "beat_this"
  end
  -- md_beat_this may only analyse once its licence box is ticked
  local function model_ok()
    return model_value() ~= "md_beat_this" or get("MdConfirm", "Checked") == true
  end

  local function sync_model_buttons()
    local is_md = (model_value() == "md_beat_this")
    local unlocked = (S.state == "select")
    set("ModelBeatThis", "Enabled", unlocked)
    set("ModelMd", "Enabled", unlocked)
    if unlocked then
      set("ModelBeatThis", "StyleSheet", (not is_md) and MODEL_BT_ACTIVE_CSS or MODEL_IDLE_CSS)
      set("ModelMd", "StyleSheet", is_md and MODEL_MD_ACTIVE_CSS or MODEL_IDLE_CSS)
    else
      set("ModelBeatThis", "StyleSheet", (not is_md) and MODEL_MUTED_SELECTED_CSS or MODEL_MUTED_IDLE_CSS)
      set("ModelMd", "StyleSheet", is_md and MODEL_MUTED_SELECTED_CSS or MODEL_MUTED_IDLE_CSS)
    end
  end

  -- Buttons per state; buttons that do not fit the state are hidden. Fusion's UIManager ignores a parent's #ID
  -- selector for buttons, so every button gets its own StyleSheet.
  local function sync_buttons()
    sync_model_buttons()
    if S.state ~= "select" then
      set("OK", "Enabled", false)   -- hidden outside "select"; also locked, so it can never start twice
    end
    local can_remove = (#remove_clips() > 0)
    if S.state == "select" then
      set("WayTabs", "StyleSheet", TAB_ACTIVE_CSS)
      set("Choose", "StyleSheet", NEUTRAL_BTN_CSS)
      set("Remove", "Hidden", false)
      set("Remove", "Enabled", can_remove)
      set("Remove", "StyleSheet", can_remove and NEUTRAL_BTN_CSS or DISABLED_BTN_CSS)
      set("RemoveYes", "Hidden", true)
      set("Cancel", "Hidden", true)
      set("Close", "Hidden", false)
      set("Close", "Enabled", true)
      set("Close", "Text", T("plugin.btn_close"))
      set("Close", "StyleSheet", NEUTRAL_BTN_CSS)
      local ready = (S.ok_ready == true)
      set("OK", "Hidden", false)
      set("OK", "Enabled", ready)
      set("OK", "Text", analyze_way() and BTN_ANALYZE or BTN_APPLY)
      set("OK", "StyleSheet", ready and PRIMARY_BTN_CSS or DISABLED_BTN_CSS)
    elseif S.state == "confirm" then
      set("WayTabs", "StyleSheet", TAB_MUTED_CSS)
      set("Choose", "StyleSheet", DISABLED_BTN_CSS)
      set("Remove", "Hidden", true)
      set("RemoveYes", "Hidden", false)
      set("RemoveYes", "Enabled", true)
      set("RemoveYes", "StyleSheet", DANGER_BTN_CSS)
      set("Cancel", "Hidden", true)
      set("OK", "Hidden", true)
      set("Close", "Hidden", false)
      set("Close", "Enabled", true)
      set("Close", "Text", T("plugin.btn_cancel"))
      set("Close", "StyleSheet", NEUTRAL_BTN_CSS)
    elseif S.state == "removing" then   -- the removal runs on the next ticks: everything locked, nothing to click
      set("WayTabs", "StyleSheet", TAB_MUTED_CSS)
      set("Choose", "StyleSheet", DISABLED_BTN_CSS)
      set("Remove", "Hidden", true)
      set("RemoveYes", "Hidden", false)
      set("RemoveYes", "Enabled", false)
      set("RemoveYes", "StyleSheet", DISABLED_BTN_CSS)
      set("Cancel", "Hidden", true)
      set("OK", "Hidden", true)
      set("Close", "Hidden", false)
      set("Close", "Enabled", false)
      set("Close", "Text", T("plugin.btn_cancel"))
      set("Close", "StyleSheet", DISABLED_BTN_CSS)
    elseif S.state == "analyze" then
      set("WayTabs", "StyleSheet", TAB_MUTED_CSS)
      set("Choose", "StyleSheet", DISABLED_BTN_CSS)
      set("Remove", "Hidden", false)
      set("Remove", "Enabled", false)
      set("Remove", "StyleSheet", DISABLED_BTN_CSS)
      set("RemoveYes", "Hidden", true)
      set("Close", "Hidden", true)
      set("OK", "Hidden", true)
      set("Cancel", "Hidden", false)
      set("Cancel", "Enabled", true)
      set("Cancel", "StyleSheet", NEUTRAL_BTN_CSS)
    elseif S.state == "work" then
      set("WayTabs", "StyleSheet", TAB_MUTED_CSS)
      set("Choose", "StyleSheet", DISABLED_BTN_CSS)
      set("Remove", "Hidden", false)
      set("Remove", "Enabled", false)
      set("Remove", "StyleSheet", DISABLED_BTN_CSS)
      set("RemoveYes", "Hidden", true)
      set("Cancel", "Hidden", true)
      set("OK", "Hidden", true)
      set("Close", "Hidden", false)
      set("Close", "Enabled", false)
      set("Close", "Text", T("plugin.btn_close"))
      set("Close", "StyleSheet", DISABLED_BTN_CSS)
    elseif S.state == "result" then
      set("WayTabs", "StyleSheet", TAB_MUTED_CSS)
      set("Choose", "StyleSheet", DISABLED_BTN_CSS)
      set("Remove", "Hidden", false)
      set("Remove", "Enabled", can_remove)
      set("Remove", "StyleSheet", can_remove and NEUTRAL_BTN_CSS or DISABLED_BTN_CSS)
      set("RemoveYes", "Hidden", true)
      set("Cancel", "Hidden", true)
      set("OK", "Hidden", true)
      set("Close", "Hidden", false)
      set("Close", "Enabled", true)
      set("Close", "Text", T("plugin.btn_ok"))
      set("Close", "StyleSheet", PRIMARY_BTN_CSS)
      set("Close", "Default", true)
    end
  end

  local function smooth_value()
    return math.max(0, math.min(100, math.floor(tonumber(get("Smooth", "Value")) or 90)))
  end

  local function show_way()
    local a = analyze_way()
    local md = a and model_value() == "md_beat_this"
    set("ModelBeatThis", "Hidden", not a)
    set("ModelMd", "Hidden", not a)
    set("MdNotice", "Hidden", not md)
    set("MdConfirm", "Hidden", not md)
    if md then
      fit_box("MdNotice", get("MdNotice", "Text"), 2, 6, 14)
    end
    for _, id in ipairs({ "SmoothLabel", "Smooth", "SmoothValue" }) do
      set(id, "Hidden", not a or md)
    end
    for _, id in ipairs({ "JsonLabel", "JsonPath", "Choose" }) do
      set(id, "Hidden", a)
    end
    local v = smooth_value()
    set("SmoothValue", "Text", v == 0 and T("plugin.smooth_off") or (tostring(v) .. " %"))
  end

  local function analysis_info()
    local info = { ok = false, warnings = {} }
    local p = project()
    if not p then
      info.error = T("plugin.msg_no_project")
      return info
    end
    local clip, reason = M.analysis_target(api(p, "GetMediaPool"))
    if not clip then
      info.error = T("plugin.analyze_" .. reason)
      return info
    end
    local seconds = clip_seconds(clip, parse_fps(api(p, "GetSetting", "timelineFrameRate")))
    info.clips, info.clip = { clip }, clip
    info.path = api(clip, "GetClipProperty", "File Path")
    info.song = (tostring(api(clip, "GetClipProperty", "File Name") or api(clip, "GetName") or "")
                 :gsub("%.[^%.]*$", ""))
    info.clip_text = T("plugin.clip_found", { names = tostring(api(clip, "GetName") or "?"),
                                              length = seconds and M.fmt_length(seconds) or "?" })
    info.ok = true
    return info
  end

  local function set_overview_timeline(tinfo)
    if tinfo and tinfo.state == "present" then
      set("OverviewTimeline", "Text", tinfo.name .. " · " .. (tinfo.tracks or ("A" .. tostring(tinfo.track))))
    elseif tinfo and tinfo.state == "absent" then
      set("OverviewTimeline", "Text", tinfo.name)
    else
      set("OverviewTimeline", "Text", "–")
    end
  end

  local function set_alert(lines_list, is_warning)
    if #lines_list == 0 then
      set("Warnings", "Hidden", true)
      return
    end
    local text = table.concat(lines_list, "\n")
    set("Warnings", "Text", text)
    set("Warnings", "StyleSheet", is_warning
      and LICENCE_CSS or NOTE_CSS)
    fit_box("Warnings", text, 1, 6, 14)
    set("Warnings", "Hidden", false)
  end

  local function refresh()
    if S.state ~= "select" then
      return
    end
    show_way()
    if analyze_way() then
      S.info = analysis_info()
      -- the hint for md_beat_this goes in at once: setting one line and then two every second made the window
      -- lay itself out twice per refresh (it twitched, Resolve test 0.2.1)
      local clip_text = S.info.ok and S.info.clip_text or (S.info.error or "")
      if S.info.ok and not model_ok() then
        clip_text = clip_text .. "\n" .. T("plugin.md_confirm_needed")
      end
      set("ClipInfo", "Text", clip_text)
      set("ClipInfo", "StyleSheet", (S.info.ok and model_ok())
        and CLIP_OK_CSS or CLIP_BAD_CSS)
      fit("ClipInfo", clip_text, 1, 120)
      local mp3 = S.info.ok and M.is_mp3(S.info.path)
      set_alert(mp3 and { T("plugin.note_mp3") } or {}, false)
      set("Engine", "Hidden", true)
      S.tinfo = M.timeline_info(current_timeline(), S.info.ok and S.info.clips or {})
      set_overview_timeline(S.tinfo)
      local explain, explain_tip = M.explanation(get("Timeline", "Checked"), S.tinfo, S.info.song)
      set("Explain", "Text", explain)
      set("Explain", "ToolTip", explain_tip)
      fit("Explain", explain, 2)
      relayout()
    elseif S.json then
      S.info = M.prepare(S.json)
      set("JsonPath", "Text", S.json:match("([^/\\]+)$") or S.json)
      set("JsonPath", "ToolTip", S.json)
      local clip_text = S.info.ok and S.info.clip_text or (S.info.error or "")
      set("ClipInfo", "Text", clip_text)
      set("ClipInfo", "StyleSheet", S.info.ok
        and CLIP_OK_CSS or CLIP_BAD_CSS)
      local alerts, has_warn = {}, false
      for _, w in ipairs(S.info.warnings or {}) do
        alerts[#alerts + 1] = "⚠ " .. w
        has_warn = true
      end
      for _, n in ipairs(S.info.notes or {}) do
        alerts[#alerts + 1] = n
      end
      set_alert(alerts, has_warn)
      set("Engine", "Text", S.info.engine or "")
      fit("Engine", S.info.engine or "")
      set("Engine", "Hidden", not S.info.engine)
      fit("JsonPath", get("JsonPath", "Text"), 1, 140)
      fit("ClipInfo", clip_text, 1, 120)
      S.tinfo = M.timeline_info(current_timeline(), S.info.ok and S.info.clips or {})
      set_overview_timeline(S.tinfo)
      local explain, explain_tip = M.explanation(get("Timeline", "Checked"), S.tinfo, S.info.song)
      set("Explain", "Text", explain)
      set("Explain", "ToolTip", explain_tip)
      fit("Explain", explain, 2)
      relayout()
    else
      S.info = nil
      set("JsonPath", "Text", T("plugin.json_none"))
      set("JsonPath", "ToolTip", "")
      set("ClipInfo", "Text", T("plugin.json_none"))
      set("ClipInfo", "StyleSheet", CLIP_NONE_CSS)
      set_alert({}, false)
      set("Engine", "Hidden", true)
      S.tinfo = M.timeline_info(current_timeline(), {})
      set_overview_timeline(S.tinfo)
      local explain, explain_tip = M.explanation(get("Timeline", "Checked"), S.tinfo, "")
      set("Explain", "Text", explain)
      set("Explain", "ToolTip", explain_tip)
      fit("Explain", explain, 2)
      relayout()
    end
    local ok = S.info ~= nil and S.info.ok == true
    if analyze_way() and not model_ok() then
      ok = false
    end
    if analyze_way() and ok and S.failed and S.failed.path == S.info.path and S.failed.model == model_value() then
      ok = false   -- this file failed with this model: only Close, another clip or another model (Resolve test 0.2.2)
    end
    S.ok_ready = ok
    sync_buttons()
  end

  local function lock(locked)
    for _, id in ipairs({ "WayTabs", "ModelBeatThis", "ModelMd", "MdConfirm", "Smooth", "Choose", "Timeline", "Colors" }) do
      set(id, "Enabled", not locked)
    end
    for _, id in pairs(COLOR_IDS) do
      set(id, "Enabled", not locked)
    end
    sync_buttons()
  end

  local function work_text()
    local job = S.job
    local order = { markers = 1, tl_markers = 1, subtitles = 2, timeline = 3, done = 4 }
    local now = order[job.phase] or 4
    local function mark(n)
      return n < now and "✓" or (n == now and "…" or "  ")
    end
    local lines = { T("plugin.tasks_title") }
    if S.analyzed then
      lines[#lines + 1] = "✓ " .. T("plugin.task_analyze")
    end
    lines[#lines + 1] = string.format("%s %s   %d / %d", mark(1), T("plugin.task_markers"), job.marked, job.total)
    lines[#lines + 1] = string.format("%s %s", mark(2), T("plugin.task_subtitle"))
    if S.track_step then
      lines[#lines + 1] = string.format("%s %s", mark(3), T("plugin.task_track"))
    end
    lines[#lines + 1] = ""
    lines[#lines + 1] = T("plugin.wait_short")
    return table.concat(lines, "\n")
  end

  local save

  local function analysis_text(step)
    local a = S.analysis
    local secs = math.max(0, G_os.time() - a.started)
    local lines = { T("plugin.tasks_title"),
      string.format("… %s (%s)   %d:%02d", T("plugin.task_analyze"), T("plugin.step_" .. (step or "model")),
                    math.floor(secs / 60), secs % 60),
      "  " .. T("plugin.task_markers"),
      "  " .. T("plugin.task_subtitle"),
      "",
      T("plugin.cancel_hint"),
    }
    return table.concat(lines, "\n")
  end

  local function end_analysis(text, failed)
    S.failed = failed and S.analysis and { path = S.analysis.path, model = S.analysis.model } or nil
    S.state, S.analysis = "select", nil
    lock(false)
    status(text, failed and "error" or nil)
    refresh()
  end

  local function start_analysis()
    local info = S.info
    if not model_ok() then
      return
    end
    local dir, err = M.new_job(info.path, { lang = BA.lang, slider = smooth_value(), model = model_value() })
    if not dir then
      status(tostring(err), "error")
      return
    end
    local ok, lerr = M.launch(dir)
    if not ok then
      M.remove_job(dir)
      status(tostring(lerr), "error")
      return
    end
    S.analysis = { dir = dir, started = G_os.time(), clip = info.clip, path = info.path, model = model_value(),
                   marker_timeline = current_timeline(),
                   timeline = get("Timeline", "Checked") and current_timeline() or false }
    S.state = "analyze"
    lock(true)
    status(analysis_text(nil))
  end

  local function cancel_analysis()
    if S.state ~= "analyze" then
      return
    end
    M.cancel(S.analysis.dir)
    end_analysis(T("plugin.msg_cancelled"))
  end

  local function poll_analysis()
    local a = S.analysis
    local r = M.poll(a.dir, a.started, G_os.time())
    if r.state == "running" then
      status(analysis_text(r.step))
      return
    end
    if r.state ~= "ok" then
      local text = r.state == "error" and T("plugin.msg_analysis_error", { message = tostring(r.message or "?") })
        or r.state == "no_start" and T("plugin.msg_no_start", { python = tostring(BA.python) })
        or r.state == "timeout" and T("plugin.msg_timeout")
        or T("plugin.msg_cancelled")
      if r.state == "timeout" then
        M.cancel(a.dir)
      else
        M.remove_job(a.dir)
      end
      end_analysis(text, r.state ~= "cancelled")
      return
    end
    local job, err = M.start(r.markers_path, { colors = read_colors(), timeline = a.timeline, clips = { a.clip },
                                               marker_timeline = a.marker_timeline })
    if not job then
      M.remove_job(a.dir)
      end_analysis(tostring(err), true)
      return
    end
    local engine = M.engine_text(job.data.engine)
    local engine_line = engine and T("plugin.engine", { engine = engine }) or T("plugin.engine_unknown")
    set("Engine", "Text", engine_line)
    fit("Engine", engine_line)
    set("Engine", "Hidden", false)
    S.job, S.state, S.analyzed, S.job_dir = job, "work", true, a.dir
    S.track_step = a.timeline and S.tinfo and S.tinfo.state == "present"
    sync_buttons()
    status(work_text())
  end

  local function finish()
    S.state = "result"
    S.last_result_msg = S.job.msg or ""
    if S.job_dir then
      M.remove_job(S.job_dir)
      S.job_dir = nil
    end
    status(S.last_result_msg, "done")
    lock(true)
    log(S.job.msg)
    if S.close_requested then   -- Resolve closed the window during the work: end now that it is done
      save()
      disp:ExitLoop()
    end
  end

  local function tick()
    S.ticks = S.ticks + 1
    if S.relayout then
      S.relayout = false
      pcall(function() win:RecalcLayout() end)
    end
    if S.state == "removing" then
      -- Resolve test 0.2.14: removing ran inside the click, the window did not repaint and the button looked
      -- unanswered. Now the click locks the window and shows "removing …"; the work starts two ticks later.
      S.remove_wait = (S.remove_wait or 0) - 1
      if S.remove_wait <= 0 then
        local okr, done = pcall(M.remove, S.remove_clips, S.remove_tl)
        S.state = "select"
        lock(false)
        refresh()
        if okr then
          status(done.text, "done")
        else
          log("Error:", done)
          status(tostring(done), "error")
        end
      end
    elseif S.state == "work" then
      local ok, done = pcall(S.job.step)
      if not ok then
        log("Error:", done)
        S.job.msg = (S.job.msg or "") .. "\n" .. tostring(done)
        done = true
      end
      if done then
        finish()
      else
        status(work_text())
      end
    elseif S.state == "analyze" and S.ticks % REFRESH_TICKS == 0 then
      poll_analysis()
    elseif S.state == "select" and S.ticks % REFRESH_TICKS == 0 then
      refresh()
    end
  end

  save = function()
    settings.timeline = get("Timeline", "Checked") and true or false
    settings.colors_open = get("Colors", "Checked") and true or false
    settings.colors = read_colors()
    settings.way = analyze_way() and "analyze" or "json"
    settings.smooth = smooth_value()
    settings.model = model_value()
    local okg, g = pcall(function() return itm.BeatAnalyzerWin.Geometry end)
    if okg and type(g) == "table" and tonumber(g[1]) and tonumber(g[4]) then
      settings.geometry = { g[1], g[2], g[3], g[4] }
    end
    M.save_settings(settings)
  end

  local function close()
    if S.state == "analyze" then
      cancel_analysis()
    end
    if S.state == "work" then
      log("Close ignored: the work is not finished yet.")
      S.close_requested = true
      pcall(function() win:Show() end)
      return
    end
    save()
    disp:ExitLoop()
  end

  win.On.WayTabs.CurrentChanged = function(ev)
    S.way_idx = tonumber(ev and ev.Index) or 0
    S.info = nil
    refresh()
    relayout()
  end
  win.On.Choose.Clicked = function()
    local okf, path = pcall(function()
      return fu:RequestFile(settings.json_dir or "", "", { FReqB_Saving = false, FReqB_SeqGather = false,
                                                         FReqS_Filter = "BeatAnalyzer JSON (*.json)|*.json",
                                                         FReqS_Title = T("plugin.choose_title") })
    end)
    if not okf or not path or path == "" then
      return
    end
    local okm, mapped = pcall(function() return fu:MapPath(path) end)
    S.json = okm and mapped and mapped ~= "" and mapped or path
    settings.json_dir = S.json:match("^(.*)[/\\][^/\\]*$") or ""
    refresh()
  end
  win.On.Timeline.Clicked = function() refresh() end
  win.On.Smooth.ValueChanged = function() show_way() end
  win.On.ModelBeatThis.Clicked = function()
    if S.state ~= "select" or S.model == "beat_this" then
      return
    end
    S.model = "beat_this"
    refresh()
    relayout()
  end
  win.On.ModelMd.Clicked = function()
    if S.state ~= "select" or S.model == "md_beat_this" then
      return
    end
    S.model = "md_beat_this"
    refresh()
    relayout()
  end
  win.On.MdConfirm.Clicked = function() refresh() end
  win.On.Cancel.Clicked = function() cancel_analysis() end
  win.On.Colors.Clicked = function() colors_visibility() end
  for _, id in pairs(COLOR_IDS) do
    win.On[id].CurrentIndexChanged = function() update_swatches() end
  end
  win.On.OK.Clicked = function()
    if S.state ~= "select" or not (S.info and S.info.ok) then
      return
    end
    if analyze_way() then
      start_analysis()
      return
    end
    local tl = get("Timeline", "Checked") and current_timeline() or false
    local job, err = M.start(S.json, { colors = read_colors(), timeline = tl })
    if not job then
      status(tostring(err), "error")
      return
    end
    S.job, S.state = job, "work"
    S.track_step = tl and S.tinfo and S.tinfo.state == "present"
    lock(true)
    status(work_text())
  end
  win.On.Remove.Clicked = function()
    if S.state ~= "select" and S.state ~= "result" then
      return
    end
    local clips = remove_clips()
    if #clips == 0 then
      return
    end
    S.remove_clips, S.remove_tl = clips, current_timeline()
    local r = M.removal(clips, S.remove_tl)
    local ask = r.markers + r.tracks + r.srt_clips > 0
    status(r.text, ask and "ask" or nil)
    if ask then
      S.confirm_from = S.state
      S.state = "confirm"
      lock(true)
      relayout()
    end
  end
  win.On.RemoveYes.Clicked = function()
    if S.state ~= "confirm" then
      return
    end
    S.state, S.remove_wait = "removing", 2
    lock(true)
    status(T("plugin.msg_removing"))
  end
  win.On.Close.Clicked = function()
    if S.state == "removing" then
      return
    end
    if S.state == "confirm" then
      local back = S.confirm_from or "select"
      S.confirm_from = nil
      S.state = back
      if back == "result" then
        lock(true)
        status(S.last_result_msg or "", "done")
      else
        lock(false)
        refresh()
        status("")
      end
      return
    end
    close()
  end
  win.On.BeatAnalyzerWin.Close = function() close() end

  local timer = ui:Timer({ ID = "BATimer", Interval = TICK_MS, SingleShot = false })
  local last_event
  local function on_timer(ev)
    if ev ~= nil and ev == last_event then
      return
    end
    last_event = ev
    if ev == nil or ev.who == nil or ev.who == "BATimer" then
      tick()
    end
  end
  disp.On.Timeout = on_timer
  pcall(function() disp.On.BATimer.Timeout = on_timer end)

  M.cleanup_jobs()
  update_swatches()
  colors_visibility()
  refresh()
  timer:Start()
  local want_w, want_h = geometry[3], geometry[4]
  win:Show()
  local okg, g = pcall(function() return itm.BeatAnalyzerWin.Geometry end)
  local actual = okg and type(g) == "table" and (tostring(g[3]) .. "x" .. tostring(g[4])) or "?"
  log(string.format("Window: requested %dx%d, actual %s", want_w, want_h, actual))
  disp:RunLoop()
  timer:Stop()
  win:Hide()
  log("Window closed")
end

if rawget(_G, "BEATTHIS_NO_RUN") then
  return M
end
M.main()
