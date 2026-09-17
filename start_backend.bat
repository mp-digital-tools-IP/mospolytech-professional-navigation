@echo off
setlocal
cd /d "%~dp0"
title ProfNav Backend

echo.
echo ============================================
echo   Moscow Polytech Professional Navigation
echo   START BACKEND
echo ============================================
echo.

REM Some Windows setups have a SOCKS proxy configured globally.
REM pip cannot bootstrap through a SOCKS proxy unless PySocks is already installed.
REM For this local demo we temporarily ignore proxy settings only inside this window.
set "HTTP_PROXY="
set "HTTPS_PROXY="
set "ALL_PROXY="
set "http_proxy="
set "https_proxy="
set "all_proxy="
set "PIP_PROXY="
set "PIP_CONFIG_FILE=NUL"
set "PIP_DISABLE_PIP_VERSION_CHECK=1"
set "NO_PROXY=127.0.0.1,localhost"

where py >nul 2>nul
if %errorlevel%==0 (
  set "PY=py -3"
) else (
  where python >nul 2>nul
  if errorlevel 1 (
    echo Python not found.
    echo Install Python 3.11+ from https://www.python.org/downloads/
    pause
    exit /b 1
  )
  set "PY=python"
)

if not exist ".venv\Scripts\python.exe" (
  echo [1/4] Creating virtual environment...
  %PY% -m venv .venv
  if errorlevel 1 goto :fail
) else (
  echo [1/4] Virtual environment already exists.
)

echo [2/4] Installing dependencies...
".venv\Scripts\python.exe" -m ensurepip --upgrade >nul 2>nul
".venv\Scripts\python.exe" -m pip install --disable-pip-version-check --no-input -r requirements.txt
if errorlevel 1 goto :pipfail

if not exist "data\profnav.db" (
  echo [3/4] Initializing database...
  ".venv\Scripts\python.exe" scripts\init_db.py
  if errorlevel 1 goto :fail
) else (
  echo [3/4] Database already exists.
)

echo [4/4] Starting FastAPI at http://127.0.0.1:8000
echo API docs: http://127.0.0.1:8000/docs
echo Keep this window open.
echo.
".venv\Scripts\python.exe" -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
goto :eof

:pipfail
echo.
echo Could not install Python packages.
echo.
echo The common SOCKS proxy problem was already bypassed in this launcher.
echo If it still fails, copy the last red error lines and send them to ChatGPT.
goto :fail

:fail
echo.
echo Backend failed to start.
pause
exit /b 1
