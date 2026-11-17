@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"
title BeatAnalyzer - Installation ^& start with log (Windows)
color 0B

set "LOGFILE=%~dp0install_log.txt"

:: Start the log file with a time stamp
echo ====================================================================== > "%LOGFILE%"
echo  BeatAnalyzer Windows Installation Log >> "%LOGFILE%"
echo  Started: %DATE% %TIME% >> "%LOGFILE%"
echo  Folder:  %~dp0 >> "%LOGFILE%"
echo ====================================================================== >> "%LOGFILE%"
echo. >> "%LOGFILE%"

echo ======================================================================
echo          BeatAnalyzer - CPJKU beat_this local installation
echo          Beat ^& downbeat detection in its own Python environment
echo ======================================================================
echo  A detailed log is saved to:
echo  install_log.txt
echo.
echo  Please close all running BeatAnalyzer windows first: a running
echo  server locks files in venv, and an update of NumPy would stop half way.
echo ======================================================================
echo.

:: ----------------------------------------------------------------------
:: 1. CHECK THE PYTHON INSTALLATION
:: ----------------------------------------------------------------------
echo [1/6] Looking for an installed Python...
echo [1/6] Looking for Python... >> "%LOGFILE%"

set "PY_CMD="

:: First try 'py' (Windows Python Launcher)
py -3 --version >nul 2>&1
if !errorlevel! equ 0 (
    set "PY_CMD=py -3"
    goto :python_found
)

:: Try 'python'
python --version >nul 2>&1
if !errorlevel! equ 0 (
    set "PY_CMD=python"
    goto :python_found
)

:: Try 'python3'
python3 --version >nul 2>&1
if !errorlevel! equ 0 (
    set "PY_CMD=python3"
    goto :python_found
)

:: Search the usual Windows installation folders
if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" set "PY_CMD=%LOCALAPPDATA%\Programs\Python\Python312\python.exe" & goto :python_found
if exist "%LOCALAPPDATA%\Programs\Python\Python311\python.exe" set "PY_CMD=%LOCALAPPDATA%\Programs\Python\Python311\python.exe" & goto :python_found
if exist "%LOCALAPPDATA%\Programs\Python\Python310\python.exe" set "PY_CMD=%LOCALAPPDATA%\Programs\Python\Python310\python.exe" & goto :python_found
if exist "C:\Python312\python.exe" set "PY_CMD=C:\Python312\python.exe" & goto :python_found
if exist "C:\Python311\python.exe" set "PY_CMD=C:\Python311\python.exe" & goto :python_found
if exist "C:\Python310\python.exe" set "PY_CMD=C:\Python310\python.exe" & goto :python_found

:: Python not found:
color 0C
echo.
echo ======================================================================
echo [ERROR] Python was not found on this PC.
echo ======================================================================
echo [ERROR] Python not found in PATH or the usual folders. >> "%LOGFILE%"
echo.
echo Please install Python:
echo 1. Download Python 3.10 or newer: https://www.python.org/downloads/
echo 2. IMPORTANT: at the start of the installer, tick:
echo    "Add python.exe to PATH" (at the bottom of the installer window)
echo 3. Then run this install_and_run.bat again.
echo.
echo The log was written to: "%LOGFILE%"
echo ======================================================================
echo This window does NOT close by itself. Press any key to exit.
pause
exit /b 1

:python_found
for /f "tokens=*" %%v in ('!PY_CMD! --version 2^>^&1') do set "PY_VER=%%v"
echo [OK] Python found: !PY_VER!
echo [OK] Command used: !PY_CMD!
echo Python command: !PY_CMD! (!PY_VER!) >> "%LOGFILE%"

:: ----------------------------------------------------------------------
:: 2. CREATE THE PYTHON ENVIRONMENT (VENV)
:: ----------------------------------------------------------------------
echo.
echo [2/6] Setting up the Python environment (venv)...
echo [2/6] Checking/creating venv... >> "%LOGFILE%"

