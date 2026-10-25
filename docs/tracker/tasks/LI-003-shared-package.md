# LI-003: Shared package skeleton

- Epic: EPIC-01
- Status: Done
- Priority: P1
- Size: S
- Area: shared
- Depends on: LI-001, LI-002

## Description

Create `packages/shared` for zod schemas, types and constants used by the API, the admin and the web app (ADR-0002, ADR-0004), and settle how apps consume it.

## Acceptance criteria

- [x] `packages/shared` with zod as dependency and a documented consumption approach that works for Express (Node ESM), Next.js and Vite without a separate watch step in development.
- [x] First real content: supported locales (`bg`, `en`) and default locale as constants plus a zod schema.
- [x] Vitest configured; a unit test for the locale schema passes; root `npm test` runs it.
- [x] Lint and type check pass.

## Out of scope

- Domain schemas (added by the epics that need them).

## Implementation notes

- Package `@luxury-investment/shared`, **TypeScript source only**: `exports` points to `src/index.ts`; no build, no watch, no `dist`.
- Consumption (documented in `packages/shared/README.md`):
  - API: Node 26 strips types natively. Workspace symlinks resolve to `packages/shared` (outside `node_modules`), where type stripping is allowed. Verified with a throwaway workspace and in this repository by importing the package by name.
  - Next.js: `transpilePackages`; Vite and Vitest: as is. Verification is an acceptance criterion of LI-007 and LI-008, where those apps are created.
- Rules that keep the source runnable everywhere, enforced by `packages/shared/tsconfig.json`: `.ts` extensions in relative imports (`NodeNext` + `allowImportingTsExtensions`), `erasableSyntaxOnly` (no `enum` / `namespace`), `verbatimModuleSyntax` (from the base config).
- zod 4 as an explicit dependency (it was already present transitively through ESLint plugins; relying on that would break silently).
- npm 11.20 asks for approval of install scripts: `fsevents` (optional macOS watcher used by Vitest) is denied in `allowScripts`. It ships a prebuilt binary, so it works without its implicit `node-gyp rebuild`.
- `packages/.gitkeep` removed (the folder is no longer empty).

## Result

- Added: `packages/shared/{package.json,tsconfig.json,README.md}`, `src/locales.ts` (`LOCALES`, `DEFAULT_LOCALE`, `localeSchema`, `Locale`), `src/index.ts`, `src/locales.test.ts`; root `allowScripts`.
- Verified:
  - root `npm test` runs the package tests: 7 passed;
  - root `npm run typecheck`, `npm run lint`, `npm run format:check` pass;
  - Node 26 imports `@luxury-investment/shared` by name without a loader;
  - a temporary file with an `enum` and an extensionless relative import fails the type check with TS1294 and TS2835 (removed afterwards).
- Root `typecheck` and `test` now work, so the `pre-push` hook no longer fails with "No workspaces found".
- Follow-up: LI-005, LI-007 and LI-008 each got an acceptance criterion to verify the package in their app.
