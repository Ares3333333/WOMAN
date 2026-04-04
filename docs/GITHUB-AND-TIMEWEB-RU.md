# GitHub + Timeweb + Telegram: полный контур Sora Calm

Пошагово: репозиторий, сервер, HTTPS, бот, мини-приложение, премиум.

---

## 1. Что у тебя в проекте

| Часть | Папка | Роль |
|--------|--------|------|
| Мини-приложение | `telegram-mini-app/` | React (Vite), UI, озвучка, цели |
| Сервер + бот | `telegram-mini-app/server/` | Раздаёт **собранный** фронт из `dist/`, API `/api/telegram/me`, бот **GrammY** (long polling) |
| Веб (опционально) | корень `СНЭКЕР` | Next.js — можно держать отдельно |

В **продакшене** один процесс Node слушает порт (например `3001`), отдаёт и статику, и API. Бот работает в том же процессе.

---

## 2. GitHub

1. Установи [Git](https://git-scm.com/) и авторизуйся (`git config user.name`, `user.email`).

2. На [github.com](https://github.com) создай **New repository** (можно приватный).

3. В папке проекта (родитель `СНЭКЕР`):

```bash
git init
git add .
git commit -m "Sora Calm: web + Telegram mini app"
git branch -M main
git remote add origin https://github.com/ТВОЙ_ЛОГИН/ТВОЙ_РЕПО.git
git push -u origin main
```

4. **Секреты не в Git:** не коммить `server/.env`, `server/data/subscribers.json`, корневой `.env`. Они уже в `.gitignore` у `telegram-mini-app`.

5. (Опционально) **GitHub Actions** для CI: `npm ci`, `npm run build` в `telegram-mini-app` — можно добавить позже отдельным workflow.

---

## 3. Timeweb: что заказать

На **обычном виртуальном хостинге** Timeweb **нельзя** держать долгоживущий Node-сервер как у нас — только статика или ограниченные сценарии.

Нужен **облачный сервер / VPS** (Timeweb Cloud и аналог): Ubuntu, публичный IP, возможность открыть порт и повесить **SSL**.

Дальше считаем: **Ubuntu 22.04**, домен `sora.example.com` указывает **A-записью** на IP сервера.

---

## 4. Автоматизация (скрипты в репозитории)

В корне репозитория:

- **`scripts/bootstrap-server.sh`** — первичная настройка VPS (Node, nginx, clone, сборка, PM2). Подробно для новичков: **`README_DEPLOY.md`**.
- **`scripts/deploy.sh`** — обычное обновление: `git pull`, сборка, `pm2 reload`.
- **`nginx/sora.conf`** — шаблон reverse proxy на порт **3001** (домен подставляет bootstrap).

---

## 5. Подготовка сервера (Ubuntu, вручную)

*Быстрее для новичка:* **`README_DEPLOY.md`** + **`sudo bash scripts/bootstrap-server.sh`**. Ниже — ручной путь, если хочешь понять шаги.

Подключись по SSH.

```bash
sudo apt update && sudo apt upgrade -y
```

**Node.js 20 LTS** (через NodeSource — проверь актуальную команду на сайте NodeSource):

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx certbot python3-certbot-nginx
```

**Клон репозитория:**

```bash
cd /var/www
sudo git clone https://github.com/ТВОЙ_ЛОГИН/ТВОЙ_РЕПО.git sora
sudo chown -R $USER:$USER /var/www/sora
```

**Сборка мини-приложения и зависимости сервера:**

```bash
cd /var/www/sora/telegram-mini-app
npm ci
# Переменные для сборки фронта (бот для ссылок в UI):
export VITE_TELEGRAM_BOT=https://t.me/ТвойБот
npm run build
cd server
npm ci --omit=dev
```

**Конфиг сервера** `server/.env` (создай файл):

```env
BOT_TOKEN=от_BotFather
WEB_APP_URL=https://sora.example.com
PORT=3001
ADMIN_TELEGRAM_IDS=твой_telegram_id
# Если фронт когда-нибудь будет на другом домене:
# CORS_ORIGIN=https://другой-домен.ru
```

- **WEB_APP_URL** — ровно тот **HTTPS**-URL, по которому пользователь откроет мини-приложение (часто корень сайта).
- **ADMIN_TELEGRAM_IDS** — твой числовой id (узнать у @userinfobot).

**Проверка локально на сервере:**

```bash
cd /var/www/sora/telegram-mini-app/server
node index.mjs
```

Должно подняться `http://127.0.0.1:3001`, в логе — бот (если токен и URL заданы). Останови Ctrl+C.

---

## 6. PM2 (автозапуск Node)

```bash
sudo npm install -g pm2
cd /var/www/sora/telegram-mini-app
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
# выполни команду, которую выведет pm2 startup (sudo env ...)
```

Логи: `pm2 logs sora-calm-tg`

---

## 7. Nginx + HTTPS

Пример сервера для домена (замени `sora.example.com`):

```nginx
server {
    listen 80;
    server_name sora.example.com;
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/sora /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d sora.example.com
```

Certbot подставит `listen 443 ssl` и сертификаты Let’s Encrypt.

**Важно:** Telegram принимает только **HTTPS** для продакшен-мини-приложений.

---

## 8. Telegram: BotFather и домен

1. [@BotFather](https://t.me/BotFather) → `/newbot` → сохрани **токен** в `BOT_TOKEN`.

2. Привяжи **домен мини-приложения** к боту (в BotFather: настройки бота → раздел про **Mini App / Domain** — формулировка может обновляться; суть: домен из `WEB_APP_URL` без пути, например `sora.example.com`).

3. Наш сервер при старте бота вызывает **menu button** «Sora Calm» с URL `WEB_APP_URL`. Дополнительно можно настроить кнопку вручную в BotFather, если нужно.

4. Пользователь заходит в бота → **Menu** или `/start` → кнопка **Web App** → открывается твой URL.

---

## 9. Премиум (Sora Circle) без платёжки на старте

1. На сервере файл **`server/data/subscribers.json`** создаётся сам. В нём объект `subscribers`: ключ — Telegram **user id**, значение `true`.

2. Ты как админ в Telegram:
   - пишешь боту любое сообщение от тестового аккаунта;
   - **ответом** на это сообщение отправляешь `/grant` — пользователю выдаётся премиум на сервере.

3. Мини-приложение при открытии шлёт `initData` на **`POST /api/telegram/me`**; сервер проверяет подпись Telegram и возвращает `premium: true/false`. Клиент поднимает локальный флаг премиума.

4. `/revoke` (ответом на сообщение) — снять премиум.

Дальше можно подключить **Telegram Stars** или внешнюю оплату: после успешной оплаты бот вызывает тот же `setPremiumUser(telegramId, true)` (доработка кода).

---

## 10. Локальная разработка на Windows

- **Только UI:** `cd telegram-mini-app && npm run dev` → `http://localhost:5174` (mock Telegram).
- **UI + API + синхронизация премиума:**  
  - терминал 1: `cd telegram-mini-app/server && copy .env.example .env` → впиши `BOT_TOKEN` и `WEB_APP_URL` (для теста внутри Telegram — URL с **ngrok** / **cloudflared**).  
  - `node index.mjs`  
  - терминал 2: `cd telegram-mini-app && npm run dev`  
  - Vite проксирует `/api` → `3001`.

Или запусти **`telegram-mini-app/Запустить dev (Vite+API).bat`**.

Проверка мини-приложения **внутри Telegram** с ПК: подними туннель `https://xxx.ngrok-free.app` → прокси на `127.0.0.1:3001` (если отдаёшь и фронт с dev-сервера — см. доки ngrok для Vite; проще собрать `npm run build` и временно гнать туннель на `node server` с `dist`).

---

## 11. Идеи «как у сильных wellness / calm продуктов»

- **Первый экран:** одна главная кнопка «начать», без перегруза текстом.
- **Микро-награды:** стрик и «капли» уже заложены — не раздувай геймификацию; спокойствие ≠ соревнование.
- **Тема Telegram:** мы подставляем `themeParams` — приложение выглядит «родным».
- **Haptic** на успешных действиях (можно расширить).
- **Честные дисклеймеры:** не обещать терапию; кризис — ссылка на ресурсы (в профиле уже есть задел).
- **Онбординг в боте:** короткий `/start` + сразу кнопка Web App — меньше трения, чем «перейди по ссылке».

---

## 12. Чеклист перед запуском для людей

- [ ] HTTPS на боевом домене  
- [ ] `WEB_APP_URL` совпадает с тем, что открывается из Telegram  
- [ ] Домен привязан к боту в BotFather  
- [ ] `BOT_TOKEN` и `ADMIN_TELEGRAM_IDS` в `server/.env`  
- [ ] Сборка фронта с нужным `VITE_TELEGRAM_BOT`  
- [ ] `pm2` и `pm2 save` / `startup`  
- [ ] Тест: `/start` → открыть мини-апп → профиль → премиум тестом `/grant`

Удачи с запуском. Если нужен следующий шаг — **Stars**, **webhook** вместо long polling или общий бэкенд с Prisma из основного Next-проекта, можно спроектировать отдельно.
