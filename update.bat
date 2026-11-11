@echo off
setlocal
cd /d "%~dp0"
chcp 65001 >nul
title BeatAnalyzer - Update von GitHub

if not exist "venv\Scripts\python.exe" (
    echo [HINWEIS] BeatAnalyzer ist noch nicht installiert. Starte install_and_run.bat.
    pause
    exit /b 1
)

echo Pruefe GitHub auf eine neue Version von BeatAnalyzer...
venv\Scripts\python.exe backend\updater.py update
echo.
pause
