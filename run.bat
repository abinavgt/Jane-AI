@echo off
setlocal enabledelayedexpansion
title Jane AI - Run

:: Delegate directly to start.bat (which handles automatic setup if needed and launches app)
set "BASE_DIR=%~dp0"
if exist "%BASE_DIR%start.bat" (
    call "%BASE_DIR%start.bat"
) else if exist "%BASE_DIR%Jane-AI\start.bat" (
    call "%BASE_DIR%Jane-AI\start.bat"
) else (
    echo [ERROR] start.bat not found!
    pause
    exit /b 1
)
