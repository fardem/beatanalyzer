-- BeatAnalyzer_SrtToMarkers.lua - PROTOTYPE for DaVinci Resolve FREE (21.1+): turns the beat SRT next to a song into
-- markers on the song clip in the media pool AND on every use of the song in the open timeline. No window, no file
-- access (Free has neither): Resolve imports the SRT itself, the script reads the subtitles from a temporary
-- timeline, deletes that timeline again and takes the beat time from the subtitle TEXT ("... | 1.000s"), because
-- Resolve shifts subtitle positions when an SRT does not start at 0.
--
-- Use:   select the song in the media pool (else the first clip on A1 of the open timeline is used);
--        <song>.srt lies next to the audio file (song.flac -> song.srt). If an SRT clip of that name is already in
--        the media pool (any bin) it is used, else the SRT is imported into the bin "BeatAnalyzer".
--        Workspace > Scripts > BeatAnalyzer_SrtToMarkers
-- Result: markers "Takt x - Beat y" on the clip and the timeline clips (beat 1 red, others blue), old markers of
--        this script and of the FreeProbe are removed first, markers set by hand stay.
--        Report: purple timeline marker "BeatAnalyzer Free" at the timeline start, plus "[ba-free]" Console lines.
-- SRT text format: "Takt 1 - Beat 1 | 1.000s" (bar, beat, exact time in seconds); without "| <s>s" the position of
-- the subtitle is used instead.

local TAG = "beatanalyzer.free.v1"
local OLD_TAGS = { "beatanalyzer.freeprobe" }
local BIN = "BeatAnalyzer"
local TMP_TL = "BeatAnalyzer_tmp_srt"
local report = {}

