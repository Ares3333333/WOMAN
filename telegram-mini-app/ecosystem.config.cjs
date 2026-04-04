/**
 * PM2: единый процесс Node — статика из ../dist + API + бот (long polling).
 *
 * Запуск с сервера:
 *   cd /var/www/sora/telegram-mini-app && pm2 start ecosystem.config.cjs
 * Перезагрузка:
 *   pm2 reload /var/www/sora/telegram-mini-app/ecosystem.config.cjs --update-env
 *
 * Секреты читает server/index.mjs из server/.env (cwd = server).
 */
const path = require("node:path");

module.exports = {
  apps: [
    {
      name: "sora-calm-tg",
      cwd: path.join(__dirname, "server"),
      script: "index.mjs",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "400M",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
    },
  ],
};
