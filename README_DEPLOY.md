# Деплой Sora Calm (Telegram Mini App) на Timeweb Cloud — простая инструкция

Ты на **Windows**, сервер — **Ubuntu** на Timeweb. **Docker не нужен**: один процесс **Node** (PM2) отдаёт и сайт из `dist`, и API. Перед ним стоит **Nginx** и **SSL (Let’s Encrypt)**.

---

## Что должно быть заранее

1. **VPS / облачный сервер** Timeweb с **Ubuntu 22.04** (или новее).
2. **Домен** (например `sora.твойсайт.ru`), **A-запись** на IP сервера в панели Timeweb / у регистратора.
3. **Репозиторий на GitHub** (лучше приватный), куда залит этот проект **целиком** (вместе с папкой `telegram-mini-app`).

---

## Шаг 1. Подключиться к серверу по SSH с Windows

Установи один из вариантов:

- **Windows Terminal** / **PowerShell**: уже есть `ssh`.
- Или **PuTTY**.

Команда (подставь IP и пользователя — у Timeweb часто `root` или `ubuntu`):

```text
ssh root@ТВОЙ_IP
```

Пароль или ключ — как выдал Timeweb.

---

## Шаг 2. Один раз: клон, секреты, bootstrap

**Почему так:** скрипт `bootstrap-server.sh` лежит **внутри** репозитория, а папка `/var/www/sora` до клона не должна содержать лишних файлов (иначе `git clone … sora` может не сработать). Сначала клон, потом `.env.build`, потом bootstrap.

На сервере выполни **подряд** (замени значения на свои):

```bash
export GIT_REPO="https://github.com/ТВОЙ_ЛОГИН/ТВОЙ_РЕПО.git"
export DOMAIN="sora.твойдомен.ru"
export GIT_BRANCH="main"
```

**1) Клонирование** (каталог `sora` создастся сам; если он уже был — удали его или выбери другой путь и задай `APP_DIR` при bootstrap):

```bash
cd /var/www
git clone --branch "$GIT_BRANCH" "$GIT_REPO" sora
```

**2) Переменная для сборки фронта** (кнопки на бота в Vite):

```bash
nano /var/www/sora/.env.build
```

Вставь **одну строку** (свой бот), сохрани: `Ctrl+O`, Enter, `Ctrl+X`.

```bash
export VITE_TELEGRAM_BOT="https://t.me/ИмяТвоегоБота"
```

**3) Секреты бэкенда** (bootstrap сам скопирует пример, если файла ещё нет — всё равно открой и заполни):

```bash
cp /var/www/sora/telegram-mini-app/server/.env.example /var/www/sora/telegram-mini-app/server/.env
nano /var/www/sora/telegram-mini-app/server/.env
```

В `server/.env` обязательно:

- `BOT_TOKEN` — от **@BotFather**
- `WEB_APP_URL` — **`https://sora.твойдомен.ru`** (как откроется мини-приложение; до SSL можно временно `http://`, потом сменить)
- `PORT=3001`
- `ADMIN_TELEGRAM_IDS` — твой числовой Telegram ID

**4) Первичная настройка сервера** (Node, nginx, сборка, PM2):

```bash
cd /var/www/sora
chmod +x scripts/bootstrap-server.sh scripts/deploy.sh
sudo bash scripts/bootstrap-server.sh
```

Скрипт установит **Node 20**, **git**, **nginx**, **pm2**, при необходимости **certbot**, соберёт фронт и запустит **PM2**.

**5) Автозапуск PM2 после перезагрузки VPS** (один раз; скопируй команду, которую выведет `pm2 startup`, и выполни её — часто от root):

```bash
sudo -u root pm2 startup
```

После этого снова: `sudo -u root pm2 save`. Если приложение запускалось не от `root`, замени пользователя на тот, что в выводе `pm2 status` / в переменной `RUN_USER` при bootstrap.

---

## Шаг 3. SSL (HTTPS) — обязательно для Telegram

Если certbot не запускался автоматически:

```bash
sudo certbot --nginx -d sora.твойдомен.ru
```

Дальше в **BotFather** привяжи **домен мини-приложения** к боту (раздел про Mini App / Domain — как в актуальной справке Telegram).

---

## Шаг 4. Обычное обновление после правок в коде

На **своём ПК**: `git add`, `git commit`, `git push`.

На **сервере** запускай **под тем же пользователем, что владеет PM2-процессом** (если bootstrap шёл с `RUN_USER=ubuntu` — не от root):

```bash
cd /var/www/sora
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

или явно:

```bash
sudo -u ubuntu bash /var/www/sora/scripts/deploy.sh
```

`deploy.sh` делает: `git pull`, `npm ci`, `npm run build`, `npm ci` в `server/`, **`pm2 reload`**.

**Важно:** файл `/var/www/sora/.env.build` с `VITE_TELEGRAM_BOT` должен оставаться на сервере — иначе сборка упадёт. Для `git pull` на сервере нужен доступ к GitHub (HTTPS с токеном, SSH-ключ или публичный репозиторий).

---

## Полезные команды (копируй целиком)

```bash
# Логи приложения
sudo -u root pm2 logs sora-calm-tg

# Статус
pm2 status

# Проверка API
curl -sS http://127.0.0.1:3001/api/health

# Перезапуск без деплоя
cd /var/www/sora/telegram-mini-app && pm2 reload ecosystem.config.cjs
```

Если PM2 запускался не от root — замени пользователя в командах (как в выводе `pm2 status`).

---

## Структура путей (проверено)

| Что | Путь |
|-----|------|
| Репозиторий | `/var/www/sora` |
| Мини-приложение | `/var/www/sora/telegram-mini-app` |
| Сервер Node | `/var/www/sora/telegram-mini-app/server` |
| Сборка React | `/var/www/sora/telegram-mini-app/dist` |
| PM2 конфиг | `/var/www/sora/telegram-mini-app/ecosystem.config.cjs` |
| Nginx шаблон | `/var/www/sora/nginx/sora.conf` |
| Секреты бэкенда | `/var/www/sora/telegram-mini-app/server/.env` |
| Переменные сборки | `/var/www/sora/.env.build` |

---

## Самый простой вариант архитектуры

Один **Node-процесс** слушает **3001**: отдаёт статику из **`dist`** и обрабатывает **`/api/*`**. **Nginx** на **443** проксирует на **3001**. Отдельного Docker и отдельного «только фронт» хостинга не нужно.

Подробнее про GitHub и сценарии — **`docs/GITHUB-AND-TIMEWEB-RU.md`**.

---

## Авто-SSL в bootstrap (опционально)

Если хочешь, чтобы скрипт сам вызвал certbot:

```bash
export RUN_CERTBOT=1
export SSL_EMAIL="you@example.com"
sudo -E bash scripts/bootstrap-server.sh
```

(`GIT_REPO`, `DOMAIN` и `.env.build` всё равно нужны.)
