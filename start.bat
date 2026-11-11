@echo off
cd /d "%~dp0"
title BeatThis - Schnellstart (Windows)
color 0B

if not exist "venv\Scripts\activate.bat" (
    echo [HINWEIS] Die Umgebung ist noch nicht eingerichtet.
    echo Starte einmalig install_and_run.bat ...
    call install_and_run.bat
    exit /b
)

echo Aktiviere isolierte Python-Umgebung...
call venv\Scripts\activate.bat

echo Starte BeatThis Server auf http://localhost:8000 ...
start "" http://localhost:8000
venv\Scripts\python.exe backend\server.py

if %errorlevel% neq 0 (
    echo.
    echo [FEHLER] Der Server wurde unerwartet beendet.
    echo Starte bitte install_and_run.bat oder debug_system.bat zur Fehleranalyse.
)
pause
