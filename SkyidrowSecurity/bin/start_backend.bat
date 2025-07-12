@echo off
REM Skyidrow Security Intelligence - Start Node.js Backend (Windows)
REM This script starts the Express backend for the Splunk app.

REM Change directory to the app root (adjust if needed)
cd /d %~dp0\..\..

REM Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
  echo Node.js is not installed or not in PATH. Please install Node.js 18+ and try again.
  pause
  exit /b 1
)

REM Set environment variables (edit as needed)
REM set VIRUSTOTAL_API_KEY=c5a7cf43a713f7844709f50060c470800a453ee5c7bb442f91142d77b7c84b37
REM set PORT=5001

REM Start the backend
echo Starting Skyidrow Security backend on port 5001...
node proxy.js

REM Keep window open if run by double-click
pause
