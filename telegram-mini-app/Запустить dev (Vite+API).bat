@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "node_modules\" call npm install
if not exist "server\node_modules\" (
  cd server
  call npm install
  cd ..
)
echo Запускаю API :3001 и Vite :5174 — подожди 5 сек и открой http://localhost:5174
start "Sora API :3001" cmd /k "cd /d ""%~dp0server"" && node index.mjs"
timeout /t 3 /nobreak >nul
start "Sora Vite :5174" cmd /k "cd /d ""%~dp0"" && npm run dev"
timeout /t 2 /nobreak >nul
start http://localhost:5174
