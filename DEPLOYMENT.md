# Deployment

## Prerequisites

- **Node.js 20+** on the build runner
- **Database:** for a quick self-hosted deploy you can use **SQLite** (`DATABASE_URL="file:./dev.db"` or a path on persistent disk). For serverless (e.g. Vercel) or scale, use **PostgreSQL** (Neon, Supabase, RDS, etc.)

## Environment

Copy `.env.example` to `.env` / hosting secrets and set at least:

- `DATABASE_URL` — `file:./dev.db` for SQLite, or `postgresql://…` for Postgres
- `AUTH_SECRET` (random 32+ bytes)
- `NEXTAUTH_URL` (public site URL, e.g. `https://app.soracalm.com`)
- `ADMIN_EMAILS` for production admin access
- Optional: `OPENAI_API_KEY`, `USE_OPENAI_TTS`, Stripe keys when wiring billing
- `NEXT_PUBLIC_USE_BROWSER_TTS=true` if you rely on client Speech Synthesis without MP3 URLs

## Build

```bash
npm ci
npx prisma generate
npm run build
npm start
```

**SQLite:** before first `start`, apply schema on the server (same machine as the DB file):

```bash
npx prisma db push
npx prisma db seed
```

**PostgreSQL:** use `npx prisma migrate deploy` when you maintain migration history for that provider; align `provider` in `schema.prisma` with your `DATABASE_URL`.

## Seed (once per environment)

```bash
npx prisma db seed
```

Creates categories, tags, sessions, subscription plan stubs, and demo users (`demo@soracalm.app`, `premium@soracalm.app` — see README).

## Vercel (typical)

1. Create project from repo.
2. Add environment variables in the dashboard (use a hosted **PostgreSQL** URL; file SQLite is not suitable for serverless filesystem).
3. Build command: `npm run build` (includes `prisma generate`).
4. Run `prisma migrate deploy` (Postgres) or your chosen schema sync in CI / post-deploy.
5. For file uploads (TTS MP3), use S3-compatible storage and extend `S3StorageAdapter` or write files to a bucket from the TTS provider path.

## Audio in production

- Prefer real TTS files stored on object storage with public URLs saved in `audioFileUrl`.
- Or ship curated MP3s in `public/` for select sessions.

## Stripe (post-MVP)

- Create Products/Prices; set `STRIPE_PRICE_PREMIUM`.
- Add Checkout + Customer Portal routes and webhooks to update `User.subscriptionStatus`.