if not exist "venv\Scripts\activate.bat" (
    echo Creating the folder "venv"... ^(please wait^)
    echo Running: !PY_CMD! -m venv venv >> "%LOGFILE%"
    !PY_CMD! -m venv venv >> "%LOGFILE%" 2>&1
    if !errorlevel! neq 0 (
        color 0C
        echo [ERROR] Could not create venv.
        echo Details in install_log.txt:
        type "%LOGFILE%"
        echo.
        echo Press any key to exit.
        pause
        exit /b 1
    )
    echo [OK] Environment "venv" created.
    echo [OK] venv created. >> "%LOGFILE%"
) else (
    echo [OK] Existing environment "venv" found.
    echo [OK] venv already there. >> "%LOGFILE%"
)

:: ----------------------------------------------------------------------
:: 3. ACTIVATE VENV & UPDATE PIP
:: ----------------------------------------------------------------------
echo.
echo [3/6] Activating venv and updating pip...
echo [3/6] Activating venv... >> "%LOGFILE%"

if not exist "venv\Scripts\python.exe" (
    color 0C
    echo [ERROR] venv\Scripts\python.exe does not exist.
    echo Please delete the folder "venv" and run this file again.
    pause
    exit /b 1
)

set "VENV_PY=venv\Scripts\python.exe"
set "VENV_PIP=venv\Scripts\pip.exe"

echo Updating pip in venv...
!VENV_PY! -m pip install --upgrade pip >> "%LOGFILE%" 2>&1
echo [OK] pip is up to date.
echo [OK] pip updated. >> "%LOGFILE%"

:: ----------------------------------------------------------------------
:: 4. INSTALL THE PACKAGES (STEP BY STEP)
:: ----------------------------------------------------------------------
echo.
echo [4/6] Installing audio, PyTorch and server packages...
echo (The first download of PyTorch can take 1-3 minutes, depending on the connection)
echo [4/6] Installing packages... >> "%LOGFILE%"

echo   - Web server: built-in Python HTTP server (no web framework needed)

echo   - Installing audio processing (NumPy, SciPy, librosa, SoundFile)...
!VENV_PIP! install "numpy>=1.24" "scipy>=1.10.0" "librosa>=0.10.0" "soundfile>=0.12.1" >> "%LOGFILE%" 2>&1
if !errorlevel! neq 0 (
    echo   [WARNING] Problem installing the audio packages, see install_log.txt
) else (
    echo   [OK] Audio packages installed.
)

echo   - Installing PyAV (reads m4a/AAC, ALAC, Opus ... without an own ffmpeg)...
!VENV_PIP! install "av>=12.0" >> "%LOGFILE%" 2>&1
if !errorlevel! neq 0 (
    echo   [NOTE] PyAV not installed: m4a/AAC only with ffmpeg set up, see install_log.txt
) else (
    echo   [OK] PyAV installed.
)

echo   - Installing PyTorch ^& torchaudio...
!VENV_PIP! install "torch>=2.0.0" "torchaudio>=2.0.0" >> "%LOGFILE%" 2>&1
if !errorlevel! neq 0 (
    echo   [WARNING] Standard PyTorch install failed, trying the CPU version...
    !VENV_PIP! install torch torchaudio --index-url https://download.pytorch.org/whl/cpu >> "%LOGFILE%" 2>&1
)
echo   [OK] PyTorch ready.

echo   - Checking Git and CPJKU beat_this...
where git >nul 2>&1
if !errorlevel! equ 0 (
    echo   Git found. Installing CPJKU beat_this from GitHub...
    !VENV_PIP! install "git+https://github.com/CPJKU/beat_this.git" >> "%LOGFILE%" 2>&1
    if !errorlevel! equ 0 (
        echo   [OK] CPJKU beat_this installed.
        echo   [OK] beat_this installed from GitHub. >> "%LOGFILE%"
    ) else (
        echo   [WARNING] beat_this could not be installed, see install_log.txt.
        echo   [WARNING] pip install of beat_this failed. >> "%LOGFILE%"
    )
) else (
    echo   [WARNING] Git not found - beat_this cannot be installed.
    echo   [WARNING] Install Git: https://git-scm.com/download/win and then run this file again.
    echo   [WARNING] Git not installed, beat_this missing. >> "%LOGFILE%"
)

