# QA: how we test

Hybrid strategy (EPIC-19): every critical happy path has an automated test; Vitest coverage gate applies only to `apps/api`. Admin/web get targeted component tests for high-risk UI, not a page-by-page coverage chase.

## What is covered

| Layer | Scope |
|---|---|
| API integration (`apps/api`) | HTTP happy paths for admin/public modules; CI coverage gate |
| Playwright (`apps/e2e`) | Public smoke + admin CRM (contacts, viewings, deals) + Tasks/Analytics/Documents |
| Component/unit | Analytics beacons + session helpers (web); Deals agent + Team languages + Tasks nav (admin) |
| Site Insights | Overview API from daily rollups; admin KPI strip e2e |

Out of scope for this gate: visual regression, a11y suite, load/perf, 80% line coverage of every React page.

## Commands

```bash
# Unit + integration (all workspaces that define `test`)
npm test

# API coverage gate (lines ≥75%, branches ≥55%)
npm run test:coverage -w @luxury-investment/api

# Playwright (starts API/web/admin unless already running)
npm run test:e2e

# Reuse local dev servers (API :4000, web :3000, admin :5173)
E2E_REUSE_SERVER=1 npm run test:e2e
```

CI runs lint, typecheck, `npm test`, API `test:coverage`, and e2e (see `.github/workflows/ci.yml`).

## Local tips

- Postgres must be up (`npm run db:up`) before API tests or e2e.
- Coverage uses `maxWorkers: 1` to avoid Postgres deadlocks under instrumentation.
- Admin e2e depends on `auth.setup.ts` and seed users; run `npm run db:seed` if login fails.
