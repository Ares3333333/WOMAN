@echo off
chcp 65001 >nul
set "ROOT=%~dp0"
cd /d "%ROOT%"
if not exist "package.json" (
  echo Не найден telegram-mini-app в: %ROOT%
  pause
  exit /b 1
)
if not exist "node_modules\" (
  echo Ставлю зависимости npm install…
  call npm install
  if errorlevel 1 (
    echo Ошибка npm install
    pause
    exit /b 1
  )
)

echo Запускаю Sora Calm (Telegram мини-приложение)…
start "Sora Calm TG — не закрывайте" cmd /k "cd /d ""%ROOT%"" && npm run dev"

echo Жду http://localhost:5174 …
set /a N=0
:wait
timeout /t 2 /nobreak >nul
curl -sf -o nul http://localhost:5174/ 2>nul
if %errorlevel% equ 0 goto ok
set /a N+=1
if %N% lss 35 goto wait
echo Сервер не ответил — открываю страницу вручную.
start http://localhost:5174
pause
exit /b 0
:ok
start http://localhost:5174
echo Браузер открыт. Окно с npm не закрывайте.
timeout /t 4 /nobreak >nul
