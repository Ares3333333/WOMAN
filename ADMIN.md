# Admin / Content Studio

## Access

- Sign in with an account whose email is listed in `ADMIN_EMAILS` (comma-separated).
- If `ADMIN_EMAILS` is **empty**, any signed-in user can open `/admin` (development convenience only — set emails before production).

## Capabilities

1. **Sessions list** (`/admin/sessions`) — edit, delete.
2. **New session + generator** (`/admin/sessions/new`) — run AI script generation (mock without `OPENAI_API_KEY`, or OpenAI when configured). Review JSON, set category/tags, publish.
3. **Edit session** (`/admin/sessions/[id]/edit`) — update copy, script JSON, publish flags, **Generate TTS** (mock returns `/audio/placeholder-silence.mp3`; OpenAI speech when `USE_OPENAI_TTS=true` and `OPENAI_API_KEY` set), or **Save audio URL** for manual uploads (path under `/public` or HTTPS).
4. **Logs** — recent rows from `AdminGenerationLog` (script/TTS successes and errors).

## Safety

- Generator system prompt enforces non-explicit, non-medical, consent-first language.
- Use **Forbidden phrases** in the generator form to block specific wording.

## Republish

- Toggle **Published** on the edit form and save to republish.
