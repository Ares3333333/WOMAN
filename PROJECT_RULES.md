# Sora Calm — project rules

These rules apply to all contributions and AI-assisted work. They are mirrored in **`.cursor/rules/sora-calm.mdc`**.

## Content

| Rule | Detail |
|------|--------|
| No explicit adult content | No pornographic or graphic sexual material. |
| Sensual wellness | Tasteful, non-graphic, consent-first, breath/body/nervous-system framing only. |
| No medical role-play | Wellness copy only; crisis → real-world resources. |

## Privacy

- Collect **minimum** personal data needed for the product.
- Do **not** sell user data or use dark patterns.
- Analytics: **no PII** in event payloads; prefer session-safe identifiers only.
- See **`/privacy`** for the user-facing summary.

## Architecture

- **Maintainability over cleverness**: obvious names, shallow abstractions, typed boundaries.
- **Layout**: `src/app` (routes), `src/components` (UI), `src/lib` (data + integrations), `src/types` (shared types). Larger features may move under `src/features/<name>/` (see `src/features/README.md`).
- **Server actions** in `src/app/actions/` unless a feature module owns them.

## UI states (every new feature)

Each new feature must implement:

1. **Loading** — skeleton / spinner / disabled control / `loading.tsx`.
2. **Empty** — `EmptyState` or equivalent + clear CTA.
3. **Success** — visible confirmation after success.
4. **Error** — safe message + retry or escape hatch; route `error.tsx` where it helps.

Existing screens should be updated toward this standard when touched.
