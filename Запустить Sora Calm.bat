@echo off
chcp 65001 >nul
set "ROOT=%~dp0"
cd /d "%ROOT%"
if not exist "package.json" (
  echo Не найден package.json в: %ROOT%
  pause
  exit /b 1
)

echo Запускаю сервер Sora Calm…
start "Sora Calm — не закрывайте это окно" cmd /k "cd /d ""%ROOT%"" && npm run dev"

echo Жду, пока сайт поднимется…
set /a N=0
:wait
timeout /t 2 /nobreak >nul
curl -sf -o nul http://localhost:3000/api/health 2>nul
if %errorlevel% equ 0 goto ok
set /a N+=1
if %N% lss 45 goto wait
echo Сервер не ответил за ~90 сек. Проверьте окно с npm. Открываю страницу…
start http://localhost:3000
pause
exit /b 0
:ok
start http://localhost:3000
echo Готово. Браузер открыт. Окно с сервером не закрывайте.
timeout /t 4 /nobreak >nul
