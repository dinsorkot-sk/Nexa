# Nexa — Agent Guide

## Prerequisites

- **pnpm** (v11.8.0) — never use npm. Install deps: `pnpm install`
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
  api/        Route handlers
    _refs.ts              CRUD for generic_references table (real DB)
    v1/[entity].ts        Dynamic CRUD engine (real DB)
    metadata/             Metadata CRUD: entities, fields, relations, sync
    members.ts            Mock (hardcoded array)
    mails.ts              Mock
    customers.ts          Mock
    notifications.ts      Mock
  engine/     Dynamic CMS engine — sync.ts (schema sync), query.ts (CRUD), include.ts
  db/schema/  Drizzle ORM — metadata.ts (_modules, _entities, _fields), relations.ts, generic-refs.ts
  tasks/      Nuxt tasks — seed.ts (db:seed, canonical metadata bootstrap)
  utils/      Zod validation — validate.ts (buildEntitySchema, filterKnownFields, coerceFieldTypes)
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

## Installed Skills (skills.sh)

```bash
# Design & UI
npx skills add -y anthropics/skills          # frontend-design, theme-factory, brand-guidelines +15 more
npx skills add -y pbakaus/impeccable         # UI review & polish

# Agent Workflows & Planning
npx skills add -y obra/superpowers           # writing-plans, subagent-driven-development,
                                             # systematic-debugging, executing-plans,
                                             # test-driven-development +9 more

# Design System & Tailwind
npx skills add -y wshobson/agents              # tailwind-design-system, typescript-advanced-types +3 more
npx skills add -y arvindrk/extract-design-system # extract tokens from existing codebase

# NOTE: mattpocock/skills skills (improve-codebase-architecture, tdd)
# are NOT compatible with current skills CLI (1.5.13) - skip until fixed
```
