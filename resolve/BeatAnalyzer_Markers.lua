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

local VERSION = "0.1.2"   -- same as the file VERSION; the installer compares it

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
      ["output.intro"] = "BeatAnalyzer\n{file}\n{bpm} BPM – {meter}",
      ["output.kind_beat"] = "Beat {beat}",
      ["output.kind_downbeat"] = "Downbeat (1)",
      ["output.marker_downbeat"] = "Bar {bar}",
      ["output.marker_note"] = "{time} s | {bpm} BPM",
      ["output.meter"] = "{num}/{den}{suffix}",
      ["output.meter_suffix.16"] = "",
      ["output.meter_suffix.2"] = "",
      ["output.meter_suffix.4"] = "",
      ["output.meter_suffix.8"] = "",
      ["output.time_bpm"] = "{clock} – {bpm} BPM",
      ["plugin.btn_cancel"] = "Cancel",
      ["plugin.btn_choose"] = "Choose …",
      ["plugin.btn_close"] = "Close",
      ["plugin.btn_ok"] = "OK",
      ["plugin.btn_remove"] = "Remove BeatAnalyzer markers",
      ["plugin.btn_remove_yes"] = "Remove",
      ["plugin.check_colors"] = "Adjust marker colours",
      ["plugin.check_timeline"] = "Create a Subtitle Track in the Timeline",
      ["plugin.choose_title"] = "BeatAnalyzer – choose marker JSON",
      ["plugin.clip_found"] = "{names} in the Media Pool · {length}",
      ["plugin.color_beat"] = "Beat {n}",
      ["plugin.color_downbeat"] = "Downbeat",
      ["plugin.color_none"] = "no marker",
      ["plugin.color_other"] = "other",
      ["plugin.engine"] = "Analysed with {engine}",
      ["plugin.engine_unknown"] = "Analysis program: not given in the JSON (older JSON or analysed in the browser)",
      ["plugin.explain_absent"] = "The song is not in the Timeline '{timeline}'. Only the Subtitle in the Media Pool is created.",
      ["plugin.explain_no_timeline"] = "No Timeline is open. Only the Subtitle in the Media Pool is created.",
      ["plugin.explain_off"] = "The Timeline stays unchanged. The Subtitle with all beats lies in the folder BeatAnalyzer in the Media Pool and can be dragged from there into any Timeline.",
      ["plugin.explain_present"] = "In the Timeline '{timeline}' the song lies on A{track} from {tc}. Below it the Subtitle Track '{track_name}' is created and made active. Resolve allows only one active Subtitle Track; the others stay but are switched off.",
      ["plugin.json_none"] = "No JSON chosen.",
      ["plugin.msg_bad_format"] = "Unknown format '{format}', expected '{expected}'. Export the file in BeatAnalyzer under Export -> DaVinci Resolve.",
      ["plugin.msg_bin_missing"] = "media pool bin '{bin}' not available",
      ["plugin.msg_cannot_read"] = "Cannot read the file: {path}",
      ["plugin.msg_markers"] = "{n} markers on {clips} clip(s): {names}",
      ["plugin.msg_no_clip"] = "No clip found. Select the audio clip in the media pool, or import '{file}' into the media pool.",
      ["plugin.msg_no_markers"] = "The JSON contains no markers.",
      ["plugin.msg_no_project"] = "No project is open.",
      ["plugin.msg_no_work_dir"] = "Subtitles: cannot create a working folder in {path}",
      ["plugin.msg_not_imported"] = "Resolve did not import {path}",
      ["plugin.msg_not_json"] = "The file is not a BeatAnalyzer marker JSON.",
      ["plugin.msg_other_file"] = "Note: the selected clip is not '{file}' from the JSON.",
      ["plugin.msg_skipped"] = "{n} markers skipped (outside the clip or not accepted by Resolve).",
      ["plugin.msg_srt_import"] = "Subtitles: {why} - import {path} by hand",
      ["plugin.msg_srt_ok"] = "Subtitles: {srt} in media pool bin '{bin}'",
      ["plugin.msg_srt_write"] = "Subtitles: cannot write {path}",
      ["plugin.msg_tl_activate"] = "Timeline: cannot activate the new subtitle track.",
      ["plugin.msg_tl_add"] = "Timeline: cannot add a subtitle track.",
      ["plugin.msg_tl_count"] = "Timeline: placed {placed} subtitles, the SRT has {count}.",
      ["plugin.msg_tl_empty"] = "Timeline: no beats in the part of the song that is in the timeline.",
      ["plugin.msg_tl_import"] = "Timeline: {why}",
      ["plugin.msg_tl_none_placed"] = "Timeline: Resolve placed no subtitles.",
      ["plugin.msg_tl_offset"] = "Timeline: first subtitle at frame {actual}, expected {expected} (difference {diff} frames). Please run resolve/tools/probe_timeline.lua and send the console output.",
      ["plugin.msg_tl_ok"] = "Timeline: {n} subtitles on track ST{track} '{name}'{replaced}",
      ["plugin.msg_tl_replaced"] = " (old track replaced)",
      ["plugin.msg_tl_vehicle_left"] = "Timeline: the clip '{clip}' could not be removed from the Media Pool - delete it by hand.",
      ["plugin.msg_tl_write"] = "Timeline: cannot write {path}",
      ["plugin.reason_analyzer_failed"] = "the analyzer could not be loaded",
      ["plugin.reason_inference_failed"] = "analysis with beat_this failed",
      ["plugin.reason_model_load_failed"] = "beat_this model could not be loaded",
      ["plugin.reason_not_installed"] = "beat_this not installed",
      ["plugin.remove_confirm"] = "Remove from '{song}': {markers} BeatAnalyzer markers, {tracks} Subtitle Track(s) in the open Timeline, {srt} Subtitle clip(s) in the folder BeatAnalyzer? Markers set by hand stay.",
      ["plugin.remove_done"] = "Removed: {markers} markers, {tracks} Subtitle Track(s), {srt} Subtitle clip(s).",
      ["plugin.remove_nothing"] = "Nothing from BeatAnalyzer found on '{song}'.",
      ["plugin.step_bin"] = "Folder BeatAnalyzer in the Media Pool, Subtitle '{srt}'",
      ["plugin.step_markers"] = "Markers on the clip '{clip}' in the Media Pool",
      ["plugin.step_markers_hint"] = "Resolve sets every marker on its own, this takes a while.",
      ["plugin.step_track"] = "Subtitle Track '{track}' in '{timeline}'",
      ["plugin.title"] = "BeatAnalyzer {version}",
      ["plugin.wait"] = "Please wait – the window closes only at the end.",
      ["plugin.warn_length"] = "The clip's duration ({clip}) differs from the analysed file ({json}).",
      ["plugin.warn_other_file"] = "The selected clip is not '{file}' from the JSON.",
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
  if #ignored > 0 then
    log("Selection: ignored entries that are not clips:", table.concat(ignored, ", "))
  end
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
M.DEFAULT_COLORS = { downbeat = DOWNBEAT_COLOR, beat2 = BEAT_COLOR, beat3 = BEAT_COLOR, beat4 = BEAT_COLOR,
                     other = BEAT_COLOR }