local function out(s)
  report[#report + 1] = s
  local p = rawget(_G, "print")
  if type(p) == "function" then pcall(p, "[ba-free] " .. s) end
end

local function call(obj, method, ...)
  if obj == nil then return nil end
  local okf, fn = pcall(function() return obj[method] end)
  if not okf or fn == nil then return nil end
  local args, n = { ... }, select("#", ...)
  local unpack_ = rawget(_G, "unpack") or table.unpack
  local ok, r = pcall(function() return fn(obj, unpack_(args, 1, n)) end)
  if ok then return r end
  return nil
end

local function list(t)
  local r = {}
  if type(t) == "table" then
    if t[1] ~= nil then for _, v in ipairs(t) do r[#r + 1] = v end
    else for _, v in pairs(t) do r[#r + 1] = v end end
  end
  return r
end

local function num(v)
  local s = tostring(v or ""):match("%d+[%.,]?%d*")
  return s and tonumber((s:gsub(",", "."))) or nil
end

local function finish(timeline)
  if timeline then
    call(timeline, "DeleteMarkerByCustomData", "beatanalyzer.free.report")
    call(timeline, "AddMarker", 0, "Purple", "BeatAnalyzer Free", table.concat(report, "\n"), 1, "beatanalyzer.free.report")
  end
end

-- ── Resolve ────────────────────────────────────────────────────────────────────────────────────────────────────
local resolve = rawget(_G, "resolve")
if not resolve and type(rawget(_G, "Resolve")) == "function" then
  local ok, r = pcall(rawget(_G, "Resolve")); if ok then resolve = r end
end
if not resolve then out("No Resolve object."); return end
local project = call(call(resolve, "GetProjectManager"), "GetCurrentProject")
local mp = call(project, "GetMediaPool")
local timeline = call(project, "GetCurrentTimeline")
if not mp then out("No project open."); return end

-- ── Song: selected audio clip, else first clip on A1 ────────────────────────────────────────────────────────────
local function is_audio(clip)
  local typ = tostring(call(clip, "GetClipProperty", "Type") or ""):lower()
  local path = tostring(call(clip, "GetClipProperty", "File Path") or "")
  return path ~= "" and not typ:find("subtitle") and not typ:find("timeline") and not path:lower():match("%.srt$")
end

local song
for _, c in ipairs(list(call(mp, "GetSelectedClips"))) do
  if is_audio(c) then song = c; break end
end
if not song and timeline then
  local it = list(call(timeline, "GetItemListInTrack", "audio", 1))[1]
  local c = call(it, "GetMediaPoolItem")
  if c and is_audio(c) then song = c end
end
if not song then
  out("No song: select the audio clip in the media pool (not the SRT) or put it on A1 of the open timeline.")
  finish(timeline); return
end
local song_path = tostring(call(song, "GetClipProperty", "File Path"))
local song_dir = song_path:match("^(.*)[/\\][^/\\]*$") or ""
local SEP = song_path:find("\\", 1, true) and "\\" or "/"
local song_base = (song_path:match("([^/\\]+)$") or ""):gsub("%.[^%.]*$", "")
local srt_path = song_dir .. SEP .. song_base .. ".srt"
out("Song: " .. song_path)

-- ── SRT clip: already in the media pool (same file preferred, else same name, newest), else import ─────────────────
local all_clips, bins = {}, {}
local function walk(folder, depth)
  if not folder or depth > 20 then return end
  bins[#bins + 1] = folder
  for _, c in ipairs(list(call(folder, "GetClipList"))) do all_clips[#all_clips + 1] = c end
  for _, s in ipairs(list(call(folder, "GetSubFolderList"))) do walk(s, depth + 1) end
end
local root = call(mp, "GetRootFolder")
walk(root, 0)

local srt_clip, how
do
  local by_name = {}
  for _, c in ipairs(all_clips) do
    local typ = tostring(call(c, "GetClipProperty", "Type") or ""):lower()
    local p = tostring(call(c, "GetClipProperty", "File Path") or "")
    if typ:find("subtitle") or p:lower():match("%.srt$") then
      if p:lower() == srt_path:lower() then srt_clip, how = c, "media pool (same file)"; break end
      local base = (p:match("([^/\\]+)$") or ""):gsub("%.[^%.]*$", "")
      if base:lower() == song_base:lower() then by_name[#by_name + 1] = c end
    end
  end
  if not srt_clip then
    local okx, exists = pcall(function()
      local bmd = rawget(_G, "bmd"); return bmd and bmd.fileexists and bmd.fileexists(srt_path)
    end)
    if okx and exists then
      local bin
      for _, s in ipairs(list(call(root, "GetSubFolderList"))) do
        if call(s, "GetName") == BIN then bin = s end
      end
      bin = bin or call(mp, "AddSubFolder", root, BIN)
      local prev = call(mp, "GetCurrentFolder")
      if bin then call(mp, "SetCurrentFolder", bin) end
      srt_clip = list(call(mp, "ImportMedia", { srt_path }))[1]
      if prev then call(mp, "SetCurrentFolder", prev) end
      how = srt_clip and ("imported into bin " .. BIN) or nil
    end
  end
  if not srt_clip and #by_name > 0 then
    -- newest by "Date Added" is not sortable reliably as text; the last one found is usually the newest import
    srt_clip, how = by_name[#by_name], "media pool (same name, file elsewhere)"
  end
end
if not srt_clip then
  out("No SRT: neither " .. srt_path .. " nor an SRT clip named '" .. song_base .. "' in the media pool.")
  finish(timeline); return
end
out("SRT: " .. tostring(call(srt_clip, "GetClipProperty", "File Path")) .. " - " .. how)

-- ── Read the subtitles in a temporary timeline ──────────────────────────────────────────────────────────────────────
local beats, skipped, tmp_deleted = {}, 0, "-"
do
  -- remove a leftover of an earlier run
  for _, c in ipairs(all_clips) do
    if call(c, "GetName") == TMP_TL and tostring(call(c, "GetClipProperty", "Type") or ""):lower():find("timeline") then
      local n = call(project, "GetTimelineCount") or 0
      for i = 1, n do
        local t = call(project, "GetTimelineByIndex", i)
        if t and call(t, "GetName") == TMP_TL then call(mp, "DeleteTimelines", { t }); break end
      end
    end
  end
  local prev_folder = call(mp, "GetCurrentFolder")
  local tmp = call(mp, "CreateEmptyTimeline", TMP_TL)
  if prev_folder then call(mp, "SetCurrentFolder", prev_folder) end
  if not tmp then out("Could not create the temporary timeline."); finish(timeline); return end
  call(project, "SetCurrentTimeline", tmp)
  call(tmp, "AddTrack", "subtitle")
  local nt = tonumber(call(tmp, "GetTrackCount", "subtitle")) or 1
  if nt > 0 then call(tmp, "SetTrackEnable", "subtitle", nt, true) end
  call(mp, "AppendToTimeline", { srt_clip })
  local tl_fps = num(call(tmp, "GetSetting", "timelineFrameRate")) or 30
  local tl_start = tonumber(call(tmp, "GetStartFrame")) or 0
  for t = 1, nt do
    for _, it in ipairs(list(call(tmp, "GetItemListInTrack", "subtitle", t))) do
      local text = tostring(call(it, "GetName") or "")
      local bar, beat = text:match("[Tt]akt%s*(%d+)%s*%-%s*[Bb]eat%s*(%d+)")
      if not bar then bar, beat = text:match("[Bb]ar%s*(%d+)%s*%-%s*[Bb]eat%s*(%d+)") end
      local sec = num(text:match("|%s*([%d%.,]+)%s*s"))
      if not sec then
        local st = tonumber(call(it, "GetStart"))
        sec = st and (st - tl_start) / tl_fps or nil
      end
      if sec and text ~= "" then
        beats[#beats + 1] = { sec = sec, bar = tonumber(bar), beat = tonumber(beat), text = text }
      else
        skipped = skipped + 1
      end
    end
  end
  if timeline then call(project, "SetCurrentTimeline", timeline) end
  local ok = call(mp, "DeleteTimelines", { tmp })
  tmp_deleted = tostring(ok)
end
table.sort(beats, function(a, b) return a.sec < b.sec end)
out(string.format("Subtitles read: %d beats, %d skipped, temporary timeline deleted=%s", #beats, skipped, tmp_deleted))
if #beats == 0 then finish(timeline); return end

local function color(b) return b.beat == 1 and "Red" or "Blue" end
local function name(b)
  return b.bar and string.format("Takt %d - Beat %d", b.bar, b.beat) or string.format("Beat %.3fs", b.sec)
end

-- ── Markers on the clip in the media pool ───────────────────────────────────────────────────────────────────────
do
  call(song, "DeleteMarkerByCustomData", TAG)
  for _, t in ipairs(OLD_TAGS) do call(song, "DeleteMarkerByCustomData", t) end
  local fps = num(call(song, "GetClipProperty", "FPS")) or num(call(timeline, "GetSetting", "timelineFrameRate")) or 30
  local n = 0
  for _, b in ipairs(beats) do
    if call(song, "AddMarker", math.floor(b.sec * fps + 0.5), color(b), name(b), b.text, 1, TAG) then n = n + 1 end
  end
  out(string.format("Media pool clip: %d/%d markers (fps %s)", n, #beats, tostring(fps)))
end

-- ── Markers on every use of the song in the open timeline ───────────────────────────────────────────────────────────
if timeline then
  local fps = num(call(timeline, "GetSetting", "timelineFrameRate")) or 30
  local id = call(song, "GetMediaId")
  local uses, total = {}, 0
  for t = 1, tonumber(call(timeline, "GetTrackCount", "audio")) or 0 do
    for _, it in ipairs(list(call(timeline, "GetItemListInTrack", "audio", t))) do
      local c = call(it, "GetMediaPoolItem")
      if c and call(c, "GetMediaId") == id then
        call(it, "DeleteMarkerByCustomData", TAG)
        for _, tg in ipairs(OLD_TAGS) do call(it, "DeleteMarkerByCustomData", tg) end
        -- frames count from the start of the source file; only the visible part of a trimmed clip gets markers
        local left = tonumber(call(it, "GetLeftOffset")) or 0
        local dur = tonumber(call(it, "GetDuration"))
        local n = 0
        for _, b in ipairs(beats) do
          local f = math.floor(b.sec * fps + 0.5)
          if f >= left and (not dur or f < left + dur) then
            if call(it, "AddMarker", f, color(b), name(b), b.text, 1, TAG) then n = n + 1 end
          end
        end
        uses[#uses + 1] = "A" .. t .. ":" .. n
        total = total + n
      end
    end
  end
  out(string.format("Timeline '%s': %d markers on %d clip(s) %s", tostring(call(timeline, "GetName")), total, #uses,
    #uses > 0 and ("(" .. table.concat(uses, ", ") .. ")") or "- song not in this timeline"))
end

finish(timeline)
out("done")
