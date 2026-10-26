# Luxury Investment

Website and back office for the boutique real-estate agency Luxury Investment: a public site, an internal admin panel and an API, replacing the current site [luxuryinvestment.bg](https://luxuryinvestment.bg/).

## Repository layout

```
apps/
  web/        public site (Next.js, Tailwind CSS)        — created in LI-007
  admin/      admin panel (Vite, React, Chakra UI)       — http://localhost:5173
  api/        API (Express, Drizzle ORM, PostgreSQL)     — created in LI-005
packages/
  shared/     zod schemas, types and constants shared by the apps — created in LI-003
docs/         requirements, architecture, decisions (ADR), task tracker
```

How the parts fit together: [docs/architecture.md](docs/architecture.md). Working agreements for people and AI agents: [AGENTS.md](AGENTS.md). Current work: [docs/tracker/BOARD.md](docs/tracker/BOARD.md).

## Prerequisites

- **Node 26** (pinned in `.nvmrc`) and npm 11 or newer. `npm install` refuses other Node versions (`engine-strict`).
  ```sh
  nvm install && nvm use
  node -v   # must print v26.x
  ```
  If `node -v` still shows another version after `nvm use`, another Node installation (for example Homebrew's) comes earlier in your `PATH`; put nvm first or unlink the other one.
- **Docker** with Compose, for the local PostgreSQL (from LI-004).

## Getting started

```sh
npm install
cp .env.example .env
npm run db:up        # PostgreSQL 18 in Docker on localhost:54329 (databases luxury_dev and luxury_test)
```

| Database script | Purpose |
|---|---|
| `npm run db:up` | Start PostgreSQL and wait until it is healthy |
| `npm run db:down` | Stop it (data is kept in the `postgres-data` volume) |
| `npm run db:reset` | Delete the local volume and start from empty databases |
| `npm run db:migrate` | Apply pending migrations to `DATABASE_URL` |
| `npm run db:seed` | Load development seed data (local databases only) |
| `npm run db:generate` | Generate a migration from schema changes (see `apps/api/README.md`) |

API tests need the database running (`npm run db:up`); they use `luxury_test` and migrate it automatically.

Port 54329 is used so that a PostgreSQL already running on 5432 does not clash.

## Continuous integration

GitHub Actions (`.github/workflows/ci.yml`) runs on every push to `master` and on pull requests: `npm ci`, dependency audit (high+), Prettier check, ESLint, typecheck, tests (with Postgres 18), and production build. The workflow only reports status; it never approves or merges.

## Scripts

Run from the repository root. `dev`, `build`, `typecheck` and `test` run the same-named script in every workspace that defines it; `lint` and `format` run once over the whole repository.

| Script | Purpose |
|---|---|
| `npm run dev` | Start API (`:4000`), web (`:3000`) and admin (`:5173`) |
| `npm run build` | Production build of every app and package |
| `npm run lint` / `npm run lint:fix` | ESLint over the whole repository (one config: `eslint.config.js`), zero warnings allowed |
| `npm run typecheck` | TypeScript type check |
| `npm test` | Unit and integration tests |
| `npm run format` / `npm run format:check` | Prettier (Markdown is excluded on purpose) |
| `npm run db:migrate` / `npm run db:seed` | Apply migrations / seed demo data |
| `npm run db:import-wxr -- --file .data/wxr/….xml [--dry-run]` | Import WordPress WXR export (LI-051); keep dumps under `.data/` (gitignored) |

## Git hooks

Installed automatically by `npm install` (Husky, `prepare` script).

| Hook | Runs |
|---|---|
| `pre-commit` | lint-staged: ESLint `--fix` and Prettier on staged code, Prettier on staged JSON/CSS/YAML, image size limit of 1 MB (`scripts/check-image-size.js`) |
| `commit-msg` | commitlint: Conventional Commits, scopes `web`, `admin`, `api`, `shared`, `infra`, `docs` |
| `pre-push` | `npm run typecheck` and `npm test` |
| `post-merge` | `npm install` when `package-lock.json` changed |

ESLint rules: typescript-eslint strict and stylistic (type-checked) everywhere; React, hooks and accessibility rules in `apps/web` and `apps/admin`; Next.js rules in `apps/web` only.

## Conventions

- TypeScript strict everywhere; apps and packages extend `tsconfig.base.json`.
- Formatting by Prettier (`.prettierrc`), editor settings in `.editorconfig`.
- Commits follow Conventional Commits with an allowed scope and the task ID, e.g. `feat(web): add property page (LI-042)`.
