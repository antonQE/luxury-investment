# LI-001: Monorepo root and workspace conventions

- Epic: EPIC-01
- Status: Done
- Priority: P1
- Size: S
- Area: infra
- Depends on: none

## Description

Create the root of the npm workspaces monorepo so every later task has a fixed place and shared base configuration (ADR-0004).

## Acceptance criteria

- [x] Root `package.json` (private) declares workspaces `apps/*` and `packages/*`, `engines` for Node and npm, and placeholder scripts `dev`, `build`, `lint`, `typecheck`, `test`, `format`, `format:check` that run across workspaces.
- [x] `.nvmrc` pins Node 26 (Active LTS from 2026-10-28, EOL 2029-04-30); `engines` requires `>=26`; `.npmrc` sets `engine-strict=true`.
- [x] `.editorconfig` and Prettier config (`singleQuote`, `trailingComma: all`, `printWidth: 100`, as in Fantasy_Web) with `.prettierignore`.
- [x] `tsconfig.base.json` with strict settings (`strict`, `noUnusedLocals`, `noUnusedParameters`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`) that apps and packages extend.
- [x] Empty `apps/` and `packages/` folders are tracked.
- [x] Root `README.md`: what the project is, repository layout, prerequisites, how to install; links to `AGENTS.md` and `docs/`.
- [x] `npm install` and `npm run format:check` succeed on a clean clone.

## Out of scope

- ESLint and Git hooks (LI-002); any app code.

## Implementation notes

- Port `.prettierrc` and `.editorconfig` from Fantasy_Web; `.npmrc` keeps `engine-strict` and `audit-level`.
- Root devDependencies only for tools every workspace shares: Prettier and TypeScript.
- **TypeScript 6, not 7**: TS 7.0 (native compiler) has no JavaScript API yet, so typescript-eslint cannot run on it (typescript-eslint issue #12518). Switch when TS 7.1 ships its API.
- Markdown is excluded from Prettier: docs are hand-maintained and `docs/requirements` holds verbatim client input.
- `tsconfig.base.json` contains only target, module detection and strictness; module resolution, `lib` (DOM), JSX and emit are set per app.

## Result

- Added: `package.json` (workspaces `apps/*`, `packages/*`; engines Node >=26, npm >=11; root scripts), `package-lock.json`, `.nvmrc` (26), `.npmrc`, `.editorconfig`, `.prettierrc`, `.prettierignore`, `tsconfig.base.json`, `apps/.gitkeep`, `packages/.gitkeep`, `README.md`.
- Verified:
  - `npm ci` and `npm run format:check` pass on a clean copy of the repository (Node 26.12.1, npm 11.20.0);
  - Node 24 is rejected by `npm install` (`EBADENGINE`);
  - a test project extending `tsconfig.base.json` compiles with TypeScript 6.0.3 and all strict options.
- Known and expected: `npm run build` / `test` / `lint` / `typecheck` / `dev` end with "No workspaces found" until LI-003 creates the first workspace. `npm run dev` will be replaced by a parallel runner in LI-008.
- Local environment note: on this machine Homebrew's Node 24 is earlier in `PATH` than nvm, so `nvm use` alone does not switch the version (documented in the README).
- Follow-up tasks: none.
