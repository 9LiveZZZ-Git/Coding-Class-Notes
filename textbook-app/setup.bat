@echo off
echo ==========================================
echo  Computing Arts Textbook - Setup
echo ==========================================
echo.

:: Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed.
    echo Please install Node.js from https://nodejs.org/
    echo Then run this script again.
    pause
    exit /b 1
)

echo [1/3] Copying textbook content...
if not exist "content" mkdir content
xcopy /E /Y /Q "..\textbook\*" "content\" >nul

echo [2/3] Installing dependencies...
call npm install

echo [3/3] Done!
echo.
echo ==========================================
echo  To launch the textbook app, run:
echo    npm start
echo.
echo  To build a standalone installer:
echo    npm run build-win
echo ==========================================
pause
