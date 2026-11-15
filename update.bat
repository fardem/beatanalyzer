@echo off
setlocal
cd /d "%~dp0"
chcp 65001 >nul
title BeatAnalyzer - Update from GitHub

if not exist "venv\Scripts\python.exe" (
    echo [NOTE] BeatAnalyzer is not installed yet. Run install_and_run.bat.
    pause
    exit /b 1
)

echo Checking GitHub for a new version of BeatAnalyzer...
venv\Scripts\python.exe backend\updater.py update
echo.
pause
