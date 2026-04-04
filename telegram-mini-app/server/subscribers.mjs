/**
 * Локальное хранилище премиум-флагов в JSON на диске.
 *
 * В Timeweb App Platform (и аналогичных PaaS) контейнерная/временная файловая система
 * обычно не сохраняет такие файлы между деплоями и рестартами — данные не будут
 * постоянными. Для продакшена позже вынести в БД или внешнее хранилище.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");
const FILE = path.join(DATA_DIR, "subscribers.json");

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, JSON.stringify({ subscribers: {} }, null, 2), "utf8");
  }
}

export function loadSubscribers() {
  ensureFile();
  try {
    const j = JSON.parse(fs.readFileSync(FILE, "utf8"));
    return j.subscribers && typeof j.subscribers === "object" ? j.subscribers : {};
  } catch {
    return {};
  }
}

export function saveSubscribers(map) {
  ensureFile();
  fs.writeFileSync(FILE, JSON.stringify({ subscribers: map }, null, 2), "utf8");
}

export function isPremiumUser(telegramId) {
  const id = String(telegramId);
  const m = loadSubscribers();
  return m[id] === true;
}

export function setPremiumUser(telegramId, value) {
  const id = String(telegramId);
  const m = loadSubscribers();
  m[id] = Boolean(value);
  saveSubscribers(m);
}
