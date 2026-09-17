@echo off
setlocal
cd /d "%~dp0"
title ProfNav Cloudflare Tunnel

echo.
echo ============================================
echo   Moscow Polytech Professional Navigation
echo   START TUNNEL
echo ============================================
echo.
echo Backend must already be running on:
echo http://127.0.0.1:8000
echo.

where cloudflared >nul 2>nul
if errorlevel 1 (
  if exist "%LOCALAPPDATA%\Microsoft\WinGet\Links\cloudflared.exe" (
    set "CLOUDFLARED=%LOCALAPPDATA%\Microsoft\WinGet\Links\cloudflared.exe"
  ) else (
    echo cloudflared is not installed.
    echo Trying to install it via winget...
    winget install --id Cloudflare.cloudflared -e --accept-source-agreements --accept-package-agreements
    echo.
    echo If installation completed, close this window and run start_tunnel.bat again.
    pause
    exit /b 0
  )
) else (
  set "CLOUDFLARED=cloudflared"
)

echo Starting temporary HTTPS tunnel...
echo.
echo IMPORTANT:
echo Copy the URL that looks like:
echo https://xxxxx.trycloudflare.com
echo and send it back in ChatGPT.
echo I will put it into docs\api-config.js for GitHub Pages.
echo.
%CLOUDFLARED% tunnel --url http://127.0.0.1:8000
