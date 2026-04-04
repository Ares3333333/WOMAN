# Folder structure

```
src/
  app/                 # Next.js App Router — routes, layouts, route-level loading.tsx / error.tsx
    actions/           # Cross-route server actions (grouped by domain)
    api/               # Route handlers (auth, register, analytics)
  components/          # Reusable UI (design system, shells, feature-agnostic)
    ui/                # Primitives (button, card, skeleton, …)
    states/            # Loading / error presentation helpers for routes and pages
  lib/                 # Application logic: Prisma, AI/TTS facades, analytics, validations, safety
  types/               # Shared TypeScript types and NextAuth augmentations
features/              # Optional larger modules (see src/features/README.md)
```

**Data flow:** Route (RSC) → `lib/` or server actions → Prisma → UI states (loading / empty / success / error).

**Privacy:** Do not log emails or journal text in analytics; keep `lib/analytics.ts` payloads minimal.
