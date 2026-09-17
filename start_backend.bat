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
)

echo [2/4] Installing/updating dependencies...
".venv\Scripts\python.exe" -m pip install -q --upgrade pip
".venv\Scripts\python.exe" -m pip install -q -r requirements.txt
if errorlevel 1 goto :fail

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

:fail
echo.
echo Backend failed to start.
pause
exit /b 1
