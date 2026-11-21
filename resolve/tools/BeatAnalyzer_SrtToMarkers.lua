-- BeatAnalyzer_SrtToMarkers.lua - PROTOTYPE for DaVinci Resolve FREE (21.1+): turns the beat SRT of a song (in the media pool) into
-- markers on the song clip in the media pool AND on every use of the song in the open timeline. No window, no file
-- access (Free has neither): the user imports the SRT into the media pool, the script reads the subtitles from a temporary
-- timeline, deletes that timeline again and takes the beat time from the subtitle TEXT ("... | 1.000s"), because
-- Resolve shifts subtitle positions when an SRT does not start at 0.
--
-- Rule:  the beat SRT is imported into the MEDIA POOL by the user (any bin) and has the name of the audio clip
--        without extension: "04. My Humps.flac" <-> "04. My Humps" (from 04. My Humps.srt). Exactly ONE SRT clip per
--        name: with two or more the song is skipped and both paths are reported - delete the old one.
--        Files on disk are not looked at.
-- Use:   nothing selected = every audio clip in the media pool that has its SRT; selected audio clip(s) = only
--        those; a selected SRT clip = its audio clip(s). Workspace > Scripts > BeatAnalyzer_SrtToMarkers
-- Result: markers "Takt x - Beat y" on the clip and the timeline clips (beat 1 red, others blue), old markers of
--        this script and of the FreeProbe are removed first, markers set by hand stay.
--        Report: purple timeline marker "BeatAnalyzer Free" at the timeline start, plus "[ba-free]" Console lines.
-- SRT text format: "Takt 1 - Beat 1 | 1.000s" (bar, beat, exact time in seconds); without "| <s>s" the position of
-- the subtitle is used instead.

local TAG = "beatanalyzer.free.v1"
local OLD_TAGS = { "beatanalyzer.freeprobe" }
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

-- ── Collect the media pool: audio clips and SRT clips, all bins ─────────────────────────────────────────────────
local function ctype(c) return tostring(call(c, "GetClipProperty", "Type") or ""):lower() end
local function cpath(c) return tostring(call(c, "GetClipProperty", "File Path") or "") end
-- Clip name without the extension of its file: "04. My Humps.flac" -> "04. My Humps"; "04. My Humps" stays
-- (names may contain dots, so only the real file extension is removed).
local function base_of(c)
  local n = tostring(call(c, "GetName") or "")
  local ext = cpath(c):match("(%.[^%.\\/]+)$")
  if ext and #n > #ext and n:lower():sub(-#ext) == ext:lower() then n = n:sub(1, -#ext - 1) end
  return n
end
local function is_srt(c) return ctype(c):find("subtitle") ~= nil or cpath(c):lower():match("%.srt$") ~= nil end
local function is_audio(c)
  local t = ctype(c)
  return cpath(c) ~= "" and not is_srt(c) and not t:find("timeline") and (t:find("audio") ~= nil or t == "")
end

