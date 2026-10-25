# LI-004: Local Postgres with Docker Compose

- Epic: EPIC-01
- Status: Done
- Priority: P1
- Size: S
- Area: infra
- Depends on: LI-001

## Description

A local Postgres for development and a separate database for integration tests, started with one command (ADR-0004).

## Acceptance criteria

- [x] `docker-compose.yml` with a pinned Postgres version, a named volume, a health check and a non-default host port.
- [x] Two databases created on first start: development and test.
- [x] `.env.example` at the root with the connection URLs and placeholder values only.
- [x] Root scripts `db:up`, `db:down`, `db:reset` (reset asks for no confirmation only for the local volume).
- [x] README section on starting the database.

## Out of scope

- Extensions and migrations (LI-006).

## Implementation notes

- `postgres:18.6-alpine`; host port **54329** because a Homebrew PostgreSQL already listens on 5432 on the development machine.
- PostgreSQL 18 images keep data under `/var/lib/postgresql` (version subfolder), so the volume is mounted there.
- `infra/postgres/init/01-create-test-database.sql` creates `luxury_test` on first start; `luxury_dev` comes from `POSTGRES_DB`.
- Scripts: `db:up` (`docker compose up -d --wait`), `db:down`, `db:reset` (drops the local volume).

## Result

- Added `docker-compose.yml`, `infra/postgres/init/01-create-test-database.sql`, `.env.example`, root scripts and a README section.
- Verified: `db:up` reaches healthy; both databases exist and accept connections on `localhost:54329`; `db:reset` recreates them from empty.
- Docker Desktop was not running on the development machine and was started.
