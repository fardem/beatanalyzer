--[[
BeatAnalyzer_Markers.lua - DaVinci Resolve script of BeatAnalyzer.
Reads a marker JSON exported by BeatAnalyzer ("DaVinci Resolve" tab) and puts one marker per beat on the
audio clip in the media pool. Media pool markers show on every use of the clip in every timeline.

Target clip: the clips selected in the media pool; with no selection, every media pool clip whose
file name equals "fileName" in the JSON.
Markers written by this script carry the custom data MARKER_TAG; a new run removes them first,
markers set by hand stay.

Subtitles: <song>.srt (one subtitle per beat) goes next to the JSON and into the media pool bin BIN_NAME.
With a timeline open that uses the song on an audio track, <song> (Timeline).srt with timeline times
goes onto the subtitle track "BeatAnalyzer - <song>" under the first use of the song; a new run deletes
that track and creates it again. resolve/tools/probe_timeline.lua checks the placement in Resolve.

Install: copy to %APPDATA%\Blackmagic Design\DaVinci Resolve\Support\Fusion\Scripts\Utility\
Run:     Workspace -> Scripts -> BeatAnalyzer_Markers
Log:     Workspace -> Console (lines starting with "[BeatAnalyzer]")

Written for DaVinci Resolve Studio 21.2. The free version blocks file access for scripts.
]]

local VERSION = "0.1.0"   -- same as the file VERSION; the installer compares it

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
      ["plugin.msg_bad_format"] = "Unknown format '{format}', expected '{expected}'. Export the file in BeatAnalyzer under Export -> DaVinci Resolve.",
      ["plugin.msg_bin_missing"] = "media pool bin '{bin}' not available",
      ["plugin.msg_cannot_read"] = "Cannot read the file: {path}",
      ["plugin.msg_markers"] = "{n} markers on {clips} clip(s): {names}",
      ["plugin.msg_no_clip"] = "No clip found. Select the audio clip in the media pool, or import '{file}' into the media pool.",
      ["plugin.msg_no_markers"] = "The JSON contains no markers.",
      ["plugin.msg_no_project"] = "No project is open.",
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
      ["plugin.msg_tl_write"] = "Timeline: cannot write {path}",
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
local function wide_open(path, mode)
  if not IS_WIN then
    return nil
  end
  if ffi_lib == nil then
    local okr, ffi = pcall(require, "ffi")
    if not okr or not ffi then
      ffi_lib = false
      return nil
    end
    pcall(ffi.cdef, [[
      int MultiByteToWideChar(unsigned int cp, unsigned long flags, const char* s, int n, wchar_t* out, int outn);
      void* _wfopen(const wchar_t* name, const wchar_t* mode);
      size_t fread(void* buf, size_t size, size_t n, void* f);
      size_t fwrite(const void* buf, size_t size, size_t n, void* f);
      int fclose(void* f);
    ]])
    local okl, lib = pcall(ffi.load, "msvcrt")
    ffi_lib, msvcrt = ffi, okl and lib or nil
  end
  if not ffi_lib or not msvcrt then
    return nil
  end
  local ffi = ffi_lib
  local function wide(s)
    local n = ffi.C.MultiByteToWideChar(65001, 0, s, -1, nil, 0)
    local buf = ffi.new("wchar_t[?]", n)
    ffi.C.MultiByteToWideChar(65001, 0, s, -1, buf, n)
    return buf
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
local function target_clips(media_pool, file_name)
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
local function mark_clip(clip, markers, fallback_fps)
  local fps = exact_fps(parse_fps(api(clip, "GetClipProperty", "FPS")) or fallback_fps)
  local frames = tonumber(api(clip, "GetClipProperty", "Frames"))
  local removed = remove_own_markers(clip)
  local added, skipped = 0, 0
  for _, m in ipairs(markers) do
    local frame = round((tonumber(m.time) or -1) * fps)
    local down = m.type == "downbeat"
    if frame < 0 or (frames and frame >= frames) then
      skipped = skipped + 1
    else
      local name = down and T("output.marker_downbeat", { bar = tonumber(m.bar) or 0 })
        or string.format("%d.%d", tonumber(m.bar) or 0, tonumber(m.beat) or 0)
      local note = T("output.marker_note", { time = fmt_num(m.time, 3), bpm = fmt_num(m.bpm, 1) })
      if api(clip, "AddMarker", frame, down and DOWNBEAT_COLOR or BEAT_COLOR, name, note, 1, MARKER_TAG) then
        added = added + 1
      else
        skipped = skipped + 1
      end
    end
  end
  log(string.format("%s: %d markers added, %d skipped, %d old removed (%.3f fps)",
      tostring(api(clip, "GetName") or "?"), added, skipped, removed, fps))
  return added, skipped, removed
