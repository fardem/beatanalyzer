@echo off
cd /d "%~dp0"
title BeatThis - Drag and Drop CLI Analyzer (Windows)
color 0A

if "%~1"=="" (
    echo ======================================================================
    echo  BeatThis CLI Analyzer (Drag & Drop)
    echo ======================================================================
    echo  Ziehe einfach eine MP3-, WAV-, AAC- oder FLAC-Datei auf diese
    echo  .bat-Datei im Windows Explorer, um sie sofort zu analysieren!
    echo.
    echo  Oder gib den Pfad manuell ein:
    set /p AUDIO_FILE="Audio-Dateipfad: "
) else (
    set AUDIO_FILE=%~1
)

if not exist "%AUDIO_FILE%" (
    echo [FEHLER] Datei nicht gefunden: %AUDIO_FILE%
    pause
    exit /b 1
)

if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
)

python backend\analyze_cli.py "%AUDIO_FILE%"

echo.
echo Fertig! JSON-Ergebnisse wurden im selben Ordner wie die Audiodatei gespeichert.
pause
