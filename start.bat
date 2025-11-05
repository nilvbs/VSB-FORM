@echo off
echo ========================================
echo Employee Task Form - Starting Servers
echo ========================================
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd server && npm start"

timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ========================================
echo Both servers are starting...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5173
echo ========================================
echo.
echo Press any key to close this window...
pause > nul

