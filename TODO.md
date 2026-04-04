# Post-MVP TODO

- [ ] Stripe Checkout, webhooks, and `subscriptionStatus` updates from billing events.
- [ ] Email magic link or OAuth providers (Google) alongside credentials.
- [ ] Persist analytics events to Postgres or warehouse; optional Segment hook.
- [ ] S3 / Supabase Storage implementation for `S3StorageAdapter` + signed uploads from admin.
- [ ] Episode series (bedtime, deep reset) as ordered playlists.
- [ ] Offline/PWA caching for premium subscribers.
- [ ] Localization (EN first; expand copy).
- [ ] Admin roles in database instead of env-only `ADMIN_EMAILS`.
- [ ] Content moderation review queue for generated scripts before publish.
- [ ] Export/delete user data (privacy requests).
- [ ] Replace placeholder silence MP3 with a real short asset in `public/audio/`.
- [ ] Playwright screenshot CI job using `scripts/screenshots.mjs` guidance.
