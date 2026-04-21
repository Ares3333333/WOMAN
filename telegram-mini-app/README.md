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

## Biofeedback Smart Flow (Telegram Mini App)

Added inside `telegram-mini-app` as a wellness-only feature (no medical claims):

- Smart one-button check-in in session screen (`SessionPlay`) with dual-camera probe.
- If dual front+rear capture is supported: front and rear scans run in parallel.
- If not supported (common in Telegram WebView): seamless fallback runs front scan first, then rear pulse scan.
- Rear pulse scan includes explicit camera guidance and finger placement visual.
- Front scan estimates breathing rhythm, regularity, and calm/activation state with quality/confidence gating.
- During practice, microphone breathing capture tracks pace consistency and produces gentle post-session feedback.
- During practice, cameras are off by design: user follows voice + visual breathing guide while microphone tracks rhythm.
- Post-session check compares before/after (pulse, calm score, breathing).
- Final effect card now includes clear today/tomorrow actions plus a short motivational quote.
- History page (`/biofeedback`) shows trend summary and recent session effects.

### Privacy and safety

- Positioning: wellness and mindfulness only.
- No blood pressure, no medical-grade SpO2, no disease detection, no diagnosis.
- Processing is on-device in browser APIs where feasible.
- Raw video is not persisted.
- Microphone capture is analyzed locally; raw audio is not stored as user history payload.

### Key files

- `src/pages/SessionPlay.tsx`
- `src/pages/Biofeedback.tsx`
- `src/lib/cameraPulseScan.ts`
- `src/lib/frontBreathScan.ts`
- `src/lib/audioBreathTracker.ts`
- `src/lib/cameraCapabilities.ts`
- `src/lib/smartRecommendations.ts`
- `src/lib/biofeedback.ts`
- `src/styles/global.css`
- `src/lib/i18n.tsx`

### Verify manually

1. Open any available session in mini app (`/session/:slug`).
2. Tap **Start smart check**.
3. Grant camera permission.
4. Validate rear guidance text + visual finger placement overlay.
5. Run practice (`audio`, `voice`, or `visual mode` if no uploaded audio).
6. Finish session and run **post-check**.
7. Open **History & trends** and confirm saved entries.

### Known hardware/webview limits

- Concurrent front+rear capture depends on device + Telegram WebView policy.
- Torch availability for rear camera is device/browser dependent.
- Breath estimation quality depends on lighting, motion, and camera stability.

### Camera UX details (new)

- Rear pulse UI includes a tiny lens target marker to show exactly where finger should go.
- Front camera scan shows a compact picture-in-picture preview with live landmark dots when mesh is available.
- If mesh runtime is unavailable, scan falls back to optical signal mode with explicit reduced-trust messaging.
- Dual-camera mode attempts true parallel front+rear streams; when blocked by WebView/device policy, app keeps one-button staged fallback.
