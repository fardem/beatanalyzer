@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"
title BeatAnalyzer - Diagnostics ^& debug tool (Windows)
color 0E

set "REPORT=%~dp0debug_report.txt"

echo ======================================================================
echo          BeatAnalyzer - Windows system diagnostics ^& error check
echo ======================================================================
echo.
echo Writing the diagnostic report to debug_report.txt...
echo.

(
    echo ======================================================================
    echo  BeatAnalyzer system diagnostic report
    echo  Created: %DATE% %TIME%
    echo ======================================================================
    echo.
    echo --- Windows Info ---
    ver
    echo.
    echo --- Python in the system PATH ---
    where python 2>&1
    where py 2>&1
    echo.
    echo --- Git in the system PATH ---
    where git 2>&1
    echo.
    echo --- Folder contents ---
    dir /b
    echo.
) > "%REPORT%"

type "%REPORT%"

echo --- Testing the venv ---
if exist "venv\Scripts\python.exe" (
    echo [OK] venv\Scripts\python.exe exists.
    echo. >> "%REPORT%"
    echo --- venv Python Check --- >> "%REPORT%"
    venv\Scripts\python.exe backend\debug_check.py >> "%REPORT%" 2>&1
    venv\Scripts\python.exe backend\debug_check.py
) else (
    echo [NOTE] The folder venv is missing or incomplete.
    echo Trying the system Python...
    python backend\debug_check.py >> "%REPORT%" 2>&1
    python backend\debug_check.py
)

echo.
echo ======================================================================
echo  Diagnostics finished.
echo  The report was saved to:
echo  "%REPORT%"
echo ======================================================================
echo  This window stays open so you can read the error.
echo  Press any key to close.
pause
