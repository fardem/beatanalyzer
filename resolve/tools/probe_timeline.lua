-- probe_timeline.lua - checks in Resolve what BeatAnalyzer_Markers.lua assumes when it puts the beat
-- subtitles under the song in the timeline. Run it once after a Resolve update or when the subtitles
-- are not at the right place.
--
-- Place:  %APPDATA%\Blackmagic Design\DaVinci Resolve\Support\Fusion\Scripts\Utility\
-- Start:  open the timeline, select the audio clip in the media pool, Workspace -> Scripts -> probe_timeline
-- Output: Workspace -> Console (tab "Lua"); send all lines starting with "[probe]".
--
-- What it checks:
--   1. Position of the clip in the timeline: GetStart, GetLeftOffset (front trim), GetDuration.
--   2. An SRT on a new, only active subtitle track starts at the timeline start and keeps its times.
--   3. Song second s lies at timeline frame  start + (s - left/fps) * fps  (start = GetStart of the clip).
-- The test track and the test SRT clip are removed again; the active subtitle track is restored.
-- The project is saved before the test.
--
-- Results with Resolve Studio 21.2.0.6 on Windows (timeline 29.97 fps, start 10:00:00:00 = frame 1080000,
-- clip at the timeline start, not trimmed, 9 subtitle tracks before):
--   - New track ST10 active, AppendToTimeline placed both subtitles, difference 0 frames: RESULT OK.
--   - GetSourceStartFrame is available (0 for this clip).
--   - Clip moved to frame 1080671, not trimmed: difference 0, RESULT OK.
--   - Clip at frame 1080466, trimmed at the front: GetLeftOffset 629 = GetSourceStartFrame 629 (timeline frames),
--     difference 0, RESULT OK. GetLeftOffset counts the front trim in timeline frames, as assumed.

