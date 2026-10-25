# LI-008: Admin app skeleton

- Epic: EPIC-01
- Status: Done
- Priority: P1
- Size: M
- Area: admin
- Depends on: LI-002, LI-003, LI-005

## Description

Create `apps/admin` as a Vite SPA with Chakra UI v3, porting the app shell and API layer patterns from Fantasy_Web_Admin (ADR-0001, ADR-0003).

## Acceptance criteria

- [x] Vite, React 19, TypeScript strict, Chakra UI v3 with semantic tokens, React Router 7, TanStack Query.
- [x] i18next with `bg` (default) and `en`; all visible strings through `t()`.
- [x] `HttpClient` + `ApiError` ported from `Fantasy_Web_Admin/src/api/HttpClient.ts` without auth parts (auth comes in EPIC-02); QueryClient defaults: no retry on 4xx; a query-key factory pattern with one example.
- [x] App shell: layout with sidebar and header placeholders, not-found page, error boundary, route constants; lazy pages imported per module (not through a barrel).
- [x] A page shows the API health status through a query hook.
- [x] Root `npm run dev` starts `api`, `web` and `admin` together.
- [x] Uses the locale constants from `@luxury-investment/shared` in dev and in the production build.
- [x] Vitest with one test; lint, type check and build pass.

## Out of scope

- Login and permissions (EPIC-02); list page building blocks (ported when the first list page is built).

## Implementation notes

- Vite + React 19 + Chakra UI v3 + React Router 7 + TanStack Query, patterns from Fantasy_Web_Admin without auth.
- `HttpClient` / `ApiError` without Bearer refresh; health page hits `GET /health`.
- i18next with `bg` default and `en`; locales from `@luxury-investment/shared`.
- Layout: sidebar + header placeholders; Dashboard shows API health via query-key factory.

## Result

Added `apps/admin` (Vite 7, React 19, Chakra UI v3, React Router 7, TanStack Query, i18next BG/EN).

- API layer: `HttpClient` + `ApiError` (no auth), `healthKeys` factory, `useHealthQuery`.
- Shell: sidebar + header, Dashboard with live `/health`, NotFound, ErrorBoundary; lazy page imports.
- `@vitejs/plugin-react` pinned to `5.1.2` (compatible with Vite 7; newer 5.2 peers Vite 8).
- Verified at http://localhost:5173/dashboard: status ok, database up; lint, typecheck, test and production build pass.
