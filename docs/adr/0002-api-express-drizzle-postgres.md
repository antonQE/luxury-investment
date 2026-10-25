# 0002: Own API with Express 5, Drizzle ORM, zod and Postgres

- Status: Accepted
- Date: 2026-10-25
- Related: [requirements analysis R2](../requirements/01-luxury-investment-spec.analysis.md#r2-backend-shape-and-orm), ROLE-001, SEC-001, 02, 05

## Context

Both apps need one backend that owns the domain: catalog with admin-defined attributes, CRM, server-side permissions including field-level restrictions, audit log, history of slugs/prices/statuses/measurements, reports and background jobs. The reference backend (Newscore_Backend) has a good layered structure, but uses a pre-release ORM (`@sequelize/core` 7 alpha) and validates requests by hand.

## Options considered

1. Express 5 + Newscore layering + zod + **Drizzle ORM**. SQL-first and typed; full control over JSONB filters, reporting queries and migrations.
2. Same with **Sequelize v6**. Closest to existing code; weaker typing.
3. Same with **Prisma**. Best DX; dynamic JSONB filtering and reporting often fall back to raw SQL.
4. Backend inside Next.js route handlers. Rejected: the admin is a separate app and the domain is too large.
5. Keep Sequelize 7 alpha. Rejected: pre-release dependency for a long-lived product.

## Decision

- `apps/api`: Node (LTS), TypeScript strict, ESM, Express 5.
- Module per bounded context with the Newscore layering: `domain/` → `repo/` (+ mappers) → `app/` (read/write services) → `handlers/` (public and admin) → `serializers/` (separate **public** and **admin** serializers).
- Request validation with zod for params, query and body; schemas shared through a workspace package so the admin forms use the same rules.
- PostgreSQL with **Drizzle ORM**; migrations generated and versioned with drizzle-kit, reviewed before applying, never edited after they run in a shared environment.
- Typed error hierarchy mapped to stable error codes (reference: `Newscore_Backend/src/errors/`).

## Consequences

- Public endpoints return only public projections; exact addresses, owners, internal files and finance never pass through public serializers. This is tested explicitly.
- Permissions are checked in the app/service layer, not only in route middleware, so field-level rules apply to every endpoint and export.
- Drizzle is new to the team: the first module in the foundation epic establishes the repository pattern that later modules copy.
- Integration tests run against a real Postgres, not mocks.

## Review notes

- 2026-10-25 (version check): Drizzle 1.0 is still a release candidate (v1.0.0-rc.5); the stable line is 0.45.x. To stay consistent with rejecting pre-release dependencies, we start on the stable 0.x line and upgrade to 1.0 in a dedicated task once it is final. Drizzle stays isolated in `infrastructure/db` and `modules/*/repo`, which keeps that upgrade small. The decision is unchanged.
