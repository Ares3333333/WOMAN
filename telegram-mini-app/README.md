# Sora Calm — Telegram Mini App + бот

Женский wellness в Telegram: пути практик, цели недели, **Sora Circle** (премиум), озвучка текста в WebView. Сервер раздаёт **готовый фронт** и проверяет **initData**; бот (GrammY) ставит **menu button** и выдаёт премиум командами `/grant` / `/revoke`.

## Быстрый старт (разработка)

```bash
npm install
cd server && npm install && cd ..
```

**Только интерфейс (mock Telegram):**

```bash
npm run dev
```

**Фронт + API (премиум с сервера):** два терминала или:

```bash
npm run dev:stack
```

Либо **`Запустить dev (Vite+API).bat`** в этой папке.

- Vite: `http://localhost:5174` — прокси `/api` → `http://127.0.0.1:3001`
- Скопируй `server/.env.example` → `server/.env`, укажи `BOT_TOKEN`, `WEB_APP_URL` (для теста в TG — HTTPS-туннель)

## Сборка под прод

```bash
export VITE_TELEGRAM_BOT=https://t.me/ТвойБот
npm run build:deploy
```

На сервере в `server/.env`: `BOT_TOKEN`, `WEB_APP_URL=https://твой-домен.ru`, `PORT`, `ADMIN_TELEGRAM_IDS`.

Запуск:

```bash
cd server && node index.mjs
```

Или **PM2:** из `telegram-mini-app` выполни `pm2 start ecosystem.config.cjs` (после `build:deploy`).

## API

- `POST /api/telegram/me` — тело `{ "initData": "<строка из Telegram.WebApp.initData>" }`, ответ `{ ok, premium, user }`.
- `GET /health` — `200` + `{ "ok": true }` (удобно для health-check PaaS).
- `GET /api/health` — проверка живости с именем сервиса.

Премиум-список: `server/data/subscribers.json` (не в Git; на PaaS файловое хранилище часто не постоянное — см. комментарий в `server/subscribers.mjs`).

## Переменные фронта (`.env` в корне `telegram-mini-app`)

См. `.env.example`: `VITE_TELEGRAM_BOT`, опционально `VITE_API_URL` если API на другом домене.

## Деплой на VPS (копипаста для новичка)

**[README_DEPLOY.md](../README_DEPLOY.md)** — Timeweb Cloud, Ubuntu, **bootstrap** + **deploy** скрипты, PM2, Nginx.

## Деплой в Timeweb App Platform (Node.js)

**[DEPLOY_TIMEWEB.md](./DEPLOY_TIMEWEB.md)** — каталог приложения, build/start-команды и переменные окружения.

Подробный разбор: **[docs/GITHUB-AND-TIMEWEB-RU.md](../docs/GITHUB-AND-TIMEWEB-RU.md)**.

## Структура

```
telegram-mini-app/
  src/           — React
  server/        — Express + статика dist + GrammY
  ecosystem.config.cjs — PM2
```

Веб-версия проекта остаётся в корне репозитория (`СНЭКЕР` / Next.js).
