# Features (module boundaries)

Use this folder when a capability outgrows a single route folder.

**Suggested shape per feature:**

```
features/<name>/
  README.md          # What it does, main entry points
  components/        # Feature-specific UI (or re-export from src/components)
  hooks/             # Client hooks
  # Server actions may stay in src/app/actions/<name>.ts or move here as *.ts
```

**Current MVP:** most logic lives in `src/app`, `src/components`, and `src/lib`. Migrate here incrementally when a feature has multiple screens, shared hooks, and non-trivial domain rules—**prefer maintainability over premature splitting**.
