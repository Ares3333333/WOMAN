# Timeweb App Platform (Node.js)

Корень Git-репозитория может быть шире; в панели укажи **подпапку с мини-приложением**.

## Project directory

```text
telegram-mini-app
```

## Build command

```bash
npm ci && npm run build && npm ci --omit=dev --prefix server
```

Для сборки фронта задай в окружении сборки (или общих переменных, если Timeweb передаёт их в build):

- `VITE_TELEGRAM_BOT` — например `https://t.me/YourBot`
- `VITE_API_URL` — опционально; если не задано, API с того же домена, что и мини-пп

## Start command

Рабочий каталог процесса — как **project directory** (`telegram-mini-app`).

```bash
npm start --prefix server
```

Node стартует из `server/`, статика читается из `../dist`.

## Переменные окружения (runtime)

| Переменная | Нужна | Описание |
|------------|-------|----------|
| `BOT_TOKEN` | Да | Токен @BotFather |
| `WEB_APP_URL` | Да | HTTPS URL мини-приложения в Telegram |
| `ADMIN_TELEGRAM_IDS` | Да* | ID через запятую для `/grant` и `/revoke` |
| `PORT` | Нет | Обычно задаёт платформа; иначе **3000** |
| `HOST` | Нет | По умолчанию **0.0.0.0** |
| `CORS_ORIGIN` | Нет | Origins через запятую; пусто = любые |

Проверка: `GET /health` → **200** и `{"ok":true}`.

Премиум в `server/data/*.json` на PaaS часто **не переживает** деплой — позже лучше вынести в БД.