end
M.mark_clip = mark_clip

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
local function srt_path(json_path, file_name)
  local dir = json_path:match("^(.*[/\\])") or ""
  local base = file_name:gsub("%.[^%.]*$", "")
  if base == "" then
    base = (json_path:match("([^/\\]+)$") or "BeatAnalyzer"):gsub("%.[^%.]*$", "")
  end
  base = base:gsub('[<>:"/\\|%?%*]', "_")
  return dir .. base .. ".srt", base .. ".srt"
end
M.srt_path = srt_path

local function find_bin(media_pool)
  local root = api(media_pool, "GetRootFolder")
  for _, sub in pairs(api(root, "GetSubFolderList") or {}) do
    if api(sub, "GetName") == BIN_NAME then
      return sub
    end
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
  local best, best_start
  local n = tonumber(api(tl, "GetTrackCount", "audio")) or 0
  for i = 1, n do
    for _, item in ipairs(api(tl, "GetItemListInTrack", "audio", i) or {}) do
      local mpi = api(item, "GetMediaPoolItem")
      local start = tonumber(api(item, "GetStart"))
      if mpi and start and keys[media_key(mpi)] and (not best_start or start < best_start) then
        best, best_start = item, start
      end
    end
  end
  return best
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
local function place_in_timeline(media_pool, tl, data, clips, json_path, base)
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
  local dir = json_path:match("^(.*[/\\])") or ""
  local srt_name = base .. " (Timeline).srt"
  if not write_file(dir .. srt_name, text) then
    return T("plugin.msg_tl_write", { path = dir .. srt_name })
  end
  local srt_item, ierr = import_subtitles(media_pool, dir .. srt_name, srt_name)
  if not srt_item then
    return T("plugin.msg_tl_import", { why = tostring(ierr) })
  end

  local track_name = TRACK_PREFIX .. base
  local deleted = delete_tracks(tl, track_name) + delete_tracks(tl, OLD_TRACK_PREFIX .. base)
  local before = tonumber(api(tl, "GetTrackCount", "subtitle")) or 0
  api(tl, "AddTrack", "subtitle")
  local target = tonumber(api(tl, "GetTrackCount", "subtitle")) or 0
  if target <= before then
    return T("plugin.msg_tl_add")
  end
  if not activate_only(tl, target) then
    api(tl, "DeleteTrack", "subtitle", target)
    return T("plugin.msg_tl_activate")
  end
  api(media_pool, "AppendToTimeline", { srt_item })
  local placed = subtitle_count(tl, target)
  if placed == 0 then
    api(tl, "DeleteTrack", "subtitle", target)
    return T("plugin.msg_tl_none_placed")
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
  return msg
end
M.place_in_timeline = place_in_timeline

