@echo off
echo Advanced File Converter Setup
echo ============================
echo.
echo This will launch the setup script for the Advanced File Converter.
echo.
echo Checking for Node.js...

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js not found! Please install Node.js before running this script.
    echo Visit https://nodejs.org to download and install Node.js.
    echo.
    pause
    exit /b 1
)

echo Node.js found! Starting setup script...
echo.
node setup.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Setup script failed. Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo Setup process completed.
pause 