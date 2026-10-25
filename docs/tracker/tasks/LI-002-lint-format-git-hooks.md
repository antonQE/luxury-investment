# LI-002: Lint, format and Git hooks

- Epic: EPIC-01
- Status: Done
- Priority: P1
- Size: M
- Area: infra
- Depends on: LI-001

## Description

One ESLint flat config and the Git hook setup shared by all workspaces, ported from Fantasy_Web, so quality rules apply from the first line of app code.

## Acceptance criteria

- [x] Root ESLint flat config: typescript-eslint `strictTypeChecked` + `stylisticTypeChecked`, simple-import-sort, unused-imports, prettier compatibility; React rules (react-x, react-dom, react-hooks, jsx-a11y) applied to `apps/web` and `apps/admin` only; Next.js rules applied to `apps/web` only.
- [x] commitlint with Conventional Commits; scopes allowed: `web`, `admin`, `api`, `shared`, `infra`, `docs`.
- [x] Husky: `pre-commit` runs lint-staged (ESLint + Prettier on staged files); `commit-msg` runs commitlint; `pre-push` runs type check and unit tests.
- [x] Image size check (max 1 MB) on staged images, ported from `Fantasy_Web/scripts/checkImageSize.js`.
- [x] `npm run lint` passes on the repository; a commit with a non-conventional message is rejected.

## Out of scope

- Stylelint (Tailwind and Chakra make it unnecessary for now); CI (LI-009).

## Implementation notes

- **ESLint 10**, not 9: ESLint 9 reached end-of-life on 2026-08-06.
- **`eslint-plugin-jsx-a11y-x`** (maintained es-tooling fork) instead of `eslint-plugin-jsx-a11y`: the original has not been released since 2024 and does not support ESLint 10. Fantasy_Web_Admin works around that with `--legacy-peer-deps`, which we do not copy.
- One root config, one ESLint run over the repository (`npm run lint` = `eslint . --max-warnings 0`), instead of per-workspace lint scripts. Type information comes from `parserOptions.projectService`, so each workspace's own `tsconfig.json` is used automatically.
- JavaScript files (configs, `scripts/`) are linted without type information (`disableTypeChecked`) and with Node globals.
- `eslint-config-prettier` only turns off conflicting rules; Prettier runs as its own step (lint-staged, `format:check`) instead of through `eslint-plugin-prettier` as in Fantasy_Web. Faster, and errors are reported by the tool that owns them.
- `@typescript-eslint/no-unused-vars` is off in favour of `unused-imports/no-unused-vars` (same options as Fantasy_Web, but `error`), so unused code is reported once.
- React plugins: `react-x` `recommended-type-checked`, `react-dom` `recommended`, `react-hooks` flat `recommended`, `jsx-a11y-x` `recommended`. Next.js: `core-web-vitals` with `rootDir: apps/web/`.
- commitlint uses the default Conventional Commits rules plus the scope list.
- Added a `post-merge` hook (as in Fantasy_Web) that runs `npm install` when the lockfile changed.

## Result

- Added: `eslint.config.js`, `commitlint.config.js`, `lint-staged.config.js`, `scripts/check-image-size.js`, `.husky/{pre-commit,commit-msg,pre-push,post-merge}`; root scripts `lint`, `lint:fix`, `prepare`; README sections "Scripts" and "Git hooks".
- Verified:
  - `npm run lint`, `npm run format:check` pass; `npm audit` finds 0 vulnerabilities; no peer dependency conflicts.
  - Rule scoping, with temporary probe files (removed afterwards): `@next/next/*` fires only in `apps/web`; `jsx-a11y-x/*` in `apps/web` and `apps/admin`; files in `packages/` get only the TypeScript and import rules; type-aware rules (e.g. `no-floating-promises`) fire everywhere.
  - Hooks, in a throwaway copy of the repository (no commits in this repository): a non-conventional message and an unknown scope are rejected; a valid message passes; a 1.5 MB image is rejected and a small one passes; fixable issues (import order, quotes) are fixed and committed; an unfixable error (`no-debugger`) blocks the commit and restores the files.
  - The hook tools support Node 22+, so hooks also run if Homebrew's Node 24 is first in `PATH`.
- Known and expected: `pre-push` fails with "No workspaces found" until LI-003 creates the first workspace (there is no remote yet, so nothing is pushed).
- Follow-up tasks: none.
