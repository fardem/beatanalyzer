-- BeatAnalyzer_FreeProbe.lua - checks which scripting routes DaVinci Resolve FREE (21.1+) still allows, so a
-- BeatAnalyzer integration for Free can be built only on what works. Changes nothing in your timeline.
--
-- Free 21.1 reports (davinciresolveclub.com, AutoSubs, OpenBeats): Python and external scripts are Studio only;
-- .lua files from Workspace > Scripts still run, but io / os.execute / require and the UIManager can be missing,
-- print() from a menu script may show nothing, and on some builds Resolve() returns nil in a menu script.
-- That is why the result is written into the project as well, not only to the Console:
--   * Media Pool: bin "BeatAnalyzer_FreeProbe" with one sub-bin per test, e.g. "07 OK loadfile"
--   * Timeline marker "FreeProbe" (purple) at the start of the current timeline, the note holds the full report
--   * Console (Workspace > Console, tab Lua): all lines starting with "[freeprobe]"
--
-- Place:  Windows %APPDATA%\Blackmagic Design\DaVinci Resolve\Support\Fusion\Scripts\Utility\
--         Linux   ~/.local/share/DaVinciResolve/Fusion/Scripts/Utility/
--         macOS   ~/Library/Application Support/Blackmagic Design/DaVinci Resolve/Fusion/Scripts/Utility/
--         then restart Resolve.
-- Prepare: test project (or a copy), a timeline with a song on audio track A1. Next to the song file a SRT with the
--          same name (song.wav -> song.srt), e.g. exported from the BeatAnalyzer web app. Select the song in the
--          Media Pool (otherwise the first clip on A1 is used).
-- Start:  A) Workspace > Scripts > BeatAnalyzer_FreeProbe
--         B) if A shows nothing: Workspace > Console, tab "Lua", paste the whole file and press Enter.
-- Leaves behind (delete by hand): bin "BeatAnalyzer_FreeProbe", timeline "BeatAnalyzer_FreeProbe", the marker,
-- and next to the song possibly BeatAnalyzer_FreeProbe_io.txt / BeatAnalyzer_FreeProbe_export.edl.

-- loadfile self test: when this file is loaded by itself (test 07), stop here and report back.
if rawget(_G, "BA_FREEPROBE_SELFTEST") then
  return { selftest = "ok" }
end

local unpack = rawget(_G, "unpack") or (table and table.unpack)
local TAG = "beatanalyzer.freeprobe"
local NAME = "BeatAnalyzer_FreeProbe"
local results = {}

local function out(line)
  local p = rawget(_G, "print")
  if type(p) == "function" then
    pcall(p, "[freeprobe] " .. line)
  end
end

local function short(v)
  local s = tostring(v)
  s = s:gsub("[\r\n]+", " ")
  if #s > 160 then
    s = s:sub(1, 157) .. "..."
  end
  return s
end