local function p(...)
  local parts = {}
  for i = 1, select("#", ...) do parts[#parts + 1] = tostring((select(i, ...))) end
  print("[probe] " .. table.concat(parts, " "))
end

local resolve = Resolve()
local pm = resolve:GetProjectManager()
local project = pm:GetCurrentProject()
local tl = project and project:GetCurrentTimeline()
if not tl then p("No timeline open.") return end
local mp = project:GetMediaPool()

local function num(v)
  local m = tostring(v or ""):match("%d+[%.,]?%d*")
  return m and tonumber((m:gsub(",", "."))) or nil
end
local fps = num(tl:GetSetting("timelineFrameRate")) or 25
for _, base in ipairs({ 24, 30, 48, 60, 120 }) do
  if math.abs(fps - base * 1000 / 1001) < 0.005 then fps = base * 1000 / 1001 end
end
local tl_start = tl:GetStartFrame()
p("Resolve " .. tostring(resolve:GetVersionString()))
p(string.format("Timeline '%s' | start %s (frame %d) | fps %s (%.6f)", tl:GetName(), tl:GetStartTimecode(),
  tl_start, tostring(tl:GetSetting("timelineFrameRate")), fps))

-- The clip: first use of the clip selected in the media pool, else the first clip on A1
local selected = {}
for _, c in pairs(mp:GetSelectedClips() or {}) do
  local ok, id = pcall(function() return c:GetMediaId() end)
  if ok and id then selected[id] = c:GetName() end
end
local item
for i = 1, tl:GetTrackCount("audio") do
  for _, it in ipairs(tl:GetItemListInTrack("audio", i) or {}) do
    local mpi = it:GetMediaPoolItem()
    local id = mpi and mpi:GetMediaId()
    if (next(selected) == nil or (id and selected[id])) and (not item or it:GetStart() < item:GetStart()) then
      item = it
    end
  end
  if item and next(selected) == nil then break end
end
if not item then p("No matching audio clip in the timeline.") return end

local start, left, dur = item:GetStart(), item:GetLeftOffset(), item:GetDuration()
local mpi = item:GetMediaPoolItem()
p(string.format("Clip '%s' | GetStart %d | GetEnd %d | GetDuration %d | GetLeftOffset %s | GetRightOffset %s",
  item:GetName(), start, item:GetEnd(), dur, tostring(left), tostring(item:GetRightOffset())))
local okss, ss = pcall(function() return item:GetSourceStartFrame() end)
p("GetSourceStartFrame:", okss and tostring(ss) or "not available",
  "| clip FPS:", mpi and tostring(mpi:GetClipProperty("FPS")) or "?")

-- Test SRT: song seconds s1 and s1 + 1, 1 s after the visible start of the clip
local s1 = left / fps + 1.0
local shift = (start - tl_start - left) / fps
local function srt_time(sec)
  local ms = math.floor(sec * 1000 + 0.5)
  local fl = math.floor
  return string.format("%02d:%02d:%02d,%03d", fl(ms / 3600000), fl(ms / 60000) % 60, fl(ms / 1000) % 60, ms % 1000)
end
local srt = (os.getenv("TEMP") or ".") .. (package.config:sub(1, 1) == "\\" and "\\" or "/") .. "beatthis_probe.srt"
local f = io.open(srt, "w")
if not f then p("Cannot write " .. srt) return end
f:write("1\n" .. srt_time(s1 + shift) .. " --> " .. srt_time(s1 + shift + 0.5) .. "\nprobe one\n\n"
     .. "2\n" .. srt_time(s1 + 1 + shift) .. " --> " .. srt_time(s1 + 1.5 + shift) .. "\nprobe two\n")
f:close()
local expected1 = tl_start + math.floor((s1 + shift) * fps + 0.5)
local expected2 = tl_start + math.floor((s1 + 1 + shift) * fps + 0.5)
p(string.format("Song second %.3f -> expected frame %d (= GetStart %d + 1 s), second subtitle %d",
  s1, expected1, start, expected2))

pm:SaveProject()
p("Project saved.")

local enabled = {}
local n = tl:GetTrackCount("subtitle")
for i = 1, n do enabled[i] = tl:GetIsTrackEnabled("subtitle", i) end
tl:AddTrack("subtitle")
local target = tl:GetTrackCount("subtitle")
for i = 1, target - 1 do tl:SetTrackEnable("subtitle", i, false) end
tl:SetTrackEnable("subtitle", target, true)
p("Test track ST" .. target .. " active:", tostring(tl:GetIsTrackEnabled("subtitle", target)))

local imported = mp:ImportMedia({ srt })
local srt_item = imported and imported[1]
if not srt_item then
  p("ImportMedia of the SRT failed.")
else
  local res = mp:AppendToTimeline({ srt_item })
  p("AppendToTimeline returned:", res and (#res .. " item(s)") or "nil")
  local items = tl:GetItemListInTrack("subtitle", target) or {}
  p("Subtitles on the test track:", #items)
  local starts = {}
  for _, it in ipairs(items) do starts[#starts + 1] = it:GetStart() end
  table.sort(starts)
  if starts[1] then
    p(string.format("First subtitle at frame %d, expected %d -> difference %d", starts[1], expected1, starts[1] - expected1))
    if starts[2] then
      p(string.format("Second subtitle at frame %d, expected %d -> difference %d", starts[2], expected2, starts[2] - expected2))
    end
    if math.abs(starts[1] - expected1) <= 1 then
      p("RESULT: OK - BeatAnalyzer_Markers.lua places the subtitles correctly.")
    elseif left ~= 0 and math.abs(math.abs(starts[1] - expected1) - left) <= 1 then
      p("RESULT: difference = GetLeftOffset - the front trim is counted differently.")
    elseif tl_start ~= 0 and math.abs(math.abs(starts[1] - expected1) - tl_start) <= 1 then
      p("RESULT: difference = timeline start frame - the start timecode counts.")
    else
      p("RESULT: difference - please send these lines.")
    end
  else
    p("RESULT: nothing placed.")
  end
  mp:DeleteClips({ srt_item })
end

tl:DeleteTrack("subtitle", target)
for i = 1, n do tl:SetTrackEnable("subtitle", i, enabled[i] == true) end
os.remove(srt)
p("Test track and test clip removed, subtitle tracks restored.")
