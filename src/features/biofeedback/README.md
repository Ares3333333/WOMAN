# Biofeedback Feature

Wellness-only camera biofeedback for meditation flow:

- pre-session pulse check-in,
- optional breath coach during session,
- post-session effect,
- history and trends.

Design constraints:

- no medical claims,
- no diagnosis/treatment language,
- on-device signal processing where possible,
- never show fabricated values when signal quality is poor.

Module layout:

- `types.ts` shared domain types,
- `quality-gating.ts` signal validity checks,
- `pulse-estimator.ts` camera PPG-like pulse estimation,
- `baseline.ts` personal baseline updates,
- `scoring.ts` calm/recovery/effect scoring,
- UI components under `components/`,
- server persistence in `src/app/actions/biofeedback.ts`.

