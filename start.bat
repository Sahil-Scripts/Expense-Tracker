@echo off
echo Installing Backend Dependencies...
cd backend
call npm install
echo Starting Backend...
start "Backend" npm run dev
cd ..

echo Installing Frontend Dependencies...
cd frontend
call npm install
echo Starting Frontend...
start "Frontend" npm run dev
cd ..

echo Application starting...
echo Waiting for servers to launch...
timeout /t 5 >nul
start http://localhost:5173
echo Done! Kubeo is running.
