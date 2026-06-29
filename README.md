# Nexa

Metadata-driven application platform built on [Nuxt 4](https://nuxt.com) + SQLite.

Define entities, fields, and relations at runtime — the engine generates REST APIs and database schemas automatically.

[![Nuxt UI](https://img.shields.io/badge/Made%20with-Nuxt%20UI-00DC82?logo=nuxt&labelColor=020420)](https://ui.nuxt.com)

## Architecture

See [`nexa-architecture.drawio`](./nexa-architecture.drawio) for C4 architecture diagrams (6 pages covering system context, containers, runtime engine, and data model).

```
app/          Nuxt pages, layouts, components, composables
server/
  api/        REST handlers — dynamic CRUD, metadata CRUD, mock endpoints
  engine/     Schema sync, dynamic query builder, relation nesting
  db/schema/  Drizzle ORM system tables
  tasks/      Nuxt tasks (seed)
  utils/      Zod validation engine
test/         Vitest: unit, nuxt integration, e2e
```

## Setup

```bash
pnpm install
```

Postinstall auto-runs `nuxt prepare` (generates `.nuxt/` types).

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Dev server on `http://localhost:3000` |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | Nuxt typecheck |
| `pnpm test:unit` | Pure function tests (no setup) |
| `pnpm test:nuxt` | Engine integration tests (in-memory SQLite) |
| `pnpm test:e2e` | Raw SQL tests (in-memory SQLite) |
| `pnpm build` | Production build |
| `pnpm preview` | Preview production build |

## Database

SQLite via `@nuxthub/core`. System metadata tables via Drizzle ORM. Dynamic entity tables created at runtime by the engine. Tests use in-memory SQLite — no external DB required.

## Pre-commit

Husky runs `pnpm lint && pnpm typecheck` before every commit. Both must pass.
