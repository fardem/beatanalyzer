-- BeatAnalyzer_SrtProbe.lua - can a script read the subtitles of an SRT clip directly in the MEDIA POOL, without a
-- timeline? Finds every subtitle clip in the media pool (all bins) and reports for each:
--   * all methods the clip object offers (via getmetatable, if Resolve exposes them)
--   * candidate calls that might return the subtitle text (transcription calls new in 21.1, GetSubtitle..., ...)
--   * all clip properties and metadata (maybe the text or a duration hint is in there)
-- Changes nothing except the report marker.
--
-- Output: purple marker "SrtProbe" at the start of the current timeline (note = report), and the Console lines
-- starting with "[srtprobe]". Start: Workspace > Scripts > BeatAnalyzer_SrtProbe (same folder as the FreeProbe).

local TAG = "beatanalyzer.srtprobe"
local lines = {}

local function out(s)
  lines[#lines + 1] = s
  local p = rawget(_G, "print")
  if type(p) == "function" then pcall(p, "[srtprobe] " .. s) end
end

local function short(v, n)
  n = n or 120
  local s = tostring(v):gsub("[\r\n]+", " / ")
  if #s > n then s = s:sub(1, n - 3) .. "..." end
  return s
end

local function call(obj, method, ...)
  if obj == nil then return false, "nil object" end
  local okf, fn = pcall(function() return obj[method] end)
  if not okf or fn == nil then return false, "no method" end
  local args, n = { ... }, select("#", ...)
  local unpack_ = rawget(_G, "unpack") or table.unpack
  return pcall(function() return fn(obj, unpack_(args, 1, n)) end)
end

-- Describes a return value: type, size, and the first entries of a table (one level deep, nested tables shortened).
local function describe(v)
  if type(v) ~= "table" then return type(v) .. " " .. short(v) end
  local parts, n = {}, 0
  for k, x in pairs(v) do
    n = n + 1
    if n <= 6 then
      if type(x) == "table" then
        local sub, m = {}, 0
        for k2, x2 in pairs(x) do
          m = m + 1
          if m <= 6 then sub[#sub + 1] = tostring(k2) .. "=" .. short(x2, 40) end
        end
        parts[#parts + 1] = tostring(k) .. "={" .. table.concat(sub, ", ") .. "}"
      else
        parts[#parts + 1] = tostring(k) .. "=" .. short(x, 60)
      end
    end
  end
  return "table(" .. n .. ") " .. table.concat(parts, " | ")
end

local resolve = rawget(_G, "resolve")
if not resolve then
  local f = rawget(_G, "Resolve")
  if type(f) == "function" then local ok, r = pcall(f); if ok then resolve = r end end
end
if not resolve then out("no Resolve object"); return end
local _, pm = call(resolve, "GetProjectManager")
local _, project = call(pm, "GetCurrentProject")
local _, mp = call(project, "GetMediaPool")
local _, timeline = call(project, "GetCurrentTimeline")
local _, root = call(mp, "GetRootFolder")

-- every clip in every bin
local clips = {}
local function walk(folder, depth)
  if not folder or depth > 20 then return end
  local _, list = call(folder, "GetClipList")
  for _, c in pairs(type(list) == "table" and list or {}) do clips[#clips + 1] = c end
  local _, subs = call(folder, "GetSubFolderList")
  for _, s in pairs(type(subs) == "table" and subs or {}) do walk(s, depth + 1) end
end
walk(root, 0)

local subs_found = {}
for _, c in ipairs(clips) do
  local _, typ = call(c, "GetClipProperty", "Type")
  local _, path = call(c, "GetClipProperty", "File Path")
  typ, path = tostring(typ or ""), tostring(path or "")
  if typ:lower():find("subtitle") or path:lower():match("%.srt$") then subs_found[#subs_found + 1] = c end
end
out(string.format("media pool: %d clips, %d subtitle clips", #clips, #subs_found))

for i, c in ipairs(subs_found) do
  if i > 3 then out("(more subtitle clips not shown)"); break end
  local _, name = call(c, "GetName")
  out(string.format("== subtitle clip %d: %s", i, tostring(name)))

  -- 1. method list via the metatable
  local okm, mt = pcall(rawget(_G, "getmetatable") or function() return nil end, c)
  local names = {}
  if okm and type(mt) == "table" then
    local idx = rawget(mt, "__index")
    for _, t in ipairs({ mt, type(idx) == "table" and idx or {} }) do
      for k in pairs(t) do names[#names + 1] = tostring(k) end
    end
  end
  table.sort(names)
  out("metatable: " .. (okm and type(mt) or "error") .. ", entries " .. #names ..
    (#names > 0 and (": " .. table.concat(names, ",")) or ""))

  -- 2. candidate calls
  local candidates = {
    "GetTranscription", "GetTranscriptions", "GetTranscript", "GetTranscriptionData", "GetClipTranscription",
    "GetSubtitles", "GetSubtitle", "GetSubtitleText", "GetSubtitleList", "GetSubtitleItems", "GetCaptions",
    "GetText", "GetClipText", "GetMarkers", "GetThirdPartyMetadata", "GetMetadata", "GetAudioMapping",
    "GetMediaId", "GetUniqueId",
  }
  for _, m in ipairs(candidates) do
    local ok, r = call(c, m)
    if r ~= "no method" then
      out(m .. ": " .. (ok and describe(r) or ("error " .. short(r))))
    end
  end

  -- 3. all clip properties
  local okp, props = call(c, "GetClipProperty")
  if okp and type(props) == "table" then
    local keys = {}
    for k in pairs(props) do keys[#keys + 1] = tostring(k) end
    table.sort(keys)
    local parts = {}
    for _, k in ipairs(keys) do
      local v = tostring(props[k])
      if v ~= "" then parts[#parts + 1] = k .. "=" .. short(v, 50) end
    end
    out("properties (non-empty): " .. table.concat(parts, " | "))
  else
    out("properties: " .. short(props))
  end
end

if #subs_found == 0 then out("no subtitle clip found - import the SRT into the media pool first") end

if timeline then
  call(timeline, "DeleteMarkerByCustomData", TAG)
  local _, ok = call(timeline, "AddMarker", 10, "Purple", "SrtProbe", table.concat(lines, "\n"), 1, TAG)
  out("report marker: " .. tostring(ok))
end