-- Apply a marker JSON file. Returns true/false and a message for the user.
function M.apply(path)
  local text = read_file(path)
  if not text then
    return false, T("plugin.msg_cannot_read", { path = tostring(path) })
  end
  local okj, data = pcall(json_decode, text)
  if not okj then
    return false, tostring(data)
  end
  local markers, err = validate(data)
  if not markers then
    return false, err
  end

  local pm = api(resolve, "GetProjectManager")
  local project = pm and api(pm, "GetCurrentProject") or nil
  if not project then
    return false, T("plugin.msg_no_project")
  end
  local media_pool = api(project, "GetMediaPool")
  local file_name = tostring(data.fileName or "")
  local clips, how = target_clips(media_pool, file_name)
  if #clips == 0 then
    return false, T("plugin.msg_no_clip", { file = file_name })
  end
  log(string.format("%d clip(s) by %s, %d markers in %s", #clips, how, #markers, path))

  local fallback_fps = parse_fps(api(project, "GetSetting", "timelineFrameRate")) or 25
  local total, skipped_total = 0, 0
  local names = {}
  for _, clip in ipairs(clips) do
    local added, skipped = mark_clip(clip, markers, fallback_fps)
    total, skipped_total = total + added, skipped_total + skipped
    names[#names + 1] = tostring(api(clip, "GetName") or "?")
  end

  local msg = T("plugin.msg_markers", { n = total, clips = #clips, names = table.concat(names, ", ") })
  if skipped_total > 0 then
    msg = msg .. "\n" .. T("plugin.msg_skipped", { n = skipped_total })
  end
  if how == "selection" and file_name ~= "" then
    for _, clip in ipairs(clips) do
      if tostring(api(clip, "GetClipProperty", "File Name") or "") ~= file_name then
        msg = msg .. "\n" .. T("plugin.msg_other_file", { file = file_name })
        break
      end
    end
  end

  local srt_file, srt_name = srt_path(path, file_name)
  if not write_file(srt_file, build_srt(data)) then
    msg = msg .. "\n" .. T("plugin.msg_srt_write", { path = srt_file })
  else
    local item, ierr = import_subtitles(media_pool, srt_file, srt_name)
    if item then
      msg = msg .. "\n" .. T("plugin.msg_srt_ok", { srt = srt_name, bin = BIN_NAME })
    else
      msg = msg .. "\n" .. T("plugin.msg_srt_import", { why = tostring(ierr), path = srt_file })
    end
  end

  local tl = api(project, "GetCurrentTimeline")
  if tl then
    local line = place_in_timeline(media_pool, tl, data, clips, path, (srt_name:gsub("%.srt$", "")))
    if line then
      msg = msg .. "\n" .. line
    end
  end
  return total > 0, msg
end

-- ─── Dialogs ─────────────────────────────────────────────────────────────────

local function choose_json()
  if not fu then
    return nil
  end
  local okf, fn = pcall(function() return fu.RequestFile end)
  if not okf or type(fn) ~= "function" then
    return nil
  end
  local ok, p = pcall(fn, fu, "", "", { FReqB_Saving = false, FReqB_SeqGather = false,
                                        FReqS_Filter = "BeatAnalyzer JSON (*.json)|*.json",
                                        FReqS_Title = "BeatAnalyzer - choose marker JSON" })
  if not ok or not p or p == "" then
    return nil
  end
  local okm, mapped = pcall(function() return fu:MapPath(p) end)
  return okm and mapped and mapped ~= "" and mapped or p
end

local function show(title, text)
  local bmd = rawget(_G, "bmd")
  if not (fu and fu.UIManager and bmd and bmd.UIDispatcher) then
    return
  end
  local ok = pcall(function()
    local ui = fu.UIManager
    local disp = bmd.UIDispatcher(ui)
    local win = disp:AddWindow({ ID = "BeatAnalyzerResult", WindowTitle = title, Geometry = { 300, 300, 520, 170 } },
      ui:VGroup({
        ui:Label({ ID = "Text", Text = text, WordWrap = true }),
        ui:HGroup({ Weight = 0, ui:HGap(0, 1), ui:Button({ ID = "OK", Text = "OK" }) }),
      }))
    function win.On.OK.Clicked() disp:ExitLoop() end
    function win.On.BeatAnalyzerResult.Close() disp:ExitLoop() end
    win:Show()
    disp:RunLoop()
    win:Hide()
  end)
  if not ok then
    log("Result window not available")
  end
end

function M.main()
  log("BeatAnalyzer_Markers " .. VERSION)
  local path = choose_json()
  if not path then
    log("No file chosen.")
    return
  end
  local ok, msg = M.apply(path)
  log(msg)
  show(ok and "BeatAnalyzer - markers set" or "BeatAnalyzer - error", msg)
end

if rawget(_G, "BEATTHIS_NO_RUN") then
  return M
end
M.main()
