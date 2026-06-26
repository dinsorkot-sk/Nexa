# Nexa — Agent Guide

## Prerequisites

- **pnpm** (v11.8.0) — never use npm. Install deps: `pnpm install`
- Postinstall auto-runs `nuxt prepare`, generating `.nuxt/`. Required for lint, typecheck, dev.
- **Native binary**: `@libsql/win32-x64-msvc` must compile. If you see `ERR_DLOPEN_FAILED`, run `pnpm rebuild` or `pnpm install --force`.

## Commands (run in order)

```bash
pnpm lint                  # ESLint (uses .nuxt/eslint.config.mjs)
pnpm typecheck             # nuxt typecheck
pnpm test                  # all vitest projects (3 scopes below)
pnpm test:unit             # test/unit/* — pure functions, no setup
pnpm test:nuxt             # test/nuxt/* — engine integration (in-memory SQLite)
pnpm test:e2e              # test/e2e/* — raw SQL against in-memory SQLite, no HTTP
pnpm dev                   # dev server on localhost:3000
pnpm build / pnpm preview  # production
```

**CI** (`.github/workflows/ci.yml`): only `lint` + `typecheck` on push (no tests, no deploy).

## Architecture

```
app/          Nuxt pages, layouts, components, composables, types, utils
server/
  api/        Route handlers — _refs.ts (CRUD), v1/[entity].ts (dynamic CRUD),
              plus mock endpoints (notifications, members, mails, customers)
  engine/     Dynamic CMS engine — sync.ts (schema sync), query.ts (CRUD), include.ts
  db/schema/  Drizzle ORM schema — _modules, _entities, _fields, _relations, _generic_references
test/         Vitest projects: unit/, nuxt/, e2e/
```

- Settings uses nested routing: `pages/settings.vue` + `pages/settings/*.vue`
- Several API endpoints return hardcoded mock arrays (not DB). Only `_refs.ts` and `[entity].ts` use the real DB.

## Database

- SQLite via `@nuxthub/core` (`nuxt.config.ts hub.db: 'sqlite'`)
- Drizzle ORM for system tables. Dynamic entity tables created at runtime by `syncEntity()` / `syncField()`.
- Tests use in-memory SQLite — no external DB required.

## Framework quirks

- **Nuxt 4** + `@nuxt/ui` v4 + Tailwind CSS v4
- `tsconfig.json` references generated files in `.nuxt/` — do not edit directly
- ESLint config extends auto-generated `.nuxt/eslint.config.mjs` (must run `nuxt prepare`)
- `@nuxt/test-utils` version pinned to `4.0.3` in `.nuxtrc`
- Icons: `i-lucide-*` (Lucide) and `i-simple-icons-*` (Simple Icons)
- Keyboard shortcuts via `defineShortcuts()` from `@vueuse/core`