local COLOR_OK = {}
for _, c in ipairs(M.MARKER_COLORS) do
  COLOR_OK[c] = true
end

-- Colour of a marker by its beat in the bar: downbeat, beat 2-4, all others; nil = no marker.
-- An unknown colour falls back to the default of that slot.
function M.marker_color(m, colors)
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

-- SRT with one subtitle per marker, shown until the next one. Four lines per subtitle, in the language of
-- BA.lang (English here):
--   Downbeat (1) | Beat 2
--   Bar 24 – Beat 1
--   01:02.880 – 89.6 BPM
--   Confidence 75%
-- Without opts: times from the start of the audio file, and a first subtitle from 0 s to the first
-- beat keeps the timing when the SRT is placed at the clip start.
-- opts.from / opts.to: only beats in this part of the song (seconds), the last subtitle ends at "to".
-- opts.shift: seconds added to every time (position of song second 0 in the timeline).
-- Returns the SRT text, the number of subtitles and the time of the first one (after the shift).
local function build_srt(data, opts)
  opts = opts or {}
  local shift, from, to = opts.shift or 0, opts.from, opts.to
  local markers = {}
  for _, m in ipairs(data.markers) do
    local t = tonumber(m.time)
    if t and (not from or t >= from - 1e-6) and (not to or t < to) then
      markers[#markers + 1] = m
    end
  end
  local cues = {}
  if #markers == 0 then
    return "", 0, nil
  end
  local first = tonumber(markers[1].time)
  if not opts.shift and not from and first > 0.05 then
    cues[#cues + 1] = { 0, first, T("output.intro", { file = tostring(data.fileName or ""),
                                                       bpm = tonumber(data.globalBpm) and fmt_num(data.globalBpm, 1) or "?",
                                                       meter = fmt_meter(data.timeSignature or "?") }) }
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
      T("output.confidence", { value = fmt_pct(m.confidence) }),
    }
    cues[#cues + 1] = { t, nxt, table.concat(lines, "\n") }
  end
  local out = {}
  for i, c in ipairs(cues) do
    out[#out + 1] = string.format("%d\n%s --> %s\n%s\n", i, srt_time(c[1] + shift), srt_time(c[2] + shift), c[3])
  end
  return table.concat(out, "\n"), #cues, cues[1][1] + shift
end
M.build_srt = build_srt

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

-- Delete the subtitle tracks with this name (from the last one, so the indexes stay valid).
local function delete_tracks(tl, name)
  local n = tonumber(api(tl, "GetTrackCount", "subtitle")) or 0
  local deleted = 0
  for i = n, 1, -1 do
    if api(tl, "GetTrackName", "subtitle", i) == name and api(tl, "DeleteTrack", "subtitle", i) then
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

-- Subtitles under the first use of the song in the open timeline, on the track "BeatAnalyzer - <song>".
-- Returns a line for the result message, or nil when the song is not in the timeline.
local function place_in_timeline(media_pool, tl, data, clips, dir, base)
  local item = first_use(tl, clips)
  if not item then
    log("Timeline: the song is not on an audio track of '" .. tostring(api(tl, "GetName") or "?") .. "'")
    return nil
  end
  local fps = exact_fps(parse_fps(api(tl, "GetSetting", "timelineFrameRate")) or 25)
  local tl_start = tonumber(api(tl, "GetStartFrame")) or 0
  local start = tonumber(api(item, "GetStart")) or tl_start
  local left = tonumber(api(item, "GetLeftOffset")) or 0
  local duration = tonumber(api(item, "GetDuration")) or 0
  local from, to = left / fps, (left + duration) / fps
  local shift = (start - tl_start - left) / fps
  log(string.format("Timeline '%s': song at frame %d (start %d), left offset %d, duration %d, %.3f fps -> song %.3f-%.3f s, shift %.3f s",
      tostring(api(tl, "GetName") or "?"), start, tl_start, left, duration, fps, from, to, shift))

  local text, count, first = build_srt(data, { shift = shift, from = from, to = to })
  if count == 0 then
    return T("plugin.msg_tl_empty")
  end
  local srt_name = base .. " (Timeline).srt"
  local srt_file = dir .. SEP .. srt_name
  if not write_file(srt_file, text) then
    return T("plugin.msg_tl_write", { path = srt_file }), true
  end
  -- The old track goes first: Resolve may refuse to delete a clip that a timeline still uses, so the clip of
  -- the last run can only be replaced once its track is gone.
  local track_name = TRACK_PREFIX .. base
  local deleted = delete_tracks(tl, track_name) + delete_tracks(tl, OLD_TRACK_PREFIX .. base)
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
                                     replaced = deleted > 0 and T("plugin.msg_tl_replaced") or "" })
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
  if tl then
    local n = tonumber(api(tl, "GetTrackCount", "subtitle")) or 0
    for i = 1, n do
      local name = api(tl, "GetTrackName", "subtitle", i)
      if name == TRACK_PREFIX .. song or name == OLD_TRACK_PREFIX .. song then
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
  if tl then
    done.tracks = delete_tracks(tl, TRACK_PREFIX .. t.song) + delete_tracks(tl, OLD_TRACK_PREFIX .. t.song)
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

