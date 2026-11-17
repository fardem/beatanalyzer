@echo off
cd /d "%~dp0"
title BeatAnalyzer - Quick start (Windows)
color 0B

if not exist "venv\Scripts\activate.bat" (
    echo [NOTE] The environment is not set up yet.
    echo Running install_and_run.bat once ...
    call install_and_run.bat
    exit /b
)

echo Activating the Python environment...
call venv\Scripts\activate.bat

echo Starting the BeatAnalyzer server on http://localhost:8000 ...
echo The web app opens in your browser as soon as the server is ready.
venv\Scripts\python.exe backend\server.py --open-browser

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] The server stopped unexpectedly.
    echo Please run install_and_run.bat, or debug_system.bat to find the cause.
)
pause
