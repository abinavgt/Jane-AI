@echo off
setlocal enabledelayedexpansion
title Jane AI - Environment Setup

echo ============================================================
echo           Jane AI - Environment Setup Wizard
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

echo [*] Target project directory: "%PROJECT_ROOT%"
echo.

:: 1. Check Python
echo [1/4] Checking Python installation...
set "PYTHON_CMD="
python --version >nul 2>&1
if !errorlevel! equ 0 (
    set "PYTHON_CMD=python"
) else (
    py --version >nul 2>&1
    if !errorlevel! equ 0 (
        set "PYTHON_CMD=py"
    )
)

if "%PYTHON_CMD%"=="" (
    echo [ERROR] Python was not found in PATH!
    echo Please install Python 3.10+ from https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation.
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('%PYTHON_CMD% --version 2^>^&1') do set "PY_VER=%%i"
echo     Found %PY_VER% [%PYTHON_CMD%]

:: 2. Check Node.js and npm
echo.
echo [2/4] Checking Node.js and npm installation...
node --version >nul 2>&1
if !errorlevel! neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please download and install Node.js v18 or higher from https://nodejs.org/
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version 2^>^&1') do set "NODE_VER=%%i"
for /f "tokens=*" %%i in ('npm --version 2^>^&1') do set "NPM_VER=%%i"
echo     Found Node.js %NODE_VER% with npm %NPM_VER%

:: 3. Configure backend environment
echo.
echo [3/4] Setting up Python backend environment...
cd /d "%PROJECT_ROOT%backend"

:: Copy .env.example if .env does not exist
if not exist ".env" (
    if exist ".env.example" (
        echo     Creating backend .env from .env.example...
        copy /y ".env.example" ".env" >nul
        echo     [OK] .env file created with default demo configurations.
    ) else (
        echo     Creating default .env...
        (
            echo BASE_URL=http://localhost:8000
            echo FRONTEND_URL=http://localhost:5173
            echo PORT=8000
            echo DEMO_MODE=true
        ) > ".env"
    )
) else (
    echo     [OK] Existing backend .env file found.
)

:: Create Virtual Environment if it doesn't exist
if not exist ".venv\Scripts\python.exe" (
    echo     Creating Python virtual environment in .venv...
    %PYTHON_CMD% -m venv .venv
    if !errorlevel! neq 0 (
        echo [ERROR] Failed to create virtual environment!
        pause
        exit /b 1
    )
    echo     [OK] Virtual environment created.
) else (
    echo     [OK] Virtual environment .venv already exists.
)

:: Install backend dependencies
echo     Installing/updating Python dependencies in virtual environment...
".venv\Scripts\python.exe" -m pip install --upgrade pip
if exist "requirements.txt" (
    ".venv\Scripts\pip.exe" install -r requirements.txt
    if !errorlevel! neq 0 (
        echo [!] Retrying essential packages in case of version-specific conflicts...
        ".venv\Scripts\pip.exe" install fastapi "uvicorn[standard]" pydantic pydantic-settings python-dotenv httpx langchain langchain-core langchain-groq langchain-google-genai google-generativeai groq SpeechRecognition python-multipart aiofiles websockets
    )
)
echo     [OK] Backend dependencies ready.

:: 4. Setup Frontend
echo.
echo [4/4] Setting up React frontend dependencies...
cd /d "%PROJECT_ROOT%frontend"
if not exist "node_modules" (
    echo     Installing npm packages - this may take a moment...
    call npm install
    if !errorlevel! neq 0 (
        echo [ERROR] npm install encountered an error.
        pause
        exit /b 1
    )
    echo     [OK] Frontend packages installed.
) else (
    echo     [OK] node_modules folder exists. Ensuring packages are up-to-date...
    call npm install
)

echo.
echo ============================================================
echo         Environment Setup Completed Successfully!
echo ============================================================
echo.
echo You can now run the application anytime using:
echo    start.bat  or  run.bat
echo.
pause