-- "beat_this (CUDA, RTX 3080)", "beat_this (CPU)", "librosa – <reason>" from the field engine of the JSON.
function M.engine_text(engine)
  if type(engine) ~= "table" or not engine.id then
    return nil
  end
  if engine.id == "beat_this" then
    local parts = { string.upper(tostring(engine.device or "?")) }
    if type(engine.gpu) == "string" and engine.gpu ~= "" then
      parts[#parts + 1] = engine.gpu
    end
    return "beat_this (" .. table.concat(parts, ", ") .. ")"
  end
  local reason = engine.fallbackReason and lookup("plugin.reason_" .. tostring(engine.fallbackReason))
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
  if not item then
    return { state = "absent", name = name }
  end
  local fps = parse_fps(api(tl, "GetSetting", "timelineFrameRate")) or 25
  return { state = "present", name = name, track = track, tc = M.timecode(api(item, "GetStart"), fps) }
end

-- The text under the tick box "Subtitle Track in the Timeline".
function M.explanation(checked, tinfo, song)
  if not checked then
    return T("plugin.explain_off")
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
  local markers = data.markers
  local pm = api(resolve, "GetProjectManager")
  local project = api(pm, "GetCurrentProject")
  local media_pool = api(project, "GetMediaPool")
  log(string.format("%d clip(s) by %s, %d markers in %s", #clips, how, #markers, path))

  local job = setmetatable({
    path = path, opts = opts, data = data, markers = markers, project = project, media_pool = media_pool,
    file_name = file_name, clips = clips, how = how, phase = "markers", marked = 0, total = 0,
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
          local name = m.type == "downbeat" and T("output.marker_downbeat", { bar = tonumber(m.bar) or 0 })
            or string.format("%d.%d", tonumber(m.bar) or 0, tonumber(m.beat) or 0)
          local note = T("output.marker_note", { time = fmt_num(m.time, 3), bpm = fmt_num(m.bpm, 1) })
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
    api(self.project, "SetCurrentTimeline", tl)
    local line, kept = place_in_timeline(self.media_pool, tl, self.data, self.clips, self.dir, self.base)
    if line then
      self.msg = self.msg .. "\n" .. line
    end
    self.keep = self.keep or kept == true
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

local COLOR_SLOTS = { "downbeat", "beat2", "beat3", "beat4", "other" }

function M.settings_path()
  return BA.home and (BA.home .. SEP .. "resolve_temp" .. SEP .. "plugin.txt") or nil
end

function M.load_settings()
  local s = { json_dir = "", timeline = true, colors_open = false, colors = {}, geometry = nil }
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
                  "colors_open=" .. (s.colors_open and "1" or "0") }
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

-- One window with the states "select" (before OK), "confirm" (remove asks), "work" (locked, a timer does the
-- job in steps) and "result". A timer every 50 ms: in "select" the clip and the timeline are checked again
-- about once a second, in "work" one job step runs per tick.

local TICK_MS = 50
local WIN_MIN = { 600, 640 }   -- smaller windows wrap every line (seen in Resolve)
local LINE_PX, CHAR_PX = 17, 8   -- height of a text line, mean width of a character (for wrapped labels;
                                 -- 7 was too small: a 600 px window wraps after about 70 characters)
local REFRESH_TICKS = 20

local COLOR_IDS = { downbeat = "ColorDownbeat", beat2 = "ColorBeat2", beat3 = "ColorBeat3", beat4 = "ColorBeat4",
                    other = "ColorOther" }

local function color_index(color)
  for i, c in ipairs(M.MARKER_COLORS) do
    if c == color then
      return i - 1
    end
  end
  return #M.MARKER_COLORS   -- the last entry: no marker
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
  local S = { state = "select", ticks = 0 }

  local function color_row(slot, label)
    return ui:HGroup({ Weight = 0,
      ui:Label({ ID = COLOR_IDS[slot] .. "Label", Text = label, Weight = 0, MinimumSize = { 80, 0 } }),
      ui:ComboBox({ ID = COLOR_IDS[slot], Weight = 1 }) })
  end

  local geometry = settings.geometry or { 300, 150, 680, 680 }
  geometry = { geometry[1], geometry[2], math.max(geometry[3], WIN_MIN[1]), math.max(geometry[4], WIN_MIN[2]) }
  local win = disp:AddWindow({ ID = "BeatAnalyzerWin", WindowTitle = T("plugin.title", { version = VERSION }),
                               Geometry = geometry, MinimumSize = WIN_MIN },
    ui:VGroup({ Spacing = 6,
      ui:HGroup({ Weight = 0,
        ui:Label({ ID = "JsonLabel", Text = "JSON:", Weight = 0 }),
        ui:Label({ ID = "JsonPath", Text = T("plugin.json_none"), WordWrap = true, Weight = 1, MinimumSize = { 0, 36 } }),
        ui:Button({ ID = "Choose", Text = T("plugin.btn_choose"), Weight = 0 }) }),
      ui:Label({ ID = "ClipInfo", Text = "", WordWrap = true, Weight = 0, MinimumSize = { 0, 20 } }),
      ui:Label({ ID = "Warnings", Text = "", WordWrap = true, Weight = 0, MinimumSize = { 0, 36 }, Hidden = true }),
      ui:Label({ ID = "Engine", Text = "", WordWrap = true, Weight = 0, MinimumSize = { 0, 20 }, Hidden = true }),
      ui:CheckBox({ ID = "Timeline", Text = T("plugin.check_timeline"), Checked = settings.timeline, Weight = 0 }),
      ui:Label({ ID = "Explain", Text = "", WordWrap = true, Weight = 0, MinimumSize = { 0, 72 } }),
      ui:CheckBox({ ID = "Colors", Text = T("plugin.check_colors"), Checked = settings.colors_open, Weight = 0 }),
      ui:HGroup({ Weight = 0,
        color_row("downbeat", T("plugin.color_downbeat")),
        color_row("beat2", T("plugin.color_beat", { n = 2 })),
        color_row("beat3", T("plugin.color_beat", { n = 3 })) }),
      ui:HGroup({ Weight = 0,
        color_row("beat4", T("plugin.color_beat", { n = 4 })),
        color_row("other", T("plugin.color_other")) }),
      ui:Label({ ID = "Status", Text = "", WordWrap = true, Weight = 1, MinimumSize = { 0, 120 } }),
      ui:HGroup({ Weight = 0,
        ui:Button({ ID = "Remove", Text = T("plugin.btn_remove"), Weight = 0 }),
        ui:Button({ ID = "RemoveYes", Text = T("plugin.btn_remove_yes"), Weight = 0, Hidden = true }),
        ui:HGap(0, 1),
        ui:Button({ ID = "Close", Text = T("plugin.btn_close"), Weight = 0 }),
        ui:Button({ ID = "OK", Text = T("plugin.btn_ok"), Weight = 0, Enabled = false }) }) }))
  local itm = win:GetItems()

  local function set(id, prop, value)
    pcall(function() itm[id][prop] = value end)
  end
  local function get(id, prop)
    local ok, v = pcall(function() return itm[id][prop] end)
    return ok and v or nil
  end

  -- Resolve does not grow a wrapped label with its text: reserve the lines it needs at the current width.
  local function window_width()
    local ok, g = pcall(function() return itm.BeatAnalyzerWin.Geometry end)
    return ok and type(g) == "table" and tonumber(g[3]) or geometry[3]
  end
  -- lines of one text line wrapped at word boundaries like the label does (characters, not UTF-8 bytes)
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
      while used > per_line do   -- a word longer than a line is broken inside
        n, used = n + 1, used - per_line
      end
    end
    return n
  end
  local function fit(id, text, min_lines)
    local per_line = math.max(30, math.floor((window_width() - 40) / CHAR_PX))
    local lines = 0
    for line in (tostring(text or "") .. "\n"):gmatch("(.-)\n") do
      lines = lines + wrapped_lines(line, per_line)
    end
    set(id, "MinimumSize", { 0, math.max(min_lines or 1, lines) * LINE_PX + 2 })
  end
  -- The UIManager lays a window out for another size than it draws (WhisperX Workbench): lay out now
  -- and once more on the next tick.
  local function relayout()
    pcall(function() win:RecalcLayout() end)
    S.relayout = true
  end
  local function status(text)
    set("Status", "Text", text)
    fit("Status", text, 6)
    relayout()
  end

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

  local function colors_visibility()
    local hidden = not get("Colors", "Checked")
    for _, id in pairs(COLOR_IDS) do
      set(id, "Hidden", hidden)
      set(id .. "Label", "Hidden", hidden)
    end
    pcall(function() win:RecalcLayout() end)
  end

  local function project()
    local pm = api(resolve, "GetProjectManager")
    return pm and api(pm, "GetCurrentProject") or nil
  end
  local function current_timeline()
    local p = project()
    return p and api(p, "GetCurrentTimeline") or nil
  end

  -- Clips for "Remove": the target of the JSON, without a JSON only the selection in the media pool.
  local function remove_clips()
    if S.info and S.info.ok then
      return S.info.clips
    end
    local p = project()
    return p and selected_clips(api(p, "GetMediaPool")) or {}
  end

  local function refresh()
    if S.state ~= "select" then
      return
    end
    if S.json then
      S.info = M.prepare(S.json)
      set("JsonPath", "Text", S.json:match("([^/\\]+)$") or S.json)   -- the file name; the path as tooltip
      set("JsonPath", "ToolTip", S.json)
      set("ClipInfo", "Text", S.info.ok and S.info.clip_text or (S.info.error or ""))
      local warnings = {}
      for _, w in ipairs(S.info.warnings or {}) do
        warnings[#warnings + 1] = "⚠ " .. w
      end
      set("Warnings", "Text", table.concat(warnings, "\n"))
      fit("Warnings", table.concat(warnings, "\n"))
      set("Warnings", "Hidden", #warnings == 0)
      set("Engine", "Text", S.info.engine or "")
      fit("Engine", S.info.engine or "")
      set("Engine", "Hidden", not S.info.engine)
      fit("JsonPath", get("JsonPath", "Text"), 2)
      fit("ClipInfo", get("ClipInfo", "Text"))
      S.tinfo = M.timeline_info(current_timeline(), S.info.ok and S.info.clips or {})
      local explain = M.explanation(get("Timeline", "Checked"), S.tinfo, S.info.song)
      set("Explain", "Text", explain)
      fit("Explain", explain, 2)
      relayout()
    end
    set("OK", "Enabled", S.info ~= nil and S.info.ok == true)
    set("Remove", "Enabled", #remove_clips() > 0)
  end

  local function lock(locked)
    for _, id in ipairs({ "Choose", "Timeline", "Colors", "Remove", "OK", "Close" }) do
      set(id, "Enabled", not locked)
    end
    for _, id in pairs(COLOR_IDS) do
      set(id, "Enabled", not locked)
    end
  end

  local function work_text()
    local job = S.job
    local order = { markers = 1, subtitles = 2, timeline = 3, done = 4 }
    local now = order[job.phase] or 4
    local function mark(n)
      return n < now and "✓" or (n == now and "…" or "  ")
    end
    local lines = { T("plugin.work_title") }
    local clip = tostring(api(job.clips[1], "GetName") or "?")
    lines[#lines + 1] = string.format("%s 1. %s   %d / %d", mark(1), T("plugin.step_markers", { clip = clip }),
                                      job.marked, job.total)
    lines[#lines + 1] = "     " .. T("plugin.step_markers_hint")
    lines[#lines + 1] = string.format("%s 2. %s", mark(2), T("plugin.step_bin", { srt = job.srt_name }))
    if S.track_step then
      lines[#lines + 1] = string.format("%s 3. %s", mark(3), T("plugin.step_track", { track = job.track_name,
                                                                                    timeline = job.timeline_name }))
    end
    lines[#lines + 1] = ""
    lines[#lines + 1] = T("plugin.wait")
    return table.concat(lines, "\n")
  end

  local save   -- defined below, used by finish()

  local function finish()
    S.state = "result"
    status(S.job.msg or "")   -- the analysis program stays visible in its own line above
    set("Close", "Text", T("plugin.btn_ok"))
    set("Close", "Enabled", true)
    set("OK", "Hidden", true)
    set("Remove", "Hidden", true)
    log(S.job.msg)
    if S.close_requested then   -- Resolve closed the window during the work: end now that it is done
      save()
      disp:ExitLoop()
    end
  end

  local function tick()
    S.ticks = S.ticks + 1
    if S.relayout then   -- second layout pass, see relayout()
      S.relayout = false
      pcall(function() win:RecalcLayout() end)
    end
    if S.state == "work" then
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
    elseif S.state == "select" and S.ticks % REFRESH_TICKS == 0 then
      refresh()
    end
  end

  save = function()
    settings.timeline = get("Timeline", "Checked") and true or false
    settings.colors_open = get("Colors", "Checked") and true or false
    settings.colors = read_colors()
    local okg, g = pcall(function() return itm.BeatAnalyzerWin.Geometry end)
    if okg and type(g) == "table" and tonumber(g[1]) and tonumber(g[4]) then
      settings.geometry = { g[1], g[2], g[3], g[4] }
    end
    M.save_settings(settings)
  end

  local function close()
    if S.state == "work" then
      log("Close ignored: the work is not finished yet.")
      S.close_requested = true   -- if Resolve closes the window anyway, the loop ends after the work
      pcall(function() win:Show() end)
      return
    end
    save()
    disp:ExitLoop()
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
  win.On.Colors.Clicked = function() colors_visibility() end
  win.On.OK.Clicked = function()
    if S.state ~= "select" or not (S.info and S.info.ok) then
      return
    end
    local tl = get("Timeline", "Checked") and current_timeline() or false
    local job, err = M.start(S.json, { colors = read_colors(), timeline = tl })
    if not job then
      status(tostring(err))
      return
    end
    S.job, S.state = job, "work"
    S.track_step = tl and S.tinfo and S.tinfo.state == "present"
    lock(true)
    status(work_text())
  end
  win.On.Remove.Clicked = function()
    if S.state ~= "select" then
      return
    end
    local clips = remove_clips()
    if #clips == 0 then
      return
    end
    S.remove_clips, S.remove_tl = clips, current_timeline()
    local r = M.removal(clips, S.remove_tl)
    status(r.text)
    if r.markers + r.tracks + r.srt_clips > 0 then
      S.state = "confirm"
      set("RemoveYes", "Hidden", false)
      pcall(function() win:RecalcLayout() end)
    end
  end
  win.On.RemoveYes.Clicked = function()
    if S.state ~= "confirm" then
      return
    end
    local done = M.remove(S.remove_clips, S.remove_tl)
    status(done.text)
    set("RemoveYes", "Hidden", true)
    S.state = "select"
    refresh()
  end
  win.On.Close.Clicked = function()
    if S.state == "confirm" then   -- the button closes the question, not the window
      S.state = "select"
      set("RemoveYes", "Hidden", true)
      status("")
      return
    end
    close()
  end
  win.On.BeatAnalyzerWin.Close = function() close() end

  -- Both ways of receiving timer events are registered (as in the WhisperX Workbench); the same event
  -- object is handled once.
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

  colors_visibility()
  refresh()
  timer:Start()
  win:Show()
  local okg, g = pcall(function() return itm.BeatAnalyzerWin.Geometry end)
  log(string.format("Window: requested %dx%d, actual %s", geometry[3], geometry[4],
      okg and type(g) == "table" and (tostring(g[3]) .. "x" .. tostring(g[4])) or "?"))
  disp:RunLoop()
  timer:Stop()
  win:Hide()
  log("Window closed")
end

if rawget(_G, "BEATTHIS_NO_RUN") then
  return M
end
M.main()
