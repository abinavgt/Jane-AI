@echo off
setlocal enabledelayedexpansion
title Jane AI - Launcher

echo ============================================================
echo                 Starting Jane AI Platform
echo ============================================================
echo.

:: Detect project directory
set "BASE_DIR=%~dp0"
if exist "%BASE_DIR%backend" (
    set "PROJECT_ROOT=%BASE_DIR%"
) else if exist "%BASE_DIR%Jane-AI\backend" (
    set "PROJECT_ROOT=%BASE_DIR%Jane-AI\"
) else (
    echo [ERROR] Could not find 'backend' directory!
    echo Please make sure this script is located in the jane_ai or Jane-AI folder.
    echo.
    pause
    exit /b 1
)

:: Check if environment setup is needed
if not exist "%PROJECT_ROOT%backend\.venv\Scripts\python.exe" (
    echo [!] Virtual environment not detected. Running setup first...
    echo.
    if exist "%BASE_DIR%setup.bat" (
        call "%BASE_DIR%setup.bat"
    ) else if exist "%PROJECT_ROOT%setup.bat" (
        call "%PROJECT_ROOT%setup.bat"
    )
)

if not exist "%PROJECT_ROOT%frontend\node_modules" (
    echo [!] Frontend dependencies not found. Running setup first...
    echo.
    if exist "%BASE_DIR%setup.bat" (
        call "%BASE_DIR%setup.bat"
    ) else if exist "%PROJECT_ROOT%setup.bat" (
        call "%PROJECT_ROOT%setup.bat"
    )
)

:: Ensure backend .env exists
if not exist "%PROJECT_ROOT%backend\.env" (
    if exist "%PROJECT_ROOT%backend\.env.example" (
        copy /y "%PROJECT_ROOT%backend\.env.example" "%PROJECT_ROOT%backend\.env" >nul
    )
)

echo [*] Starting FastAPI Backend on http://localhost:8000...
start "Jane AI - Backend (FastAPI)" /D "%PROJECT_ROOT%backend" cmd /k ".venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

echo [*] Starting Vite Frontend on http://localhost:5173...
start "Jane AI - Frontend (Vite)" /D "%PROJECT_ROOT%frontend" cmd /k "npm run dev"

echo.
echo [*] Waiting for services to initialize...
timeout /t 4 /nobreak >nul

echo [*] Opening Jane AI in your web browser...
start http://localhost:5173

echo.
echo ============================================================
echo             Jane AI is now running!
echo ============================================================
echo  Frontend UI:       http://localhost:5173
echo  Backend API:       http://localhost:8000
echo  API Documentation: http://localhost:8000/docs
echo  Health Status:     http://localhost:8000/health
echo ============================================================
echo.
echo To stop the servers, close their terminal windows or run stop.bat.
echo.
pause
