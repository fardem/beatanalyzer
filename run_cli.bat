@echo off
cd /d "%~dp0"
title BeatAnalyzer - Drag and Drop CLI Analyzer (Windows)
color 0A

if "%~1"=="" (
    echo ======================================================================
    echo  BeatAnalyzer CLI Analyzer ^(Drag ^& Drop^)
    echo ======================================================================
    echo  Drop an audio file - MP3, WAV, AAC/M4A, FLAC ... - on this
    echo  .bat file in Windows Explorer to analyse it right away.
    echo.
    echo  Or enter the path by hand:
    set /p AUDIO_FILE="Audio file path: "
) else (
    set AUDIO_FILE=%~1
)

if not exist "%AUDIO_FILE%" (
    echo [ERROR] File not found: %AUDIO_FILE%
    pause
    exit /b 1
)

if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
)

python backend\analyze_cli.py "%AUDIO_FILE%"

echo.
echo Done. The JSON results were saved next to the audio file.
pause
