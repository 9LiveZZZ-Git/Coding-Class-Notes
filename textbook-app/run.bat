@echo off
echo ==========================================
echo  Computing Arts Textbook - Launching...
echo ==========================================
echo.

:: Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed.
    echo Please install Node.js from https://nodejs.org/
    echo Then run setup.bat first, followed by this script.
    pause
    exit /b 1
)

:: Check if node_modules exists
if not exist "node_modules" (
    echo Dependencies not installed. Running setup first...
    echo.
    call setup.bat
)

echo Starting the textbook app...
npm start
