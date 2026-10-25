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

## Non-negotiables

- Work on one task at a time and only on tasks the user agreed to.
- Discuss stack and architecture choices with the user before acting; record them as ADRs.
- Keep the tracker in sync with the work in the same change.
- Basic version first; refinements become new tasks.
- Docs, tasks, code and commits in English; talk to the user in Bulgarian.
- Never commit secrets or `.env` files. Commit only when the user asks.
