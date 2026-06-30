# Nexa — Agent Guide

## Prerequisites

- **pnpm** (v11.9.0) — never use npm. Install deps: `pnpm install`
- Postinstall auto-runs `nuxt prepare`, generating `.nuxt/`. Required for lint, typecheck, dev.
- **Native binary**: `@libsql/win32-x64-msvc` must compile. If you see `ERR_DLOPEN_FAILED`, run `pnpm rebuild` or `pnpm install --force`.
- **Pre-commit**: Husky runs `pnpm lint && pnpm typecheck`. Both must pass to commit.

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
  api/        Route handlers (Nitro file-based method routing: *.get.ts, *.post.ts, etc.)
    _refs.get|post|delete.ts     CRUD for generic_references table (real DB)
    v1/
      _entity-utils.ts           Shared entity lookup + validation
      [entity].get|post|put|delete|patch.ts  Dynamic CRUD engine (real DB)
    metadata/                    Metadata CRUD: entities, fields, relations, sync
    members.ts                   Mock (hardcoded array)
    mails.ts                     Mock
    customers.ts                 Mock
    notifications.ts             Mock
    auth/                        Auth routes: login, register, logout, me, roles, invite, config, events
    seed-auth.post.ts            Seed auth data (Admin + Member roles, admin user)
  engine/     Dynamic CMS engine — sync.ts (schema sync), query.ts (CRUD), include.ts
  db/schema/  Drizzle ORM — metadata.ts (_modules, _entities, _fields), relations.ts, generic-refs.ts, auth.ts (_users, _sessions, _roles, _user_roles, _invites)
  tasks/      Nuxt tasks — seed.ts (db:seed, canonical metadata bootstrap)
  utils/      Zod validation — validate.ts (buildEntitySchema, filterKnownFields, coerceFieldTypes); auth.ts (password hashing, tokens), session.ts (session management, requireAuth)
test/         Vitest projects: unit/, nuxt/, e2e/
```

- Settings uses nested routing: `pages/settings.vue` + `pages/settings/*.vue`
- 4 mock endpoints (notifications, members, mails, customers) return hardcoded arrays.
- Diagram: `nexa-architecture.drawio` contains C4 architecture diagrams (6 pages).
- Metadata ERD uses Vue Flow, field-level handles, and virtual pivot nodes for `N:N` relations.

## Database

- SQLite via `@nuxthub/core` (`nuxt.config.ts hub.db: 'sqlite'`)
- Drizzle ORM for system tables. Dynamic entity tables created at runtime by `syncEntity()` / `syncField()` / `syncRelation()`.
- Seeded relations follow engine types only: `1:1`, `1:N`, `N:N`, `self`.
- Tests use in-memory SQLite — no external DB required.

## Framework quirks

- **Nuxt 4** + `@nuxt/ui` v4 + Tailwind CSS v4
- `tsconfig.json` references generated files in `.nuxt/` — do not edit directly
- ESLint config extends auto-generated `.nuxt/eslint.config.mjs` (must run `nuxt prepare`)
- `nuxt.config.ts` sets `@stylistic` rules: `commaDangle: 'never'`, `braceStyle: '1tbs'`
- `@nuxt/test-utils` version pinned to `4.0.3` in `.nuxtrc`
- Icons: `i-lucide-*` (Lucide) and `i-simple-icons-*` (Simple Icons)
- Keyboard shortcuts via `defineShortcuts()` from `@vueuse/core`
- Husky hooks auto-enabled via `"prepare": "husky"` in package.json
- `routeRules`: `/api/**` has CORS enabled
- `devtools` enabled
- `compatibilityDate`: `2024-07-11`
- `nitro.experimental.tasks: true` (required for `db:seed` task)
- Global CSS: `~/assets/css/main.css`

## Installed Skills

See [`skills-lock.json`](./skills-lock.json) for the full list of installed skills.
Sources: `anthropics/skills`, `obra/superpowers`, `pbakaus/impeccable`, `arvindrk/extract-design-system`.

**NOTE:** `mattpocock/skills` skills are NOT compatible with current skills CLI — skip until fixed.
