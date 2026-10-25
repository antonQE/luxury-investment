# 0004: npm workspaces monorepo, local-first development, hosting deferred

- Status: Accepted
- Date: 2026-10-25
- Related: [requirements analysis R8](../requirements/01-luxury-investment-spec.analysis.md#r8-hosting), [ADR-0001](0001-public-web-nextjs-admin-vite.md), [ADR-0002](0002-api-express-drizzle-postgres.md)

## Context

The product is web only: a public site, an admin panel and an API. The team wants the simplest hosting possible and prefers to choose it later. Development must not depend on cloud accounts.

## Decision

- **One repository, npm workspaces** (npm as in the reference projects):
  ```
  apps/web        Next.js public site
  apps/admin      Vite admin SPA
  apps/api        Express API
  packages/shared zod schemas, types, constants (permissions, enums) shared by all apps
  ```
  More packages are added only when code is actually shared by two apps.
- **Local-first**: everything runs on a developer machine with Node (LTS, pinned in `.nvmrc`) and Docker Compose for Postgres. No cloud service is required to develop or run tests.
- **Hosting is deferred.** Until it is chosen, every app must stay portable:
  - `web` and `api` run as plain Node processes and can be packaged as containers;
  - `admin` builds to static files;
  - configuration only through environment variables validated at startup;
  - file storage only through a storage interface (local filesystem adapter first; a cloud adapter is added when hosting is chosen);
  - no provider-specific SDKs in domain code.

## Consequences

- Hosting gets its own ADR before the first deployment; the analysis lists GCP (Cloud Run) and Vercel as candidates, and a single VPS with Docker Compose is also possible thanks to the constraints above.
- CI can be added once the repository has a remote; until then the same checks run locally through npm scripts and Git hooks.
- Background jobs, media storage and authentication providers must be chosen with the same portability rule in mind.
