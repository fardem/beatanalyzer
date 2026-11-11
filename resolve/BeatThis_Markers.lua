--[[
BeatThis_Markers.lua - DaVinci Resolve script of BeatThis.
Reads a marker JSON exported by BeatThis ("DaVinci Resolve" tab) and puts one marker per beat on the
audio clip in the media pool. Media pool markers show on every use of the clip in every timeline.

Target clip: the clips selected in the media pool; with no selection, every media pool clip whose
file name equals "fileName" in the JSON.
Markers written by this script carry the custom data MARKER_TAG; a new run removes them first,
markers set by hand stay.

Install: copy to %APPDATA%\Blackmagic Design\DaVinci Resolve\Support\Fusion\Scripts\Utility\
Run:     Workspace -> Scripts -> BeatThis_Markers
Log:     Workspace -> Console (lines starting with "[BeatThis]")

Written for DaVinci Resolve Studio 21.2. The free version blocks file access for scripts.
]]

local VERSION = "0.0.3"   -- same as the file VERSION; the installer compares it

local M = { VERSION = VERSION }

-- ─── Settings ────────────────────────────────────────────────────────────────

local DOWNBEAT_COLOR = "Red"     -- marker colour of beat 1 of each bar
local BEAT_COLOR     = "Cyan"    -- marker colour of all other beats
local MARKER_TAG     = "beatthis"
local JSON_FORMAT    = "beatthis-resolve-markers/1"
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
  print("[BeatThis] " .. text)
end
M.log_lines = lines

local function round(x)
  return math.floor(x + 0.5)
end

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
local ffi_ready = nil
local function read_file_wide(path)
  if not IS_WIN then
    return nil
  end
  local okr, ffi = pcall(require, "ffi")
  if not okr or not ffi then
    return nil
  end
  if ffi_ready == nil then
    ffi_ready = pcall(ffi.cdef, [[
      int MultiByteToWideChar(unsigned int cp, unsigned long flags, const char* s, int n, wchar_t* out, int outn);
      void* _wfopen(const wchar_t* name, const wchar_t* mode);
      size_t fread(void* buf, size_t size, size_t n, void* f);
      int fclose(void* f);
    ]])
  end
  local ok, text = pcall(function()
    local function wide(s)
      local n = ffi.C.MultiByteToWideChar(65001, 0, s, -1, nil, 0)
      local buf = ffi.new("wchar_t[?]", n)
      ffi.C.MultiByteToWideChar(65001, 0, s, -1, buf, n)
      return buf
    end
    local msvcrt = ffi.load("msvcrt")
    local f = msvcrt._wfopen(wide(path), wide("rb"))
    if f == nil then
      return nil
    end
    local chunks, buf = {}, ffi.new("char[65536]")
    while true do
      local got = tonumber(msvcrt.fread(buf, 1, 65536, f))
      if got <= 0 then break end
      chunks[#chunks + 1] = ffi.string(buf, got)
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
    return nil, "The file is not a BeatThis marker JSON."
  end
  if data.format ~= JSON_FORMAT then
    return nil, "Unknown format '" .. tostring(data.format) .. "', expected '" .. JSON_FORMAT
      .. "'. Export the file in BeatThis under Export -> DaVinci Resolve."
  end
  if type(data.markers) ~= "table" or #data.markers == 0 then
    return nil, "The JSON contains no markers."
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
      local name = down and string.format("Bar %d", tonumber(m.bar) or 0)
        or string.format("%d.%d", tonumber(m.bar) or 0, tonumber(m.beat) or 0)
      local note = string.format("%.3f s | %.1f BPM", tonumber(m.time) or 0, tonumber(m.bpm) or 0)
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

-- Apply a marker JSON file. Returns true/false and a message for the user.
function M.apply(path)
  local text = read_file(path)
  if not text then
    return false, "Cannot read the file: " .. tostring(path)
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
    return false, "No project is open."
  end
  local media_pool = api(project, "GetMediaPool")
  local file_name = tostring(data.fileName or "")
  local clips, how = target_clips(media_pool, file_name)
  if #clips == 0 then
    return false, "No clip found. Select the audio clip in the media pool, or import '" .. file_name
      .. "' into the media pool."
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

  local msg = string.format("%d markers on %d clip(s): %s", total, #clips, table.concat(names, ", "))
  if skipped_total > 0 then
    msg = msg .. string.format("\n%d markers skipped (outside the clip or not accepted by Resolve).", skipped_total)
  end
  if how == "selection" and file_name ~= "" then
    for _, clip in ipairs(clips) do
      if tostring(api(clip, "GetClipProperty", "File Name") or "") ~= file_name then
        msg = msg .. "\nNote: the selected clip is not '" .. file_name .. "' from the JSON."
        break
      end
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
                                        FReqS_Filter = "BeatThis JSON (*.json)|*.json",
                                        FReqS_Title = "BeatThis - choose marker JSON" })
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
    local win = disp:AddWindow({ ID = "BeatThisResult", WindowTitle = title, Geometry = { 300, 300, 520, 170 } },
      ui:VGroup({
        ui:Label({ ID = "Text", Text = text, WordWrap = true }),
        ui:HGroup({ Weight = 0, ui:HGap(0, 1), ui:Button({ ID = "OK", Text = "OK" }) }),
      }))
    function win.On.OK.Clicked() disp:ExitLoop() end
    function win.On.BeatThisResult.Close() disp:ExitLoop() end
    win:Show()
    disp:RunLoop()
    win:Hide()
  end)
  if not ok then
    log("Result window not available")
  end
end

function M.main()
  log("BeatThis_Markers " .. VERSION)
  local path = choose_json()
  if not path then
    log("No file chosen.")
    return
  end
  local ok, msg = M.apply(path)
  log(msg)
  show(ok and "BeatThis - markers set" or "BeatThis - error", msg)
end

if rawget(_G, "BEATTHIS_NO_RUN") then
  return M
end
M.main()
