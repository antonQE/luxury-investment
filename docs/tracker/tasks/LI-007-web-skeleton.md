# LI-007: Public web app skeleton

- Epic: EPIC-01
- Status: Done
- Priority: P1
- Size: M
- Area: web
- Depends on: LI-002, LI-003, LI-005

## Description

Create `apps/web` with Next.js App Router and Tailwind CSS (ADR-0001, ADR-0003), with locale-prefixed routing from day one.

## Acceptance criteria

- [x] Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS v4; server components by default; `src/` layout as in `docs/architecture.md`.
- [x] Locale routing (next-intl, `localePrefix: 'as-needed'`) matching the current site: Bulgarian without a prefix (`/`), English under `/en/`; automatic locale detection **off** (bots and visitors on `/` always get Bulgarian, no cookie or `Accept-Language` redirects); trailing-slash behaviour matches the current site; `<html lang>` matches the locale; messages files for both locales.
- [x] Routing lives in `src/proxy.ts` (Next.js 16 name for middleware).
- [x] A test proves that `/`, `/en/` and a nested English path (e.g. `/en/test/`) return 200 with the right locale (guards against the known `as-needed` + nested path redirect problem).
- [x] Environment config validated with zod, read only through one module; no secrets exposed to the client bundle.
- [x] Typed server-side API client that calls the API (`/health`) and maps errors to the API error format.
- [x] Placeholder home page per locale shows a translated title and the API health status.
- [x] Uses the locale constants from `@luxury-investment/shared` (via `transpilePackages`) in dev and in the production build.
- [x] Unit test setup (Vitest) with one test; lint, type check and build pass.

## Out of scope

- Design tokens, layout, navigation, SEO helpers, redirects (EPIC-06).

## Implementation notes

- Next.js 16.4, React 19.3, Tailwind CSS 4.3 (`@tailwindcss/postcss`), next-intl 4.14; set up by hand (no `create-next-app`, which would add its own lint and format configs).
- Routing: `localePrefix: 'as-needed'`, `localeDetection: false`, `trailingSlash: true` (current site URLs end with `/`), `src/proxy.ts`.
- **`next/root-params`** (Next.js 16.3+): `i18n/request.ts` reads the `[locale]` root param, so pages and layouts do not call the deprecated `setRequestLocale` / `requestLocale` (flagged by `@typescript-eslint/no-deprecated`). `[locale]/layout.tsx` is the root layout; there is no pass-through `app/layout.tsx`.
- `lib/config/env.ts` (zod, `server-only`): `API_URL`, `SITE_URL`. `lib/api/client.ts`: `apiGet<T>()` with `ApiError` mapped from the API error format; `revalidate: false` maps to `cache: 'no-store'` (in Next.js `revalidate: false` means "cache forever", which first made the health check show a stale value).
- `tsconfig.json` sets `allowImportingTsExtensions` because the shared package's source uses `.ts` import paths.
- Vitest inlines `next-intl` (it imports `next/server` without an extension, which only bundlers resolve).
- npm 11.20: `@parcel/watcher` and `@swc/core` (pulled in by next-intl) denied in `allowScripts`; their platform binary packages are installed; `next build` works.

## Result

- Added `apps/web` (config, `src/app/[locale]/{layout,page}.tsx`, `src/i18n/*`, `src/proxy.ts`, `src/lib/*`, messages BG/EN, `test/proxy.test.ts`); `.gitignore` entries for `.next/`, `next-env.d.ts`, `*.tsbuildinfo`.
- Verified on a production build (`next build` + `next start`): `/` → 200 `lang="bg"`; `/en/` → 200 `lang="en"`; nested `/en/test/` → 200 English (temporary page, removed); `/` with `Accept-Language: en` and an `en` locale cookie → 200 Bulgarian (no redirect); `/bg/test/` → redirect to `/test/`; `/en` → `/en/`; unknown path → 404; home shows "API: ok" from the running API.
- 4 unit tests for the proxy; lint, type check (`next typegen` + `tsc`), format pass.
