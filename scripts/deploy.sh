#!/usr/bin/env bash
# Обновление уже развёрнутого приложения (без apt).
# Запускай под тем же пользователем, под которым крутится PM2 (как в bootstrap: RUN_USER / ubuntu / root).
# На сервере нужен файл /var/www/sora/.env.build с export VITE_TELEGRAM_BOT=...

set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/sora}"
GIT_BRANCH="${GIT_BRANCH:-main}"
TG_DIR="$APP_DIR/telegram-mini-app"

cd "$APP_DIR"
git fetch origin
git checkout "$GIT_BRANCH"
git pull origin "$GIT_BRANCH"

if [[ ! -d "$TG_DIR" ]]; then
  echo "Ошибка: нет $TG_DIR"
  exit 1
fi

ENV_BUILD="$APP_DIR/.env.build"
if [[ -f "$ENV_BUILD" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_BUILD"
  set +a
fi

if [[ -z "${VITE_TELEGRAM_BOT:-}" ]]; then
  echo "Ошибка: нет VITE_TELEGRAM_BOT (добавь в $ENV_BUILD: export VITE_TELEGRAM_BOT=https://t.me/...)"
  exit 1
fi

cd "$TG_DIR"
npm ci
npm run build

cd "$TG_DIR/server"
npm ci --omit=dev

pm2 reload "$TG_DIR/ecosystem.config.cjs" --update-env

echo "==> OK: $(date -Iseconds)"
curl -sS "http://127.0.0.1:${PORT:-3001}/api/health" || true