-- status: OK, NO (missing / refused), NA (could not be tested), INFO
local function rec(id, status, what, detail)
  results[#results + 1] = { id = id, status = status, what = what, detail = detail and short(detail) or "" }
  out(string.format("%s %-4s %s %s", id, status, what, detail and ("- " .. short(detail)) or ""))
end

-- Calls obj:method(...) protected; returns ok, result1, result2.
local function call(obj, method, ...)
  if obj == nil then
    return false, "object nil"
  end
  local okf, fn = pcall(function() return obj[method] end)
  if not okf or fn == nil then
    return false, "no method " .. method
  end
  local args = { ... }
  local n = select("#", ...)
  local ok, r1, r2 = pcall(function() return fn(obj, unpack(args, 1, n)) end)
  if not ok then
    return false, r1
  end
  return true, r1, r2
end

local function g(name)
  local ok, v = pcall(rawget, _G, name)
  if ok then
    return v
  end
  return nil
end

local function count(t)
  local n = 0
  if type(t) == "table" then
    for _ in pairs(t) do n = n + 1 end
  end
  return n
end

local function first(t)
  if type(t) ~= "table" then
    return nil
  end
  if t[1] ~= nil then
    return t[1]
  end
  for _, v in pairs(t) do
    return v
  end
  return nil
end

out("---- BeatAnalyzer Free probe start ----")

-- 01 Lua sandbox: which standard functions exist ---------------------------------------------------------
do
  local io_ = g("io")
  local os_ = g("os")
  local present, missing = {}, {}
  local checks = {
    { "print", g("print") }, { "loadfile", g("loadfile") }, { "dofile", g("dofile") },
    { "loadstring", g("loadstring") }, { "load", g("load") }, { "require", g("require") },
    { "io.open", type(io_) == "table" and io_.open or nil },
    { "io.popen", type(io_) == "table" and io_.popen or nil },
    { "os.execute", type(os_) == "table" and os_.execute or nil },
    { "os.getenv", type(os_) == "table" and os_.getenv or nil },
    { "os.time", type(os_) == "table" and os_.time or nil },
    { "os.remove", type(os_) == "table" and os_.remove or nil },
    { "debug", g("debug") }, { "ffi", g("ffi") }, { "jit", g("jit") }, { "package", g("package") },
  }
  for _, c in ipairs(checks) do
    if c[2] ~= nil then present[#present + 1] = c[1] else missing[#missing + 1] = c[1] end
  end
  rec("01", "INFO", "Lua " .. tostring(g("_VERSION")) .. (g("jit") and (" / " .. tostring(g("jit").version)) or ""),
    "has: " .. table.concat(present, ",") .. " | missing: " .. (#missing > 0 and table.concat(missing, ",") or "-"))
end

-- 02 Host objects -------------------------------------------------------------------------------------------
local fu = g("fu") or g("fusion") or g("app")
local bmd = g("bmd")
do
  local names = {}
  for _, n in ipairs({ "resolve", "Resolve", "fu", "fusion", "app", "bmd", "comp" }) do
    if g(n) ~= nil then names[#names + 1] = n .. ":" .. type(g(n)) end
  end
  rec("02", #names > 0 and "INFO" or "NO", "Globals", #names > 0 and table.concat(names, ",") or "none of resolve/fu/bmd")
end

-- 03 Resolve object: try every known route ------------------------------------------------------------------
local resolve, route
do
  local tries = {
    { "global resolve", function() return g("resolve") end },
    { "Resolve()", function() local f = g("Resolve"); return type(f) == "function" and f() or nil end },
    { "bmd.scriptapp", function() return bmd and bmd.scriptapp and bmd.scriptapp("Resolve") or nil end },
    { "fu:GetResolve", function() return fu and fu.GetResolve and fu:GetResolve() or nil end },
  }
  local tried = {}
  for _, t in ipairs(tries) do
    local ok, r = pcall(t[2])
    local usable = ok and r ~= nil and select(2, call(r, "GetProjectManager")) ~= nil
    tried[#tried + 1] = t[1] .. "=" .. (usable and "yes" or (ok and (r == nil and "nil" or "no PM") or "error"))
    if usable and not resolve then
      resolve, route = r, t[1]
    end
  end
  rec("03", resolve and "OK" or "NO", "Resolve object", table.concat(tried, ", "))
end

if not resolve then
  out("No Resolve object - nothing else can be tested from here. Try start B (Console).")
  out("---- BeatAnalyzer Free probe end ----")
  return
end

-- 04 Version / edition -----------------------------------------------------------------------------------------
do
  local _, product = call(resolve, "GetProductName")
  local _, version = call(resolve, "GetVersionString")
  rec("04", "INFO", "Product", tostring(product) .. " " .. tostring(version) .. " (route: " .. route .. ")")
end

-- 05 UI for a window (BeatAnalyzer_Markers.lua needs it) -----------------------------------------------------------
do
  local ui = nil
  pcall(function() ui = fu and fu.UIManager end)
  local disp = bmd and bmd.UIDispatcher
  local waitfn = bmd and bmd.wait
  rec("05", (ui and disp) and "OK" or "NO", "UIManager window",
    "fu.UIManager=" .. tostring(ui ~= nil) .. " bmd.UIDispatcher=" .. tostring(disp ~= nil) ..
    " bmd.wait=" .. tostring(waitfn ~= nil))
end

-- Project, timeline, media pool --------------------------------------------------------------------------------
local _, pm = call(resolve, "GetProjectManager")
local _, project = call(pm, "GetCurrentProject")
local _, timeline = call(project, "GetCurrentTimeline")
local _, mp = call(project, "GetMediaPool")
local _, storage = call(resolve, "GetMediaStorage")
do
  local _, pname = call(project, "GetName")
  local _, tname = call(timeline, "GetName")
  local _, fps = call(timeline, "GetSetting", "timelineFrameRate")
  rec("06", (project and timeline and mp) and "OK" or "NO", "Project / timeline / media pool",
    "project=" .. tostring(pname) .. " timeline=" .. tostring(tname) .. " fps=" .. tostring(fps) ..
    " mediaPool=" .. tostring(mp ~= nil) .. " mediaStorage=" .. tostring(storage ~= nil))
end

-- Song: selected clip in the media pool, else first clip on A1 -----------------------------------------------
local song, song_path, song_source
do
  local ok, sel = call(mp, "GetSelectedClips")
  local c = ok and first(sel) or nil
  if c then
    local _, p = call(c, "GetClipProperty", "File Path")
    if p and p ~= "" then song, song_path, song_source = c, p, "media pool selection" end
  end
  if not song and timeline then
    local _, items = call(timeline, "GetItemListInTrack", "audio", 1)
    local it = first(items)
    local _, mpi = call(it, "GetMediaPoolItem")
    local _, p = call(mpi, "GetClipProperty", "File Path")
    if p and p ~= "" then song, song_path, song_source = mpi, p, "first clip on A1" end
  end
end

local SEP = (song_path and song_path:find("\\", 1, true)) and "\\" or "/"
local song_dir = song_path and song_path:match("^(.*)[/\\][^/\\]*$") or nil
local song_base = song_path and (song_path:match("([^/\\]+)$") or ""):gsub("%.[^%.]*$", "") or nil
local srt_path = song_dir and (song_dir .. SEP .. song_base .. ".srt") or nil
rec("07", "INFO", "Song", song and (song_source .. ": " .. song_path) or "no song found (select it in the media pool)")

-- 08 MediaStorage:GetFileList as a way to look into a folder without io --------------------------------------
local srt_seen = nil
do
  if storage and song_dir then
    local ok, files = call(storage, "GetFileList", song_dir)
    if ok and type(files) == "table" then
      srt_seen = false
      for _, f in pairs(files) do
        if tostring(f):lower() == srt_path:lower() then srt_seen = true end
      end
      rec("08", "OK", "MediaStorage:GetFileList", count(files) .. " files, SRT listed=" .. tostring(srt_seen))
    else
      rec("08", "NO", "MediaStorage:GetFileList", files)
    end
  else
    rec("08", "NA", "MediaStorage:GetFileList", "no media storage or no song")
  end
end

-- 09 io.open read + write ----------------------------------------------------------------------------------------
do
  local io_ = g("io")
  if type(io_) ~= "table" or type(io_.open) ~= "function" then
    rec("09", "NO", "io.open", "io not available")
  elseif not song_dir then
    rec("09", "NA", "io.open", "no song folder")
  else
    local okr, fr = pcall(io_.open, song_path, "rb")
    local read_ok = okr and fr ~= nil
    if read_ok then pcall(function() fr:close() end) end
    local wpath = song_dir .. SEP .. NAME .. "_io.txt"
    local okw, fw = pcall(io_.open, wpath, "wb")
    local write_ok = okw and fw ~= nil
    if write_ok then pcall(function() fw:write("BeatAnalyzer Free probe\n"); fw:close() end) end
    rec("09", (read_ok and write_ok) and "OK" or "NO", "io.open", "read song=" .. tostring(read_ok) ..
      " write " .. wpath .. "=" .. tostring(write_ok))
  end
end

-- 10 loadfile / dofile: read Lua data written by the backend ---------------------------------------------------
do
  local lf, df = g("loadfile"), g("dofile")
  local self_path = nil
  local dbg = g("debug")
  if type(dbg) == "table" and dbg.getinfo then
    local ok, info = pcall(function() return dbg.getinfo(1, "S") end)
    local src = ok and info and info.source or ""
    if src:sub(1, 1) == "@" then self_path = src:sub(2) end
  end
  if not self_path and fu and fu.MapPath then
    local ok, p = pcall(function() return fu:MapPath("Scripts:Utility/" .. NAME .. ".lua") end)
    if ok and p then self_path = p end
  end
  if type(lf) ~= "function" and type(df) ~= "function" then
    rec("10", "NO", "loadfile/dofile", "both missing")
  elseif not self_path then
    rec("10", "NA", "loadfile/dofile", "own file path unknown (Console paste?) loadfile=" .. tostring(lf ~= nil) ..
      " dofile=" .. tostring(df ~= nil))
  else
    rawset(_G, "BA_FREEPROBE_SELFTEST", true)
    local res_lf, res_df = "missing", "missing"
    if type(lf) == "function" then
      local ok, chunk = pcall(lf, self_path)
      if ok and type(chunk) == "function" then
        local ok2, t = pcall(chunk)
        res_lf = (ok2 and type(t) == "table" and t.selftest == "ok") and "ok" or ("run failed: " .. tostring(t))
      else
        res_lf = "failed: " .. tostring(chunk)
      end
    end
    if type(df) == "function" then
      local ok, t = pcall(df, self_path)
      res_df = (ok and type(t) == "table" and t.selftest == "ok") and "ok" or ("failed: " .. tostring(t))
    end
    rawset(_G, "BA_FREEPROBE_SELFTEST", nil)
    rec("10", (res_lf == "ok" or res_df == "ok") and "OK" or "NO", "loadfile/dofile",
      "loadfile=" .. res_lf .. " dofile=" .. res_df .. " (" .. self_path .. ")")
  end
end

-- 11 Bin in the media pool (also the place where the results are shown) ----------------------------------------
local probe_bin
do
  local _, root = call(mp, "GetRootFolder")
  local _, subs = call(root, "GetSubFolderList")
  for _, s in pairs(type(subs) == "table" and subs or {}) do
    local _, n = call(s, "GetName")
    if n == NAME then probe_bin = s end
  end
  if probe_bin then
    -- clear results of an earlier run
    local _, old = call(probe_bin, "GetSubFolderList")
    if type(old) == "table" and count(old) > 0 then
      local list = {}
      for _, f in pairs(old) do list[#list + 1] = f end
      call(mp, "DeleteFolders", list)
    end
    local _, clips = call(probe_bin, "GetClipList")
    if type(clips) == "table" and count(clips) > 0 then
      local list = {}
      for _, c in pairs(clips) do list[#list + 1] = c end
      call(mp, "DeleteClips", list)
    end
  else
    local _, b = call(mp, "AddSubFolder", root, NAME)
    probe_bin = b
  end
  rec("11", probe_bin and "OK" or "NO", "MediaPool:AddSubFolder", probe_bin and NAME or "could not create bin")
end

-- 12 Marker on the song clip (MediaPoolItem) - added and removed again --------------------------------------------
do
  if not song then
    rec("12", "NA", "MediaPoolItem:AddMarker", "no song")
  else
    local ok, added = call(song, "AddMarker", 0, "Purple", "FreeProbe", "test marker, removed again", 1, TAG)
    local _, removed = call(song, "DeleteMarkerByCustomData", TAG)
    rec("12", (ok and added) and "OK" or "NO", "MediaPoolItem:AddMarker",
      "added=" .. tostring(added) .. " removed=" .. tostring(removed))
  end
end

-- 13 SRT import into the bin ------------------------------------------------------------------------------------------
local srt_item
do
  if not srt_path then
    rec("13", "NA", "ImportMedia(SRT)", "no song, so no SRT path")
  elseif srt_seen == false then
    rec("13", "NA", "ImportMedia(SRT)", "not found next to the song: " .. srt_path)
  else
    local _, prev = call(mp, "GetCurrentFolder")
    if probe_bin then call(mp, "SetCurrentFolder", probe_bin) end
    local ok, items = call(mp, "ImportMedia", { srt_path })
    if prev then call(mp, "SetCurrentFolder", prev) end
    srt_item = ok and first(items) or nil
    local _, n = call(srt_item, "GetName")
    rec("13", srt_item and "OK" or "NO", "ImportMedia(SRT)", srt_item and ("imported " .. tostring(n)) or
      ("failed: " .. tostring(items) .. " " .. srt_path))
  end
end

-- 14 SRT on a subtitle track - in a separate test timeline, your timeline stays as it is ---------------------------
do
  if not srt_item then
    rec("14", "NA", "Subtitle track + AppendToTimeline", "no imported SRT")
  else
    local _, prev = call(mp, "GetCurrentFolder")
    if probe_bin then call(mp, "SetCurrentFolder", probe_bin) end
    local _, test_tl = call(mp, "CreateEmptyTimeline", NAME .. " " .. tostring(g("os") and g("os").time and g("os").time() or ""))
    if prev then call(mp, "SetCurrentFolder", prev) end
    if not test_tl then
      rec("14", "NO", "Subtitle track + AppendToTimeline", "CreateEmptyTimeline failed")
    else
      call(project, "SetCurrentTimeline", test_tl)
      local _, added = call(test_tl, "AddTrack", "subtitle")
      local _, n = call(test_tl, "GetTrackCount", "subtitle")
      n = tonumber(n) or 0
      if n > 0 then call(test_tl, "SetTrackEnable", "subtitle", n, true) end
      local _, appended = call(mp, "AppendToTimeline", { srt_item })
      local _, items = call(test_tl, "GetItemListInTrack", "subtitle", math.max(n, 1))
      local placed = count(items)
      rec("14", placed > 0 and "OK" or "NO", "Subtitle track + AppendToTimeline",
        "AddTrack=" .. tostring(added) .. " tracks=" .. n .. " appended=" .. tostring(appended ~= nil and appended ~= false) ..
        " subtitles placed=" .. placed)
      if timeline then call(project, "SetCurrentTimeline", timeline) end
    end
  end
end

-- 15 Write routes without io: timeline export and Fusion prefs --------------------------------------------------------
do
  if timeline and song_dir and resolve.EXPORT_EDL then
    local p = song_dir .. SEP .. NAME .. "_export.edl"
    local _, r = call(timeline, "Export", p, resolve.EXPORT_EDL, resolve.EXPORT_NONE)
    rec("15", r and "OK" or "NO", "Timeline:Export (write file without io)", tostring(r) .. " -> " .. p)
  else
    rec("15", "NA", "Timeline:Export", "no timeline, no song folder or no EXPORT_EDL constant")
  end
  if fu and fu.SetPrefs then
    local ok1 = call(fu, "SetPrefs", "Global.BeatAnalyzerFreeProbe.Stamp", tostring(g("os") and g("os").time and g("os").time() or "x"))
    local ok2, saved = call(fu, "SavePrefs")
    local _, back = call(fu, "GetPrefs", "Global.BeatAnalyzerFreeProbe.Stamp")
    rec("16", (ok1 and back) and "OK" or "NO", "Fusion SetPrefs/SavePrefs (mailbox like AutoSubs)",
      "set=" .. tostring(ok1) .. " save=" .. tostring(ok2 and saved) .. " read back=" .. tostring(back))
  else
    rec("16", "NA", "Fusion SetPrefs", "no fusion object")
  end
end

-- Show the results in the project ------------------------------------------------------------------------------------
local n_ok, n_no = 0, 0
for _, r in ipairs(results) do
  if r.status == "OK" then n_ok = n_ok + 1 elseif r.status == "NO" then n_no = n_no + 1 end
end
local lines = {}
for _, r in ipairs(results) do
  lines[#lines + 1] = r.id .. " " .. r.status .. " " .. r.what .. (r.detail ~= "" and (": " .. r.detail) or "")
end
local report = table.concat(lines, "\n")

if probe_bin then
  for _, r in ipairs(results) do
    local label = (r.id .. " " .. r.status .. " " .. r.what):gsub("[/\\:]", "-")
    call(mp, "AddSubFolder", probe_bin, label)
  end
  call(mp, "AddSubFolder", probe_bin, string.format("00 SUMMARY %d OK %d NO", n_ok, n_no))
end

if timeline then
  local _, start = call(timeline, "GetStartFrame")
  call(timeline, "DeleteMarkerByCustomData", TAG)
  local _, ok = call(timeline, "AddMarker", 0, "Purple", "FreeProbe", report, 1, TAG)
  out("report marker on the timeline: " .. tostring(ok) .. " (start frame " .. tostring(start) .. ")")
end

out(string.format("SUMMARY %d OK, %d NO", n_ok, n_no))
out("---- BeatAnalyzer Free probe end ----")
