@echo off
setlocal
cd /d "%~dp0"
title FinanceCalc Public

:: 1. Ensure production desktop bundle exists
if not exist "dist\index.html" (
    echo Building production desktop bundle...
    call npm run build
)

:: 2. Launch Native Desktop App directly with electron.exe (Windows GUI subsystem)
if exist "%~dp0node_modules\electron\dist\electron.exe" (
    start "" "%~dp0node_modules\electron\dist\electron.exe" "%~dp0."
    exit /b 0
)

exit /b 0