local all_clips = {}
local function walk(folder, depth)
  if not folder or depth > 20 then return end
  for _, c in ipairs(list(call(folder, "GetClipList"))) do all_clips[#all_clips + 1] = c end
  for _, s in ipairs(list(call(folder, "GetSubFolderList"))) do walk(s, depth + 1) end
end
walk(call(mp, "GetRootFolder"), 0)

local srts, audios = {}, {}
for _, c in ipairs(all_clips) do
  if is_srt(c) then
    local k = base_of(c):lower()
    srts[k] = srts[k] or {}
    table.insert(srts[k], c)
  elseif is_audio(c) then
    audios[#audios + 1] = c
  end
end

-- targets: selection or everything that has an SRT
local targets, selected = {}, list(call(mp, "GetSelectedClips"))
local function key_of(c) return base_of(c):lower() end
if #selected > 0 then
  local want = {}
  for _, c in ipairs(selected) do want[key_of(c)] = true end
  for _, a in ipairs(audios) do if want[key_of(a)] then targets[#targets + 1] = a end end
  out(string.format("Selection: %d clip(s) -> %d audio clip(s)", #selected, #targets))
else
  for _, a in ipairs(audios) do if srts[key_of(a)] then targets[#targets + 1] = a end end
  out(string.format("No selection: %d audio clip(s) with an SRT in the media pool", #targets))
end
if #targets == 0 then
  out("Nothing to do: import <song>.srt into the media pool (name = audio clip name without extension).")
  finish(timeline); return
end

-- ── Read one SRT clip in a temporary timeline ───────────────────────────────────────────────────────────────────────
local function read_srt(srt_clip)
  -- leftover of an earlier run
  for i = 1, tonumber(call(project, "GetTimelineCount")) or 0 do
    local t = call(project, "GetTimelineByIndex", i)
    if t and call(t, "GetName") == TMP_TL then call(mp, "DeleteTimelines", { t }); break end
  end
  local tmp = call(mp, "CreateEmptyTimeline", TMP_TL)
  if not tmp then return nil, "could not create the temporary timeline" end
  call(project, "SetCurrentTimeline", tmp)
  call(tmp, "AddTrack", "subtitle")
  local nt = tonumber(call(tmp, "GetTrackCount", "subtitle")) or 1
  if nt > 0 then call(tmp, "SetTrackEnable", "subtitle", nt, true) end
  call(mp, "AppendToTimeline", { srt_clip })
  local tl_fps = num(call(tmp, "GetSetting", "timelineFrameRate")) or 30
  local tl_start = tonumber(call(tmp, "GetStartFrame")) or 0
  local beats, skipped = {}, 0
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
  local deleted = call(mp, "DeleteTimelines", { tmp })
  table.sort(beats, function(a, b) return a.sec < b.sec end)
  return beats, string.format("%d beats, %d skipped, temp timeline deleted=%s", #beats, skipped, tostring(deleted))
end

local function color(b) return b.beat == 1 and "Red" or "Blue" end
local function name(b)
  return b.bar and string.format("Takt %d - Beat %d", b.bar, b.beat) or string.format("Beat %.3fs", b.sec)
end
local function clear(obj)
  call(obj, "DeleteMarkerByCustomData", TAG)
  for _, t in ipairs(OLD_TAGS) do call(obj, "DeleteMarkerByCustomData", t) end
end

-- ── Per song: SRT -> markers on the media pool clip and its uses in the open timeline ──────────────────────────────
local tl_fps = timeline and num(call(timeline, "GetSetting", "timelineFrameRate")) or 30
local done, skipped_songs = 0, 0
for _, song in ipairs(targets) do
  local sname = tostring(call(song, "GetName"))
  local found = srts[key_of(song)] or {}
  if #found == 0 then
    out(sname .. ": no SRT clip '" .. base_of(song) .. "' in the media pool - skipped")
    skipped_songs = skipped_songs + 1
  elseif #found > 1 then
    out(sname .. ": " .. #found .. " SRT clips with this name - delete the old one(s), skipped:")
    for _, c in ipairs(found) do out("   " .. cpath(c)) end
    skipped_songs = skipped_songs + 1
  else
    local beats, info = read_srt(found[1])
    out(sname .. ": SRT " .. cpath(found[1]) .. " - " .. tostring(info))
    if beats and #beats > 0 then
      clear(song)
      local fps = num(call(song, "GetClipProperty", "FPS")) or tl_fps
      local n = 0
      for _, b in ipairs(beats) do
        if call(song, "AddMarker", math.floor(b.sec * fps + 0.5), color(b), name(b), b.text, 1, TAG) then n = n + 1 end
      end
      local msg = string.format("   media pool clip: %d/%d markers", n, #beats)
      if timeline then
        local id = call(song, "GetMediaId")
        local uses, total = {}, 0
        for t = 1, tonumber(call(timeline, "GetTrackCount", "audio")) or 0 do
          for _, it in ipairs(list(call(timeline, "GetItemListInTrack", "audio", t))) do
            local c = call(it, "GetMediaPoolItem")
            if c and call(c, "GetMediaId") == id then
              clear(it)
              -- frames count from the start of the source file; a trimmed clip gets only its visible part
              local left = tonumber(call(it, "GetLeftOffset")) or 0
              local dur = tonumber(call(it, "GetDuration"))
              local k = 0
              for _, b in ipairs(beats) do
                local f = math.floor(b.sec * tl_fps + 0.5)
                if f >= left and (not dur or f < left + dur) then
                  if call(it, "AddMarker", f, color(b), name(b), b.text, 1, TAG) then k = k + 1 end
                end
              end
              uses[#uses + 1] = "A" .. t .. ":" .. k
              total = total + k
            end
          end
        end
        msg = msg .. string.format(" | timeline: %d markers on %d clip(s)%s", total, #uses,
          #uses > 0 and (" (" .. table.concat(uses, ", ") .. ")") or "")
      end
      out(msg)
      done = done + 1
    else
      skipped_songs = skipped_songs + 1
    end
  end
end

out(string.format("done: %d song(s) with markers, %d skipped", done, skipped_songs))
finish(timeline)
