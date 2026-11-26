@echo off
title Jane AI - Stop Services

echo ============================================================
echo               Stopping Jane AI Services
echo ============================================================
echo.

echo [*] Checking for processes on port 8000 (Backend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    echo     Terminating process PID %%a on port 8000...
    taskkill /F /PID %%a >nul 2>&1
)

echo [*] Checking for processes on port 5173 (Frontend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    echo     Terminating process PID %%a on port 5173...
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo [OK] Jane AI services stopped.
echo.
pause
