# LI-006: Database layer with Drizzle

- Epic: EPIC-01
- Status: Done
- Priority: P1
- Size: M
- Area: api
- Depends on: LI-004, LI-005

## Description

Connect the API to Postgres with Drizzle ORM and establish the migration workflow all later schema changes use (ADR-0002).

## Acceptance criteria

- [x] Drizzle ORM and drizzle-kit on the latest **stable** 0.x line (1.0 is still a release candidate; upgrading is a separate task once it is final). Drizzle imports stay inside `infrastructure/db` and `modules/*/repo`.
- [x] Drizzle connection with a pool configured from env; graceful shutdown closes it.
- [x] drizzle-kit config; scripts `db:generate`, `db:migrate`; generated SQL migrations committed and reviewed.
- [x] First migration enables `pg_trgm` and `unaccent`.
- [x] `GET /health` reports database reachability.
- [x] Integration test setup against the test database: migrations run before the suite, each test isolated; one test proves the connection and extensions.
- [x] Seed infrastructure: `db:seed` runs idempotent seed modules in a defined order; it refuses to run unless the environment is local or test.
- [x] `apps/api/README.md` explains how to add a table, a migration and a seed module.

## Out of scope

- Domain tables (EPIC-02 onwards).

## Implementation notes

- drizzle-orm 0.45.4 + drizzle-kit 0.31.11 (stable lines), driver `pg` 8 (node-postgres); `casing: 'snake_case'`.
- `connectDatabase(url)` returns `{ db, ping, close }`; `main.ts` registers `ping` as the `database` health check and closes the pool on shutdown.
- Migrations live in `src/infrastructure/db/migrations/` and are applied by `runMigrations()` (drizzle migrator), used by `npm run db:migrate` and by the Vitest global setup on `luxury_test`. `0000_enable-extensions.sql` is a custom migration (`pg_trgm`, `unaccent`).
- Seeds: `SEED_MODULES` (empty until the catalog tasks), `runSeeds()`, `assertSeedAllowed()` (NODE_ENV development/test and a local host only).
- Tests: `fileParallelism: false`; helpers `connectTestDatabase()` and `resetDatabase()`.
- `DATABASE_URL` is required in the API env schema; the root `.env` was created locally from `.env.example` (not committed).
- npm 11.20: `esbuild` postinstall (pulled in by drizzle-kit and Vitest) denied in `allowScripts`; the platform binary package `@esbuild/darwin-arm64` works without it (verified).

## Result

- Verified: `db:migrate` applies and is idempotent; `db:seed` runs with zero modules and refuses `NODE_ENV=production`; 13 API tests pass (5 new: connection, extensions present, `/health` reports the database up, seed guard allows local dev/test and refuses production/remote); type check, lint, format pass; a real server answers `/health` with `"database":"up"`.
