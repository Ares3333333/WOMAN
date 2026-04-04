import "dotenv/config";
import cors from "cors";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Bot, InlineKeyboard } from "grammy";
import { isPremiumUser, setPremiumUser } from "./subscribers.mjs";
import { parseUser, validateInitData } from "./validateInitData.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "..", "dist");

const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT || 3000);
const BOT_TOKEN = process.env.BOT_TOKEN || "";
const WEB_APP_URL = process.env.WEB_APP_URL || "";

const app = express();

const corsOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: corsOrigins.length ? corsOrigins : true,
    credentials: true,
  })
);
app.use(express.json({ limit: "80kb" }));

app.post("/api/telegram/me", (req, res) => {
  const initData = req.body?.initData;
  if (!BOT_TOKEN) {
    return res.status(503).json({ ok: false, error: "server_misconfigured" });
  }
  const data = validateInitData(initData, BOT_TOKEN);
  if (!data) {
    return res.status(401).json({ ok: false, error: "invalid_init_data" });
  }
  const user = parseUser(data);
  if (!user?.id) {
    return res.status(401).json({ ok: false, error: "no_user" });
  }
  const premium = isPremiumUser(user.id);
  res.json({
    ok: true,
    premium,
    user: {
      id: user.id,
      first_name: user.first_name,
      username: user.username,
    },
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "sora-telegram-server" });
});

/** Платформенные проверки (Timeweb и др.) — без зависимости от dist и BOT_TOKEN */
app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(distDir, "index.html"), (err) => err && next(err));
  });
}

async function setupBot() {
  if (!BOT_TOKEN || !WEB_APP_URL) {
    console.warn("[bot] BOT_TOKEN or WEB_APP_URL missing — bot and menu button disabled.");
    return null;
  }
  const bot = new Bot(BOT_TOKEN);

  bot.command("start", async (ctx) => {
    const arg = (ctx.match || "").trim();
    const ru = ctx.from?.language_code?.toLowerCase().startsWith("ru");
    const openLabel = ru ? "Открыть Sora Calm" : "Open Sora Calm";
    const kb = new InlineKeyboard().webApp(openLabel, WEB_APP_URL);

    let text;
    if (arg === "premium") {
      text = ru
        ? "Sora Circle — полная библиотека практик. Продолжи в приложении: Меню → Sora Calm, раздел «Профиль»."
        : "Sora Circle — full practice library. Open the mini app from the menu, then Profile.";
    } else {
      text = ru
        ? "Твоё спокойное пространство: дыхание, сон, границы, забота о себе. Нажми кнопку — откроется мини-приложение."
        : "Your calm space: breath, sleep, boundaries, gentle care. Tap the button to open the mini app.";
    }
    await ctx.reply(text, { reply_markup: kb });
  });

  bot.command("help", async (ctx) => {
    const ru = ctx.from?.language_code?.toLowerCase().startsWith("ru");
    await ctx.reply(
      ru
        ? "Команды:\n/start — открыть приложение\n/start premium — про подписку\n/help"
        : "Commands:\n/start — open app\n/start premium — subscription info\n/help"
    );
  });

  const adminSet = new Set(
    (process.env.ADMIN_TELEGRAM_IDS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );

  bot.command("grant", async (ctx) => {
    if (!adminSet.has(String(ctx.from?.id))) {
      await ctx.reply("Нет доступа / Access denied.");
      return;
    }
    const rid = ctx.message?.reply_to_message?.from?.id;
    if (!rid) {
      await ctx.reply("Ответь этой командой на сообщение пользователя. / Reply to a user message.");
      return;
    }
    setPremiumUser(rid, true);
    await ctx.reply(`Premium ON for Telegram ID: ${rid}`);
  });

  bot.command("revoke", async (ctx) => {
    if (!adminSet.has(String(ctx.from?.id))) {
      await ctx.reply("Нет доступа / Access denied.");
      return;
    }
    const rid = ctx.message?.reply_to_message?.from?.id;
    if (!rid) {
      await ctx.reply("Ответь на сообщение пользователя. / Reply to a user message.");
      return;
    }
    setPremiumUser(rid, false);
    await ctx.reply(`Premium OFF for Telegram ID: ${rid}`);
  });

  await bot.api.setChatMenuButton({
    menu_button: {
      type: "web_app",
      text: "Sora Calm",
      web_app: { url: WEB_APP_URL },
    },
  });

  bot.catch((err) => console.error("[bot]", err));
  bot.start().catch((e) => console.error("[bot] start failed", e));
  console.log("[bot] Long polling starting, menu button set.");
  return bot;
}

app.listen(PORT, HOST, () => {
  console.log(`[http] listening on http://${HOST}:${PORT}`);
  if (fs.existsSync(distDir)) {
    console.log(`[http] serving static from ${distDir}`);
  } else {
    console.warn("[http] ../dist not found — run npm run build in telegram-mini-app first");
  }
  setupBot().catch((e) => console.error("[bot] failed to start", e));
});
