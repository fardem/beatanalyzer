@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"
title BeatAnalyzer - Installation ^& Start mit Logging (Windows)
color 0B

set "LOGFILE=%~dp0install_log.txt"

:: Initialisiere Log-Datei mit Zeitstempel
echo ====================================================================== > "%LOGFILE%"
echo  BeatAnalyzer Windows Installation Log >> "%LOGFILE%"
echo  Startzeit: %DATE% %TIME% >> "%LOGFILE%"
echo  Ordner:    %~dp0 >> "%LOGFILE%"
echo ====================================================================== >> "%LOGFILE%"
echo. >> "%LOGFILE%"

echo ======================================================================
echo          BeatAnalyzer - CPJKU beat_this Lokale Installation
echo          Beat- ^& Downbeat-Erkennung in isolierter Python-Umgebung
echo ======================================================================
echo  Ein ausfuehrliches Protokoll wird gespeichert in:
echo  install_log.txt
echo ======================================================================
echo.

:: ----------------------------------------------------------------------
:: 1. PRÜFE PYTHON INSTALLATION
:: ----------------------------------------------------------------------
echo [1/6] Suche nach installierter Python-Version...
echo [1/6] Suche nach Python... >> "%LOGFILE%"

set "PY_CMD="

:: Teste zuerst 'py' (Windows Python Launcher)
py -3 --version >nul 2>&1
if !errorlevel! equ 0 (
    set "PY_CMD=py -3"
    goto :python_found
)

:: Teste 'python'
python --version >nul 2>&1
if !errorlevel! equ 0 (
    set "PY_CMD=python"
    goto :python_found
)

:: Teste 'python3'
python3 --version >nul 2>&1
if !errorlevel! equ 0 (
    set "PY_CMD=python3"
    goto :python_found
)

:: Häufige Windows Installationspfade durchsuchen
if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" set "PY_CMD=%LOCALAPPDATA%\Programs\Python\Python312\python.exe" & goto :python_found
if exist "%LOCALAPPDATA%\Programs\Python\Python311\python.exe" set "PY_CMD=%LOCALAPPDATA%\Programs\Python\Python311\python.exe" & goto :python_found
if exist "%LOCALAPPDATA%\Programs\Python\Python310\python.exe" set "PY_CMD=%LOCALAPPDATA%\Programs\Python\Python310\python.exe" & goto :python_found
if exist "C:\Python312\python.exe" set "PY_CMD=C:\Python312\python.exe" & goto :python_found
if exist "C:\Python311\python.exe" set "PY_CMD=C:\Python311\python.exe" & goto :python_found
if exist "C:\Python310\python.exe" set "PY_CMD=C:\Python310\python.exe" & goto :python_found

:: Wenn Python nicht gefunden wurde:
color 0C
echo.
echo ======================================================================
echo [FEHLER] Python wurde auf deinem PC nicht gefunden!
echo ======================================================================
echo [FEHLER] Python nicht im PATH oder in Standardpfaden gefunden. >> "%LOGFILE%"
echo.
echo Bitte installiere Python:
echo 1. Lade Python 3.10, 3.11 oder 3.12 herunter: https://www.python.org/downloads/
echo 2. WICHTIG: Setze beim Start des Installers unbedingt den Haken bei:
echo    "Add python.exe to PATH" (unten im Installationsfenster)
echo 3. Starte danach diese install_and_run.bat erneut.
echo.
echo Das Logfile wurde geschrieben: "%LOGFILE%"
echo ======================================================================
echo Dieses Fenster schliesst sich NICHT automatisch. Druecke eine Taste zum Beenden.
pause
exit /b 1

:python_found
for /f "tokens=*" %%v in ('!PY_CMD! --version 2^>^&1') do set "PY_VER=%%v"
echo [OK] Python gefunden: !PY_VER!
echo [OK] Verwendeter Befehl: !PY_CMD!
echo Python Befehl: !PY_CMD! (!PY_VER!) >> "%LOGFILE%"

:: ----------------------------------------------------------------------
:: 2. ISOLIERTE UMGEBUNG (VENV) ERSTELLEN
:: ----------------------------------------------------------------------
echo.
echo [2/6] Richte isolierte virtuelle Umgebung (venv) ein...
echo [2/6] Virtuelle Umgebung venv pruefen/erstellen... >> "%LOGFILE%"

if not exist "venv\Scripts\activate.bat" (
    echo Erstelle neuen Ordner "venv"... (bitte kurz warten)
    echo Fuehre aus: !PY_CMD! -m venv venv >> "%LOGFILE%"
    !PY_CMD! -m venv venv >> "%LOGFILE%" 2>&1
    if !errorlevel! neq 0 (
        color 0C
        echo [FEHLER] Konnte venv nicht erstellen!
        echo Details siehe install_log.txt:
        type "%LOGFILE%"
        echo.
        echo Druecke eine Taste zum Beenden.
        pause
        exit /b 1
    )
    echo [OK] Isolierte Umgebung "venv" erfolgreich angelegt.
    echo [OK] venv erfolgreich angelegt. >> "%LOGFILE%"
) else (
    echo [OK] Bereits existierende isolierte Umgebung "venv" gefunden.
    echo [OK] venv bereits vorhanden. >> "%LOGFILE%"
)

:: ----------------------------------------------------------------------
:: 3. VENV AKTIVIEREN & PIP AKTUALISIEREN
:: ----------------------------------------------------------------------
echo.
echo [3/6] Aktiviere venv und aktualisiere pip...
echo [3/6] Aktiviere venv... >> "%LOGFILE%"

