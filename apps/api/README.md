# @luxury-investment/api

Express 5 API that owns all data and business rules (see `docs/architecture.md`). Runs directly on Node 26: TypeScript types are stripped natively, so there is no build step (`npm start` = `node src/main.ts`).

## Layout

```
src/
├── main.ts                 process entry: env, logger, HTTP server, graceful shutdown
├── app.ts                  createApp(deps): middleware, routers, error handling (used by tests)
├── config/env.ts           environment schema (zod); the only place that reads process.env
├── errors/                 AppError and the stable error codes
├── infrastructure/
│   ├── db/                 Drizzle client, schema, migrations, seeds (LI-006)
│   └── server/
│       ├── middleware/     validation (withValidation), errors, auth (later)
│       └── routes/         health and cross-cutting routes
├── modules/<context>/      one folder per bounded context:
│   ├── domain/             entities, value objects, domain errors
│   ├── repo/               Drizzle queries and row <-> domain mappers
│   ├── app/                read and write services; permissions are checked here
│   ├── handlers/           public and admin Express routers
│   └── serializers/        public and admin output shapes
└── utils/                  logger and small helpers
test/                       Vitest + supertest
```

## Conventions

- Public routes are mounted under `/v1/public`, admin routes under `/v1/admin`; modules export routers and `createApp` mounts them.
- Validate every request with `withValidation({ params, query, body }, handler)`; the handler receives the parsed values (Express 5 makes `req.query` read-only).
- Throw `AppError(code, message?, details?)` for expected failures; responses are `{ error: { code, message, details? } }`. Anything else becomes `INTERNAL` without leaking details.
- Lists return `{ data, total, offset, limit }`; single resources return `{ data }`.
- Same TypeScript rules as `packages/shared` (Node type stripping): `.ts` extensions in relative imports, no `enum` / `namespace` / parameter properties, `import type` for types.
- Logs are JSON (pino); authorization and cookie headers are redacted; request bodies are never logged.

## Database

Drizzle ORM (stable 0.x) over node-postgres. Column names are `snake_case` in SQL and `camelCase` in TypeScript (`casing: 'snake_case'` in both `drizzle.config.ts` and the client).

**Add a table**

1. Define it in `src/modules/<context>/repo/<name>.schema.ts` with `pgTable`.
2. Re-export it from `src/infrastructure/db/schema.ts`.
3. `npm run db:generate` (from the repository root) writes a SQL migration to `src/infrastructure/db/migrations/`. Read it before committing; never edit a migration that already ran in a shared environment.
4. `npm run db:migrate` applies pending migrations to `DATABASE_URL`. Tests migrate `TEST_DATABASE_URL` automatically before the suite.

For SQL that drizzle-kit cannot generate (extensions, triggers, data fixes): `npx drizzle-kit generate --custom --name=<what>` and fill in the file.

**Add seed data**

1. Write a module `{ name, run(db) }` in `src/infrastructure/db/seeds/<name>.ts`. It must be idempotent (upsert by a natural key) and fictional apart from reference lists (see the workflow skill, "Development data").
2. Add it to `SEED_MODULES` in `src/infrastructure/db/seeds/index.ts`, after the modules it depends on.
3. `npm run db:seed`. It refuses to run unless `NODE_ENV` is `development` or `test` and the database host is local.

**Tests** use the separate `luxury_test` database: `test/helpers/database.ts` has `connectTestDatabase()` and `resetDatabase()` (truncates all public tables). Test files run one at a time.

## Environment

| Variable | Default | Purpose |
|---|---|---|
| `DATABASE_URL` | required | PostgreSQL connection (see the root `.env.example`) |
| `API_PORT` | `4000` | HTTP port |
| `API_LOG_LEVEL` | `info` | pino level |
| `API_CORS_ORIGINS` | `http://localhost:3000,http://localhost:5173` | Allowed browser origins (web, admin) |

## Catalog reference data (EPIC-03)

| Tables | Purpose |
|---|---|
| `locations`, `translations` | Hierarchy + BG/EN labels (LI-022) |
| `markets`, `property_types`, `transaction_types`, `badges`, `construction_stages`, `listing_statuses` | Admin lists independent of geography (LI-023) |
| `properties` | Listings (ADR-0005 → EPIC-04): dual areas, `listing_status`, `attribute_values`, optional `location_id` / agent (LI-026) |
| `property_price_history`, `property_slug_history` | Append-only price/slug changes + resolve helper (LI-027) |

Labels always go through `translations` (`entity_type` + `entity_id` + `locale` + `field`). Soft archive via `archived_at`. Public catalog only returns `listing_status = published`.

## Staff users (LI-018)

Tables: `users`, `roles`, `permissions`, `role_permissions` (ADR-0006 email + password). Shared permission keys live in `@luxury-investment/shared`.

Local seed creates role templates from ROLE-001 and one demo admin:

| Field | Value |
|---|---|
| Email | `admin@example.com` |
| Password | `DemoAdmin!234` |

Fictional only — never use outside local/test.

### Auth endpoints (LI-019)

| Method | Path | Notes |
|---|---|---|
| POST | `/v1/admin/auth/login` | Sets httpOnly `li_session` cookie |
| POST | `/v1/admin/auth/logout` | Clears session |
| GET | `/v1/admin/auth/me` | Current user + permissions (auth required) |
| GET | `/v1/admin/ping` | Auth smoke check |

### Catalog admin (LI-025)

Requires `catalog:read` / `catalog:write`. Soft archive only (`archived_at`); no hard delete.

| Method | Path | Notes |
|---|---|---|
| GET/POST | `/v1/admin/locations` | List / create (BG+EN `name`) |
| PATCH | `/v1/admin/locations/:id` | Update slug, parent, labels |
| POST | `/v1/admin/locations/:id/archive` | Soft archive |
| GET/POST | `/v1/admin/taxonomies/:kind` | `property_types`, `markets`, … |
| PATCH | `/v1/admin/taxonomies/:kind/:id` | Update key / labels |
| POST | `/v1/admin/taxonomies/:kind/:id/archive` | Soft archive |

### Media (LI-032 / LI-033)

Local disk storage (`MEDIA_LOCAL_ROOT`, ADR-0010). Sharp generates web / thumb / social (1200×630) in-process after upload.

| Method | Path | Notes |
|---|---|---|
| GET | `/v1/public/media/:assetId/:variant` | Public assets only (`web`/`thumb`/`social`/`original`) |
| GET | `/v1/admin/properties/:id/media` | List gallery |
| POST | `/v1/admin/properties/:id/media` | Multipart field `file` |
| PATCH | `/v1/admin/properties/:id/media/:assetId` | Alt, primary, visibility |
| POST | `/v1/admin/media/:assetId/archive` | Soft archive |

### Properties admin (LI-028)

Requires `properties:read` / `properties:write` / `properties:publish`. Drafts are created unpublished; publish fails without `responsibleAgentUserId`.

| Method | Path | Notes |
|---|---|---|
| GET | `/v1/admin/properties` | List (optional `listingStatus`) |
| POST | `/v1/admin/properties` | Create draft |
| GET/PATCH | `/v1/admin/properties/:id` | Read / update |
| POST | `/v1/admin/properties/:id/publish` | Publish |
| POST | `/v1/admin/properties/:id/archive` | Soft archive status |

Env: `AUTH_SESSION_SECRET`, `AUTH_COOKIE_NAME`, `AUTH_SESSION_TTL_HOURS` (see root `.env.example`).

## Scripts

`npm run dev` (watch mode, pretty logs, reads the root `.env`), `npm start`, `npm run typecheck`, `npm test`.
