# Reference stack and patterns

Baseline taken from three local reference projects. Treat it as the **default** for luxury-investment; an accepted ADR in `docs/adr/` overrides anything here. Already overridden: public site is Next.js + Tailwind (ADR-0001, ADR-0003), ORM is Drizzle (ADR-0002), hosting is deferred (ADR-0004). The frontend structure below applies to `apps/admin`; the `apps/web` and `apps/api` layouts are in `docs/architecture.md`.

| Project | Path | What it is |
|---|---|---|
| Fantasy_Web | `/Users/antonkolev/Fantasy_Web` | Public client SPA |
| Fantasy_Web_Admin | `/Users/antonkolev/Fantasy_Web_Admin` | Admin panel SPA |
| Newscore_Backend | `/Users/antonkolev/Newscore_Backend` | REST backend used by both |

Read the referenced files before implementing the equivalent here. Copy the idea, adapt names and remove project-specific code (fantasy/game logic, React Native WebView bridge, Farsi defaults, Firebase project IDs, hard-coded emails).

## Reference stack

**Frontend (both apps):** React 19, TypeScript strict (`noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`), Vite, React Router 7, Chakra UI v3 + semantic tokens, TanStack Query v5, axios, i18next, Firebase Auth, Sentry, dayjs, Vitest + Testing Library, Playwright, Node 22 (`.nvmrc`), npm.

**Backend:** Express 5, TypeScript, ESM, Postgres, Umzug migrations, Firebase Admin token verification, Redis cache, GCS storage, Cloud Run.

**Tooling:** ESLint flat config (`strictTypeChecked` + `stylisticTypeChecked`, react-x, react-dom, jsx-a11y, react-hooks, simple-import-sort, unused-imports, prettier), Prettier (`singleQuote`, `trailingComma: all`, `printWidth: 100`), Stylelint, Husky + lint-staged, commitlint (Conventional Commits), standard-version, Dependabot.

## Patterns to keep

### Frontend structure

```
src/
├── api/            HttpClient.ts, clients.ts, endpoints/<resource>.ts
├── assets/         icons/ (svgr + barrel), images/, fonts/
├── components/     shared UI grouped by domain: ui/, layout/, guards/, <domain>/
├── config/         env.ts (only place that reads import.meta.env), i18n, pagination
├── constants/      navigation/ (Route enum), domain/, ui/, common/
├── contexts/       Provider + useXContext pairs for cross-route state only
├── hooks/          common/ (API hooks), ui/
├── i18n/           locales/<lang>.json
├── pages/<feature>/<PageName>/PageName.tsx (+ components/, hooks/, constants.ts)
├── services/       firebase, auth, monitoring
├── theme/          palette → semantic tokens → system
├── types/          common/ (api envelopes), domain/ (backend entities), feature/ (view models), ui/
└── utils/          common/, domain/
```

- Component = PascalCase folder + same-name `.tsx` + `index.ts` barrel. Props typed with `interface XProps`.
- `@/` alias for cross-layer imports; no deep `../../../`.
- Page-only components and hooks live next to the page; move to `components/` only when reused.

### API layer

- `HttpClient` class around axios: attaches Bearer token, refreshes the token once on 401 (deduplicated), normalizes errors into `ApiError`, logs and reports to Sentry. See `Fantasy_Web_Admin/src/api/HttpClient.ts` and `Fantasy_Web/src/api/HttpClient.ts`.
- Thin, typed endpoint functions per resource. See `Fantasy_Web/src/api/endpoints/leagues.ts`.
- Envelopes `ApiResponse<T>`, `PaginatedResponse<T>` (`{ data, total, offset, limit }`). See `Fantasy_Web/src/types/common/api.ts`.
- `useApiQuery` / `useApiMutation` wrappers that surface errors as a toast. See `Fantasy_Web/src/hooks/common/useApiQuery.ts`.
- QueryClient: no retry on 4xx, exponential retry on 5xx.

### App shell and admin building blocks

