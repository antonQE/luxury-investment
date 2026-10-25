# EPIC-01: Project foundation

- Status: In Progress
- Priority: P1
- Source: [ADR-0001](../../adr/0001-public-web-nextjs-admin-vite.md), [ADR-0002](../../adr/0002-api-express-drizzle-postgres.md), [ADR-0003](../../adr/0003-ui-tailwind-web-chakra-admin.md), [ADR-0004](../../adr/0004-monorepo-local-first-hosting-deferred.md)

## Goal

A clean clone runs `npm install`, starts Postgres with Docker Compose and starts the API, the public site and the admin panel locally. All three are empty but wired: they pass lint, type check and tests, and the web and admin apps can reach the API.

## Scope

- In: npm workspaces, shared tooling (TypeScript, ESLint, Prettier, commitlint, Husky), `packages/shared`, Docker Compose Postgres, API skeleton with Drizzle, web skeleton (Next.js, Tailwind, BG/EN routing), admin skeleton (Vite, Chakra), developer README, CI once a remote exists.
- Out: authentication (EPIC-02), any domain tables (EPIC-03 onwards), design system and real pages (EPIC-06), hosting and deployment (separate ADR).

## Tasks

- LI-001: Monorepo root and workspace conventions
- LI-002: Lint, format and Git hooks
- LI-003: Shared package skeleton
- LI-004: Local Postgres with Docker Compose
- LI-005: API skeleton
- LI-006: Database layer with Drizzle
- LI-007: Public web app skeleton
- LI-008: Admin app skeleton
- LI-009: CI pipeline

## Notes

Port tooling from Fantasy_Web (`eslint.config.js`, `commitlint.config.js`, `.husky/`) and app-shell code from Fantasy_Web_Admin (`src/api/HttpClient.ts`, `src/components/Layout`). See `.cursor/skills/luxury-investment-workflow/reference-stack.md`.
