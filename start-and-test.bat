@echo off
echo ========================================
echo 🚀 STARTING CHAT SYSTEM FOR E2E TESTING
echo ========================================
echo.

echo Step 1: Starting Angular Development Server...
echo This will take a moment...
echo.

cd Frontend_system\chat-system-frontend

echo Starting Angular app on http://localhost:4200
echo Please wait for the server to be ready...
echo.

start /B npm start

echo Waiting for Angular server to start...
timeout /t 15 /nobreak >nul

echo.
echo Step 2: Checking if server is ready...
:check_server
curl -s http://localhost:4200 >nul 2>&1
if %errorlevel% neq 0 (
    echo Server not ready yet, waiting...
    timeout /t 5 /nobreak >nul
    goto check_server
)

echo ✅ Angular server is ready!
echo.

echo Step 3: Running E2E tests...
echo.

npm run e2e:run

echo.
echo ========================================
echo E2E Testing completed!
echo ========================================
echo.
echo Note: Angular server is still running.
echo To stop it, close the terminal or press Ctrl+C
echo.
pause
