@echo off
echo ========================================
echo 🧪 CHAT SYSTEM TESTING SUITE
echo ========================================
echo.

echo 📋 Available Test Commands:
echo.
echo BACKEND TESTS:
echo   npm run test:backend          - Run all backend tests
echo   npm run test:backend:routes   - Run backend route tests only
echo   npm run test:backend:coverage - Run backend tests with coverage
echo.
echo FRONTEND TESTS:
echo   npm run test:frontend         - Run all frontend tests
echo   npm run test:frontend:unit    - Run frontend unit tests only
echo   npm run test:frontend:e2e     - Run frontend E2E tests
echo.
echo ALL TESTS:
echo   npm run test:all              - Run all tests (backend + frontend)
echo.
echo ========================================

set /p choice="Enter your choice (1-7) or 'q' to quit: "

if "%choice%"=="1" goto backend_all
if "%choice%"=="2" goto backend_routes
if "%choice%"=="3" goto backend_coverage
if "%choice%"=="4" goto frontend_all
if "%choice%"=="5" goto frontend_unit
if "%choice%"=="6" goto frontend_e2e
if "%choice%"=="7" goto all_tests
if "%choice%"=="q" goto end

echo Invalid choice. Please try again.
goto start

:backend_all
echo.
echo 🚀 Running Backend Tests...
cd Backend_system
npm test
goto end

:backend_routes
echo.
echo 🚀 Running Backend Route Tests...
cd Backend_system
npm run test:routes
goto end

:backend_coverage
echo.
echo 🚀 Running Backend Tests with Coverage...
cd Backend_system
npm run test:coverage
goto end

:frontend_all
echo.
echo 🚀 Running Frontend Tests...
cd Frontend_system\chat-system-frontend
npm test
goto end

:frontend_unit
echo.
echo 🚀 Running Frontend Unit Tests...
cd Frontend_system\chat-system-frontend
npm run test:unit
goto end

:frontend_e2e
echo.
echo 🚀 Running Frontend E2E Tests...
cd Frontend_system\chat-system-frontend
npm run e2e:run
goto end

:all_tests
echo.
echo 🚀 Running All Tests...
echo.
echo 1/2 Backend Tests...
cd Backend_system
npm test
echo.
echo 2/2 Frontend Tests...
cd ..\Frontend_system\chat-system-frontend
npm test
echo.
echo 🎉 All tests completed!
goto end

:end
echo.
echo ========================================
echo Testing completed! Check the results above.
echo ========================================
pause
