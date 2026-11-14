--[[
BeatThis_Markers.lua - transition script. The program is called BeatAnalyzer since 0.0.5 and its
Resolve script BeatAnalyzer_Markers.lua.

The updater of 0.0.4 and older installs resolve/BeatThis_Markers.lua into Resolve. This file therefore
stays in the repository: it starts BeatAnalyzer_Markers.lua from the same folder. The installer of 0.0.5
and newer installs BeatAnalyzer_Markers.lua and removes this file from Resolve.
]]

local VERSION = "0.1.6"   -- same as the file VERSION, so older updaters replace the installed script

local source = debug and debug.getinfo and debug.getinfo(1, "S").source or ""
local dir = source:match("^@(.*[/\\])") or ""
local target = dir .. "BeatAnalyzer_Markers.lua"
local ok, err = pcall(dofile, target)
if not ok then
  print("[BeatAnalyzer] " .. VERSION .. ": BeatThis_Markers is now called BeatAnalyzer_Markers.")
  print("[BeatAnalyzer] Not found or not started: " .. target .. " (" .. tostring(err) .. ")")
  print("[BeatAnalyzer] In BeatAnalyzer: Export -> DaVinci Resolve -> install the script, then restart Resolve.")
end
