import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const envPath = path.join(root, ".env");
const examplePath = path.join(root, ".env.example");

const SQLITE_LINE = 'DATABASE_URL="file:./dev.db"';

/** Prisma schema is SQLite — DATABASE_URL must use file: protocol. */
function fixDatabaseUrlIfNeeded(content) {
  const lines = content.split(/\r?\n/);
  let found = false;
  let changed = false;
  const out = lines.map((line) => {
    const m = line.match(/^\s*DATABASE_URL\s*=\s*(.*)$/);
    if (!m) return line;
    found = true;
    const raw = m[1].trim();
    const unquoted = raw.replace(/^["']|["']$/g, "");
    if (!unquoted.startsWith("file:")) {
      changed = true;
      return SQLITE_LINE;
    }
    return line;
  });
  if (!found) {
    out.unshift(SQLITE_LINE);
    changed = true;
  }
  return { text: out.join("\n"), changed };
}

/** One-click dev sign-in — disable with DEV_SKIP_LOGIN=false in production. */
function ensureDevSkipLogin(content) {
  if (/^\s*DEV_SKIP_LOGIN\s*=/m.test(content)) {
    return { text: content, changed: false };
  }
  const sep = content.endsWith("\n") ? "" : "\n";
  return {
    text: `${content}${sep}DEV_SKIP_LOGIN=true\n`,
    changed: true,
  };
}

if (fs.existsSync(envPath)) {
  let text = fs.readFileSync(envPath, "utf8");
  let changed = false;
  const db = fixDatabaseUrlIfNeeded(text);
  if (db.changed) {
    text = db.text;
    changed = true;
    console.log(
      "[sora-calm] DATABASE_URL was not SQLite (file:…). Set to file:./dev.db for this project.",
    );
  }
  const dev = ensureDevSkipLogin(text);
  if (dev.changed) {
    text = dev.text;
    changed = true;
    console.log("[sora-calm] Added DEV_SKIP_LOGIN=true (passwordless local sign-in). Set false for production.");
  }
  if (changed) fs.writeFileSync(envPath, text, "utf8");
  process.exit(0);
}

let body = `${SQLITE_LINE}
AUTH_SECRET="${crypto.randomBytes(32).toString("base64url")}"
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_USE_BROWSER_TTS=true
DEV_SKIP_LOGIN=true
`;

if (fs.existsSync(examplePath)) {
  const ex = fs.readFileSync(examplePath, "utf8");
  if (ex.includes("postgresql://") && !ex.includes("file:./dev.db")) {
    // .env.example may document postgres for prod; generated .env stays SQLite
  }
}

fs.writeFileSync(envPath, body, "utf8");
console.log("[sora-calm] Created .env with SQLite + browser TTS. Edit if needed.");
