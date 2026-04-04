# Sora Calm

Women-focused **wellness audio** web app: guided calm, breath, grounding, sleep, emotional reset, body awareness, and **non-explicit** sensual wellness. **Not** therapy, **not** medical advice, **not** crisis care.

## Stack

- **Next.js 14** (App Router) · **TypeScript** · **Tailwind** · **shadcn-style UI** · **Framer Motion** · **NextAuth (Auth.js v5 beta)** (credentials) · **Prisma** · **SQLite (local file)** · **Zod** · **Vitest**

See **`ARCHITECTURE.md`** for route map and component tree.

**Governance:** **`PROJECT_RULES.md`** (content, privacy, architecture, required UI states) and **`.cursor/rules/sora-calm.mdc`** for tooling. **`docs/folder-structure.md`** describes where code belongs.

---

## Запуск за одну команду (рекомендуется)

1. Установите **Node 20+**.
2. В папке проекта:

   ```bash
   npm install
   npm run dev
   ```

3. При **первом** `npm run dev` скрипт сам:
   - создаст **`.env`** (если его не было) с `DATABASE_URL=file:./dev.db`, `AUTH_SECRET`, `NEXT_PUBLIC_USE_BROWSER_TTS=true`, **`DEV_SKIP_LOGIN=true`**;
   - выполнит **`prisma db push`** (файл **`prisma/dev.db`**);
   - один раз выполнит **seed**, если нет пользователя `demo@soracalm.app`.

4. Откройте [http://localhost:3000](http://localhost:3000) → **Войти** — при `DEV_SKIP_LOGIN=true` вы **сразу попадёте в приложение** как **premium** (без ввода пароля). Обычная форма: **`/sign-in?manual=1`**. В продакшене поставьте **`DEV_SKIP_LOGIN=false`**.
   - При отключённом быстром входе: **premium** `premium@soracalm.app` / `premium123456`, **demo** `demo@soracalm.app` / `demo123456`.

**Озвучка:** по умолчанию браузер читает **весь текст сессии** (Speech Synthesis). Нажмите Play в плеере. Для русского интерфейса выберите язык RU — голос подставится `ru-RU`, если система его даёт.

**Если раньше был `.env` с PostgreSQL** и ничего не работает — удалите `.env` и снова выполните `npm run dev`, либо вручную поставьте `DATABASE_URL="file:./dev.db"` и `npm run db:setup`.

---

## Implementation status (MVP phases)

| Phase | What shipped |
| ----- | ------------ |
| **1 — Data** | Prisma + **SQLite** file DB, seed with **24+ sessions**, programs hub (`/app/learn`), demo + premium accounts. |
| **2 — Quick start** | **`predev`** prepares DB; or `npm run db:setup` manually. |
| **3 — AI / TTS** | Mock providers; optional OpenAI when keys set. |
| **4 — Product** | Age gate, crisis guard, sensual prefs, **browser TTS** for guided script. |
| **5 — Polish** | Landing, admin studio, i18n EN/RU. |
| **6 — UX states** | `loading` / `error` routes, inline form states. |

---

## Manual database (без predev)

```bash
npm run db:setup
```

(`prisma db push` + `prisma db seed`)

---

## Scripts

| Command | Description |
| --------| ------------|
| `npm run dev` | Creates `.env` if missing, syncs SQLite, seeds if needed, starts Next.js |
| `npm run build` | `prisma generate` + production build |
| `npm run start` | Production server (run `prisma db push` once on the server if needed) |
| `npm run db:setup` | `db push` + seed |
| `npm run check:login` | Verify DB + demo password hashes |
| `npm run lint` | ESLint |
| `npm run test:run` | Vitest |

---

## Production / PostgreSQL

Для продакшена можно сменить `provider` в `schema.prisma` на `postgresql` и выставить `DATABASE_URL` на облачную БД. Локально по умолчанию — **SQLite**, без Docker.

`docker-compose.yml` в репозитории — **опционально**, если вы сами хотите Postgres локально.

---

## Mock mode (no paid APIs)

- No `OPENAI_API_KEY` → **MockAiProvider** in admin.
- Player: **browser Speech Synthesis** by default; MP3 when `audioFileUrl` is set and TTS env off.

---

See **`DEPLOYMENT.md`** for hosting notes.

---

## Telegram Mini App

Папка **`telegram-mini-app/`**: Vite + React + **Node-сервер с ботом** (раздача `dist`, API, премиум по `initData`). Кратко — **`telegram-mini-app/README.md`**, полный деплой (GitHub, **Timeweb VPS**, Nginx, SSL, BotFather) — **`docs/GITHUB-AND-TIMEWEB-RU.md`**.
