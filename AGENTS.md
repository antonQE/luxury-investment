# Luxury Investment: agent instructions

Real-estate website: a public web app (Next.js + Tailwind), an admin panel (Vite + Chakra UI) and an API (Express + Drizzle + Postgres) in one npm workspaces monorepo. Web only, no mobile app. Release 1 replaces the current site luxuryinvestment.bg.

## Start here

1. Read the workflow skill: [.cursor/skills/luxury-investment-workflow/SKILL.md](.cursor/skills/luxury-investment-workflow/SKILL.md).
2. Check the board: [docs/tracker/BOARD.md](docs/tracker/BOARD.md).
3. Read how the system fits together: [docs/architecture.md](docs/architecture.md).
4. Check accepted and pending decisions: [docs/adr/README.md](docs/adr/README.md).

## Where things live

| Concern | Location |
|---|---|
| Raw requirements (verbatim) and analysis | `docs/requirements/` |
| Domain terms (one English name per concept) | `docs/glossary.md` |
| Requirement ID → epic → release | `docs/requirements/traceability.md` |
| System overview, flows, code layout per app | `docs/architecture.md` |
| Architecture decisions | `docs/adr/` |
| Epics, tasks and their status | `docs/tracker/` |
| Reference stack and patterns (keep / avoid) | `.cursor/skills/luxury-investment-workflow/reference-stack.md` |
| Templates (analysis, ADR, epic, task) | `.cursor/skills/luxury-investment-workflow/templates.md` |

## Specialist agents, skills and hooks

| Kind | Name | Use for |
|---|---|---|
| Subagent | `web` (`.cursor/agents/web.md`) | Public site `apps/web` |
| Subagent | `admin` (`.cursor/agents/admin.md`) | Admin panel `apps/admin` |
| Subagent | `test` (`.cursor/agents/test.md`) | Adding missing tests, running suites, verifying a finished task |
| Subagent | `product-analyst` (`.cursor/agents/product-analyst.md`) | Read-only: maps a plain-language request to apps, screens and current behaviour |
| Skill | `change-request` | Non-developer describes a change: short interview, task files, handoff to `admin`/`web` then `test` |
| Skill | `admin-page`, `web-page` | Recipe for a new admin screen / public page |
| Skill | `api-endpoint` | Shared Zod schema, migration, seed, handler, integration test |
| Skill | `e2e-test` | Playwright specs, page objects, debugging e2e failures |
| Rules | `.cursor/rules/*.mdc` | Conventions loaded when web, admin or test files are in context |

Delegate app work to `web` or `admin`, then ask `test` to verify against the task's acceptance criteria.

When someone who is not a developer describes a change in plain words (or types `/change-request`), follow the `change-request` skill instead of starting to code.

Project hooks (`.cursor/hooks.json`):

- After every agent edit: Prettier formats the file, and its path is recorded.
- When the agent finishes a turn that edited files: Prettier check, ESLint and typecheck run for the touched workspaces. On failure the agent gets the output and must fix it (at most 2 automatic retries).
- `git commit` / `git push` from the agent always ask the user for approval.

## Non-negotiables

- Work on one task at a time and only on tasks the user agreed to.
- Discuss stack and architecture choices with the user before acting; record them as ADRs.
- Keep the tracker in sync with the work in the same change.
- Basic version first; refinements become new tasks.
- Docs, tasks, code and commits in English; talk to the user in Bulgarian.
- Never commit secrets or `.env` files. Commit only when the user asks.
