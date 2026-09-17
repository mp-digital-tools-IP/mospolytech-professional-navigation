@echo off
setlocal
cd /d "%~dp0"
title ProfNav Launcher

echo Starting backend in a separate window...
start "ProfNav Backend" cmd /k call "%~dp0start_backend.bat"

echo Waiting for backend to become ready...
set "BACKEND_READY=0"
for /l %%I in (1,1,90) do (
  powershell -NoProfile -Command "try { $r=Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:8000/api/health' -TimeoutSec 1; if ($r.StatusCode -eq 200) { exit 0 } } catch {}; exit 1" >nul 2>nul
  if not errorlevel 1 (
    set "BACKEND_READY=1"
    goto :ready
  )
  timeout /t 1 /nobreak >nul
)

:ready
if "%BACKEND_READY%"=="0" (
  echo.
  echo Backend did not become ready within 90 seconds.
  echo Look at the ProfNav Backend window and send the last error lines to ChatGPT.
  echo Tunnel will NOT be started.
  pause
  exit /b 1
)

echo Backend is ready.
echo Starting Cloudflare tunnel in a separate window...
start "ProfNav Tunnel" cmd /k call "%~dp0start_tunnel.bat"

echo.
echo Two windows should now be open:
echo 1. ProfNav Backend
echo 2. ProfNav Tunnel
echo.
echo Copy the https://xxxxx.trycloudflare.com address from the Tunnel window
echo and send it to ChatGPT.
echo.
pause