- `Route` enum for every path: `Fantasy_Web/src/constants/navigation/routes.ts`.
- Guard components rendering `<Outlet />`: `Fantasy_Web/src/components/guards/`, `Fantasy_Web_Admin/src/components/ProtectedLayout`.
- Admin list page recipe: filters + debounced search (300 ms) + sort + server pagination, `ListPageLayout` / `ListPageHeader` / `ListPageTable` / `Pagination`, `RowActionMenu`, `ConfirmModal` for destructive actions. See `Fantasy_Web_Admin/src/components/` and `Fantasy_Web_Admin/src/pages/Users/Users.tsx`.
- Role map `ROLE_ACCESS` + `useRoleAccess().can(permission)`: `Fantasy_Web_Admin/src/constants/roles.ts`, `Fantasy_Web_Admin/src/hooks/useRoleAccess.ts`.
- Toasts through a `ToastContext`: `Fantasy_Web_Admin/src/contexts/ToastContext.tsx`.

### Quality and delivery

- Husky hooks: pre-commit (lint-staged, `tsc`, image size max 1 MB via `scripts/checkImageSize.js`), commit-msg (commitlint), pre-push (`npm audit`, depcheck, unit tests), post-merge (`npm install` when the lockfile changed). See `Fantasy_Web/.husky/`.
- CI: audit, depcheck, prettier, eslint, stylelint, `tsc`, unit tests, build. See `Fantasy_Web/.github/workflows/ci.yml`.
- Stale-deploy guard: emitted `version.json` + reload on chunk load error. See `Fantasy_Web/scripts/vite-plugin-emit-version.ts`, `Fantasy_Web/src/utils/common/deployVersionCheck.ts`.
- Playwright Page Object Model: `*.elements.ts` (frozen `data-testid` map) + `*.page.ts` (actions), single login stored as storage state. See `Fantasy_Web_Admin/src/test/` and `Fantasy_Web_Admin/.cursor/rules/e2e-data-testids.mdc`.
- `data-testid`: kebab-case, feature-scoped (`properties-table-row-${id}`, `properties-filter-city-input`).

### Backend

- Module per bounded context, layered: `domain/` (entities, domain errors) → `repo/` (+ `dto/` mappers model ↔ domain) → `app/` (read and write services + factory) → `handlers/` (public and admin) → `serializers/`. See `Newscore_Backend/src/fantasy/player/`.
- Generic paginated list handler: `Newscore_Backend/src/utils/handlers/GetPageHandler.ts`.
- Typed error hierarchy mapped to stable error codes: `Newscore_Backend/src/errors/`.
- Auth middleware (verify Firebase ID token) + role middleware: `Newscore_Backend/src/infrastructure/server/middleware/`.
- Dated migration files with `up` / `down` in a transaction, run by Umzug: `Newscore_Backend/scripts/db/migrator.ts`.

## Known weaknesses: do NOT copy

| Weakness in reference | Do instead |
|---|---|
| Public site is a client-only SPA, no SEO | Server-rendered public pages with per-page metadata, Open Graph, JSON-LD, sitemap, robots (decided by ADR) |
| Hand-written forms with `useState` per field, no schema | react-hook-form + zod; share schemas with the backend where possible |
| Inline, ad-hoc query keys | Query-key factory per resource (`propertyKeys.list(filters)`) + per-resource hooks (`usePropertiesQuery`) |
| `onSuccess` side effects inside `queryFn`; background polling every 5 minutes | Side effects in components/mutations; polling only where data is live |
| Roles enforced only in the client | Enforce permissions on the server; the client only hides UI |
| 400-1000 line page and context files | Split into components and hooks; keep files focused (target under 250 lines) |
| Mock or UI-only pages shipped as features | No `DUMMY_*` data in production code; unfinished work stays in the tracker |
| `lazy(() => import('@/pages'))` through the pages barrel | Import each page module directly so chunks actually split |
| Long repeated inline Chakra prop lists | Chakra recipes / slot recipes for reusable variants |
| Pre-release ORM (Sequelize v7 alpha), undeclared transitive deps | Stable ORM chosen by ADR; every import declared in `package.json` |
| No request validation in handlers (manual casts) | Schema validation middleware (zod) for params, query and body |
| Rendering API HTML without sanitizing | Sanitize (DOMPurify) any rich text before rendering |
| Obfuscated inline third-party scripts in `index.html` | Env-gated, readable loaders compatible with a strict CSP |
| Token in localStorage, dev logger printing auth headers | Prefer SDK-managed tokens; never log credentials |
| Secrets and sample credentials in README | Only `.env.example` with placeholders |
| `.cursor/` git-ignored, stale and duplicated docs | `.cursor/` and docs are committed; one source of truth per topic |
| Near-zero unit tests | Unit tests for domain logic, utils and hooks from the start |
| CI that auto-approves PRs | CI reports status only; humans approve |