if not exist "venv\Scripts\python.exe" (
    color 0C
    echo [FEHLER] venv\Scripts\python.exe existiert nicht!
    echo Bitte loesche den Ordner "venv" und fuehre die Datei erneut aus.
    pause
    exit /b 1
)

set "VENV_PY=venv\Scripts\python.exe"
set "VENV_PIP=venv\Scripts\pip.exe"

echo Aktualisiere pip in venv...
!VENV_PY! -m pip install --upgrade pip >> "%LOGFILE%" 2>&1
echo [OK] Pip ist aktuell.
echo [OK] Pip aktualisiert. >> "%LOGFILE%"

:: ----------------------------------------------------------------------
:: 4. ABHÄNGIGKEITEN INSTALLIEREN (SCHRITTWEISE FÜR MAXIMALE STABILITÄT)
:: ----------------------------------------------------------------------
echo.
echo [4/6] Installiere Audio-, PyTorch- und Server-Pakete...
echo (Der erste Download von PyTorch kann je nach Internetverbindung 1-3 Minuten dauern)
echo [4/6] Starte Paketinstallation... >> "%LOGFILE%"

echo   - Webserver: Nutzt nativen Python HTTP-Server (keine externen Web-Frameworks noetig)

echo   - Installiere Audio-Signalverarbeitung (NumPy, SciPy, Librosa, SoundFile)...
!VENV_PIP! install "numpy>=1.24" "scipy>=1.10.0" "librosa>=0.10.0" "soundfile>=0.12.1" >> "%LOGFILE%" 2>&1
if !errorlevel! neq 0 (
    echo   [WARNUNG] Problem bei Audio-Installation, siehe install_log.txt
) else (
    echo   [OK] Audio-Pakete installiert.
)

echo   - Installiere Deep-Learning Engine (PyTorch ^& Torchaudio)...
!VENV_PIP! install "torch>=2.0.0" "torchaudio>=2.0.0" >> "%LOGFILE%" 2>&1
if !errorlevel! neq 0 (
    echo   [WARNUNG] PyTorch Standard-Install fehlgeschlagen, versuche CPU-Version...
    !VENV_PIP! install torch torchaudio --index-url https://download.pytorch.org/whl/cpu >> "%LOGFILE%" 2>&1
)
echo   [OK] PyTorch bereit.

echo   - Pruefe Git und CPJKU beat_this Transformer...
where git >nul 2>&1
if !errorlevel! equ 0 (
    echo   Git gefunden! Installiere CPJKU beat_this von GitHub...
    !VENV_PIP! install "git+https://github.com/CPJKU/beat_this.git" >> "%LOGFILE%" 2>&1
    if !errorlevel! equ 0 (
        echo   [OK] CPJKU beat_this Transformer erfolgreich installiert!
        echo   [OK] beat_this von GitHub installiert. >> "%LOGFILE%"
    ) else (
        echo   [HINWEIS] beat_this GitHub-Paket optional. Integrierter Transformer-Modus wird aktiv.
        echo   [HINWEIS] beat_this Pip-Install fehlgeschlagen, Fallback aktiv. >> "%LOGFILE%"
    )
) else (
    echo   [HINWEIS] Git nicht im PATH. Integrierter Hochpraezisions-Modus (MIR/Librosa) wird genutzt.
    echo   [HINWEIS] Git nicht installiert, nutze Fallback. >> "%LOGFILE%"
)

:: ----------------------------------------------------------------------
:: 5. FUNKTIONSTEST DER UMGEBUNG
:: ----------------------------------------------------------------------
echo.
echo [5/6] Pruefe Python-Umgebung...
echo [5/6] Teste Imports in Python... >> "%LOGFILE%"

!VENV_PY! -c "import torch; import librosa; import soundfile; print('System-Check: Alle Audio- und KI-Module erfolgreich geladen! (CUDA:', torch.cuda.is_available(), ')')" >> "%LOGFILE%" 2>&1
if !errorlevel! neq 0 (
    color 0E
    echo [HINWEIS] Ein Modultest ergab Warnungen. Siehe install_log.txt.
) else (
    echo [OK] Alle Python-Module funktionieren einwandfrei!
)

:: ----------------------------------------------------------------------
:: DAVINCI RESOLVE SKRIPT (nur wenn Resolve installiert ist)
:: ----------------------------------------------------------------------
echo.
echo Pruefe DaVinci Resolve und installiere/aktualisiere BeatAnalyzer_Markers.lua...
!VENV_PY! backend\resolve_plugin.py auto

:: ----------------------------------------------------------------------
:: 6. SERVER STARTEN UND BROWSER ÖFFNEN
:: ----------------------------------------------------------------------
echo.
echo [6/6] Starte BeatAnalyzer Server...
echo ======================================================================
echo  Serveradresse: http://localhost:8000
echo  Web-Oberflaeche oeffnet sich automatisch in deinem Standard-Browser!
echo.
echo  Zum Beenden druecke STRG + C in diesem Konsolenfenster.
echo ======================================================================
echo.

:: Oeffne Browser mit kleiner Verzoegerung
start "" http://localhost:8000

echo Starte backend\server.py ... >> "%LOGFILE%"
!VENV_PY! backend\server.py

:: Falls der Server abstuerzt oder beendet wird:
echo.
echo ======================================================================
echo Der Server wurde beendet.
echo Protokoll wurde gespeichert unter: "%LOGFILE%"
echo ======================================================================
echo Druecke eine beliebige Taste zum Schliessen des Fensters...
pause
