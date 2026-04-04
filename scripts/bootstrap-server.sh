#!/usr/bin/env bash
# Первичная настройка Ubuntu VPS: Node LTS, git, nginx, клон репо, сборка, PM2.
# Запуск: sudo bash scripts/bootstrap-server.sh
# Перед запуском задай переменные (или экспортируй из файла):
#   export GIT_REPO="https://github.com/USER/REPO.git"
#   export DOMAIN="sora.example.com"
# Опционально: APP_DIR, GIT_BRANCH, RUN_USER, RUN_CERTBOT, SSL_EMAIL

set -euo pipefail

if [[ "${EUID:-0}" -ne 0 ]]; then
  echo "Запусти от root: sudo bash $0"
  exit 1
fi

APP_DIR="${APP_DIR:-/var/www/sora}"
GIT_BRANCH="${GIT_BRANCH:-main}"
RUN_USER="${RUN_USER:-${SUDO_USER:-root}}"
GIT_REPO="${GIT_REPO:?Укажи GIT_REPO=https://github.com/...}"
DOMAIN="${DOMAIN:?Укажи DOMAIN=твой-домен.ru}"

echo "==> APP_DIR=$APP_DIR DOMAIN=$DOMAIN BRANCH=$GIT_BRANCH USER=$RUN_USER"

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y ca-certificates curl git nginx

if ! command -v node >/dev/null 2>&1 || [[ "$(node -v 2>/dev/null || true)" != v20* && "$(node -v 2>/dev/null || true)" != v22* ]]; then
  echo "==> Устанавливаю Node.js 20 LTS (NodeSource)…"
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

command -v pm2 >/dev/null 2>&1 || npm install -g pm2

if ! command -v certbot >/dev/null 2>&1; then
  echo "==> Certbot (для SSL, опционально)…"
  apt-get install -y certbot python3-certbot-nginx || true
fi

if [[ ! -d "$APP_DIR/.git" ]]; then
  echo "==> git clone → $APP_DIR"
  PARENT="$(dirname "$APP_DIR")"
  install -d -m 755 "$PARENT"
  git clone --branch "$GIT_BRANCH" "$GIT_REPO" "$APP_DIR"
else
  echo "==> git fetch + checkout $GIT_BRANCH"
  cd "$APP_DIR"
  git fetch origin
  git checkout "$GIT_BRANCH"
  git pull origin "$GIT_BRANCH"
fi

chown -R "$RUN_USER:$RUN_USER" "$APP_DIR" || true

TG_DIR="$APP_DIR/telegram-mini-app"
if [[ ! -d "$TG_DIR" ]]; then
  echo "Ошибка: нет каталога $TG_DIR (ожидается монорепо с папкой telegram-mini-app)."
  exit 1
fi

ENV_BUILD="$APP_DIR/.env.build"
if [[ -f "$ENV_BUILD" ]]; then
  echo "==> Подключаю $ENV_BUILD (VITE_*)"
  set -a
  # shellcheck disable=SC1090
  source "$ENV_BUILD"
  set +a
fi

if [[ -z "${VITE_TELEGRAM_BOT:-}" ]]; then
  echo "Ошибка: задай VITE_TELEGRAM_BOT (в $ENV_BUILD или export перед запуском)."
  exit 1
fi

SERVER_ENV="$TG_DIR/server/.env"
if [[ ! -f "$SERVER_ENV" ]]; then
  if [[ -f "$TG_DIR/server/.env.example" ]]; then
    echo "==> Копирую server/.env.example → server/.env — ОБЯЗАТЕЛЬНО отредактируй и впиши BOT_TOKEN и WEB_APP_URL!"
    cp "$TG_DIR/server/.env.example" "$SERVER_ENV"
    chown "$RUN_USER:$RUN_USER" "$SERVER_ENV"
  else
    echo "Ошибка: нет $TG_DIR/server/.env и нет .env.example"
    exit 1
  fi
fi

echo "==> npm ci + build (telegram-mini-app)"
sudo -u "$RUN_USER" bash -c "cd \"$TG_DIR\" && npm ci && npm run build"

echo "==> npm ci server (production)"
sudo -u "$RUN_USER" bash -c "cd \"$TG_DIR/server\" && npm ci --omit=dev"

NGX_SRC="$APP_DIR/nginx/sora.conf"
NGX_DST="/etc/nginx/sites-available/sora"
if [[ -f "$NGX_SRC" ]]; then
  echo "==> nginx: $NGX_SRC → $NGX_DST"
  sed "s/__DOMAIN__/${DOMAIN}/g" "$NGX_SRC" >"$NGX_DST"
  ln -sf "$NGX_DST" /etc/nginx/sites-enabled/sora
  rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
  nginx -t
  systemctl reload nginx
else
  echo "Предупреждение: нет $NGX_SRC — настрой nginx вручную."
fi

echo "==> PM2"
cd "$TG_DIR"
sudo -u "$RUN_USER" pm2 delete sora-calm-tg 2>/dev/null || true
sudo -u "$RUN_USER" pm2 start ecosystem.config.cjs
sudo -u "$RUN_USER" pm2 save

if [[ "${RUN_CERTBOT:-0}" == "1" ]]; then
  EMAIL="${SSL_EMAIL:?Для RUN_CERTBOT=1 укажи SSL_EMAIL}"
  certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect
fi

echo ""
echo "=== Готово ==="
echo "Если только что заполнял server/.env — перезапусти процесс:"
echo "  sudo -u $RUN_USER pm2 restart sora-calm-tg"
echo "Проверка: curl -sS http://127.0.0.1:3001/api/health"
echo "Сайт: https://$DOMAIN (после SSL)"
echo "Логи: sudo -u $RUN_USER pm2 logs sora-calm-tg"
echo "Если SSL ещё нет: sudo certbot --nginx -d $DOMAIN"
