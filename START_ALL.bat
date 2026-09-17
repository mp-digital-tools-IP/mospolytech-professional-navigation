@echo off
setlocal
cd /d "%~dp0"
title ProfNav Launcher

echo Starting backend in a separate window...
start "ProfNav Backend" cmd /k call "%~dp0start_backend.bat"

echo Waiting for backend...
timeout /t 6 /nobreak >nul

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