:: ----------------------------------------------------------------------
:: 5. TEST THE ENVIRONMENT
:: ----------------------------------------------------------------------
echo.
echo [5/6] Checking the Python environment...
echo [5/6] Testing imports in Python... >> "%LOGFILE%"

!VENV_PY! -c "import numpy, scipy, librosa, soundfile; print('Audio-Module OK, numpy', numpy.__version__)" >> "%LOGFILE%" 2>&1
if !errorlevel! neq 0 (
    color 0C
    echo.
    echo [ERROR] The audio modules ^(NumPy, SciPy, librosa, soundfile^) cannot be loaded.
    echo          The environment venv is broken. What to do:
    echo          1. Close all BeatAnalyzer windows.
    echo          2. Delete the folder "venv" in the BeatAnalyzer folder.
    echo          3. Run install_and_run.bat again.
    echo          Details are in install_log.txt.
    echo [ERROR] Audio modules cannot be loaded, venv broken. >> "%LOGFILE%"
    pause
    exit /b 1
)
echo [OK] Audio modules work.

!VENV_PY! -c "import torch, beat_this.inference; print('beat_this OK, CUDA:', torch.cuda.is_available())" >> "%LOGFILE%" 2>&1
if !errorlevel! neq 0 (
    color 0E
    echo.
    echo [WARNING] beat_this is NOT available. BeatAnalyzer then uses librosa - less exact,
    echo           without confidence. Common causes: Git missing, no internet connection, or a
    echo           BeatAnalyzer server ran during the installation. Details in install_log.txt.
    echo [WARNING] beat_this cannot be loaded. >> "%LOGFILE%"
    echo.
    echo Press any key to start anyway with librosa - or close the window.
    pause >nul
) else (
    echo [OK] beat_this is ready.
    echo   - Downloading the beat_this model in advance ^(about 80 MB the first time^)...
    !VENV_PY! backend\model_check.py
    if !errorlevel! neq 0 (
        color 0E
        echo [WARNING] Without the model BeatAnalyzer uses librosa. Cause and remedy are shown above.
        echo [WARNING] beat_this model not loaded. >> "%LOGFILE%"
        echo.
        echo Press any key to start anyway - or close the window.
        pause >nul
    ) else (
        echo [OK] beat_this model ready. >> "%LOGFILE%"
    )
)

:: ----------------------------------------------------------------------
:: DAVINCI RESOLVE SCRIPT (only if Resolve is installed)
:: ----------------------------------------------------------------------
echo.
echo Checking DaVinci Resolve and installing/updating BeatAnalyzer_Markers.lua...
!VENV_PY! backend\resolve_plugin.py auto

:: ----------------------------------------------------------------------
:: 6. START THE SERVER AND OPEN THE BROWSER
:: ----------------------------------------------------------------------
echo.
echo [6/6] Starting the BeatAnalyzer server...
echo ======================================================================
echo  Server address: http://localhost:8000
echo  The web app opens in your default browser.
echo.
echo  To stop, press CTRL + C in this console window.
echo ======================================================================
echo.

:: the server opens the browser as soon as it is ready (--open-browser)
echo Starting backend\server.py ... >> "%LOGFILE%"
!VENV_PY! backend\server.py --open-browser

:: When the server crashes or stops:
echo.
echo ======================================================================
echo The server stopped.
echo The log was saved to: "%LOGFILE%"
echo ======================================================================
echo Press any key to close the window...
pause
