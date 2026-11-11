@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"
title BeatAnalyzer - Diagnose & Debug Tool (Windows)
color 0E

set "REPORT=%~dp0debug_report.txt"

echo ======================================================================
echo          BeatAnalyzer - Windows Systemdiagnose & Fehlerpruefung
echo ======================================================================
echo.
echo Erstelle Diagnosebericht in debug_report.txt...
echo.

(
    echo ======================================================================
    echo  BeatAnalyzer System-Diagnosebericht
    echo  Erstellt am: %DATE% %TIME%
    echo ======================================================================
    echo.
    echo --- Windows Info ---
    ver
    echo.
    echo --- Python im System-PATH ---
    where python 2>&1
    where py 2>&1
    echo.
    echo --- Git im System-PATH ---
    where git 2>&1
    echo.
    echo --- Ordnerinhalt ---
    dir /b
    echo.
) > "%REPORT%"

type "%REPORT%"

echo --- Teste venv-Umgebung ---
if exist "venv\Scripts\python.exe" (
    echo [OK] venv\Scripts\python.exe existiert.
    echo. >> "%REPORT%"
    echo --- venv Python Check --- >> "%REPORT%"
    venv\Scripts\python.exe backend\debug_check.py >> "%REPORT%" 2>&1
    venv\Scripts\python.exe backend\debug_check.py
) else (
    echo [HINWEIS] venv Ordner noch nicht angelegt oder unvollstaendig.
    echo Versuche System-Python direkt...
    python backend\debug_check.py >> "%REPORT%" 2>&1
    python backend\debug_check.py
)

echo.
echo ======================================================================
echo  Diagnose beendet!
echo  Der Bericht wurde gespeichert in:
echo  "%REPORT%"
echo ======================================================================
echo  Dieses Fenster bleibt geoeffnet, damit du den Fehler lesen kannst.
echo  Druecke eine Taste zum Schliessen.
pause
