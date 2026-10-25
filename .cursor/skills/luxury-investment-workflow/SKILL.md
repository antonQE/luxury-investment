---
name: luxury-investment-workflow
description: Project workflow for the luxury-investment real-estate website (public web app + admin panel, single monorepo). Covers requirements intake, tech-risk discussion, ADRs, the internal markdown task tracker (docs/tracker), one-task-at-a-time execution and the Definition of Done. Use for any work in the luxury-investment repo, when the user sends requirements, asks to plan, create, pick up or finish a task, or mentions epics, tickets, the board, ADRs or "jira".
---

# Luxury Investment workflow

Real-estate website built slowly and with quality. One monorepo, web only (no mobile app). The public site and the admin panel are separate apps. Whether there is an own backend app is decided by ADR.

Documentation, tasks, code and commits are in **English**. Talk to the user in **Bulgarian**.

## Golden rules

1. **One task at a time.** Exactly one task is `In Progress`. Do not start the next one until the user approves the current one.
2. **No silent decisions.** Stack, architecture, data model, third-party services and anything costly to reverse are discussed with the user first and recorded as an ADR.
3. **Basic first, details later.** Ship the smallest working version of a feature; split refinements into follow-up tasks instead of growing the current one.
4. **The tracker is the source of truth.** If it is not in `docs/tracker/`, it is not planned. Update it in the same change as the work.
5. **Reuse the reference patterns** from Fantasy_Web / Fantasy_Web_Admin / Newscore_Backend, but not their known weaknesses. See [reference-stack.md](reference-stack.md).
6. **Ask, don't guess.** Ambiguous requirement → write the question in the analysis and ask the user.

## Repository map

```
AGENTS.md                      entry point for agents
.cursor/skills/                this skill
docs/requirements/             raw requirements (verbatim) + analysis
docs/glossary.md               one English term per domain concept
docs/architecture.md           system overview, flows, code layout per app
docs/requirements/traceability.md  spec ID → epic → release
docs/adr/                      architecture decision records
docs/tracker/BOARD.md          status of every epic and task
docs/tracker/epics/            EPIC-##-<slug>.md
docs/tracker/tasks/            LI-###-<slug>.md
apps/                          created by the scaffolding epic (after the stack ADRs)
```

## Phases

### Phase 1: Requirements intake

1. Save the user's requirements **verbatim** to `docs/requirements/NN-<slug>.md` (`NN` = next number), or keep a folder the user uploaded as is. Never edit that text later; corrections go into a new file or the analysis.
2. Register it in the index in `docs/requirements/README.md`.
3. Do not start designing yet.

The current specification is `docs/requirements/Luxury_Investment_Requirements_12_MD/` (start with `00_README.md`). Its requirement IDs (`SRCH-001`, `FLOW-005`, `B-03`, …) are referenced from epics and tasks as their source. Use the terms in `docs/glossary.md`.

### Phase 2: Analysis

Write `docs/requirements/NN-<slug>.analysis.md` using the template in [templates.md](templates.md):

- feature list (grouped by area: public site, admin, backend, infra);
- assumptions;
- open questions for the user;
- technology risks, each with options and a recommendation.

### Phase 3: Discussion

Present the open questions and risks to the user (AskQuestion for discrete choices, at most 1-2 questions at a time). Wait for answers.

### Phase 4: ADRs

For every agreed decision create `docs/adr/NNNN-<slug>.md` (template in [templates.md](templates.md)) and add it to the index in `docs/adr/README.md`. Superseding a decision = new ADR with `Supersedes NNNN`; the old one gets status `Superseded`.

### Phase 5: Decomposition

1. Create epics in `docs/tracker/epics/`. The first epic is always project scaffolding (apps, tooling, CI) once the stack ADRs are accepted.
2. Split each epic into tasks in `docs/tracker/tasks/`. A task:
   - fits in one reviewable change (roughly under 400 changed lines of code, excluding generated files);
   - has testable acceptance criteria;
   - lists dependencies on other tasks.
3. Add everything to `docs/tracker/BOARD.md` with status `Backlog`, and keep `docs/requirements/traceability.md` in sync when a requirement is split differently. Move tasks to `Ready` only when their dependencies are `Done` and nothing is unclear.
4. Show the user the decomposition before executing anything.

### Phase 6: Execution (per task)

```
Task progress:
- [ ] Move task to In Progress in BOARD.md and in the task file
- [ ] Re-read the task, its epic, related ADRs and the relevant parts of docs/architecture.md and the spec files it cites
- [ ] Search the repo for existing code to reuse
- [ ] Short implementation plan (in the task file, "Implementation notes")
- [ ] Implement
- [ ] Verify (see Definition of Done)
- [ ] Fill "Result" in the task file, move to Review
- [ ] Summarize to the user and wait for approval
```

After approval: status `Done`, then propose the next `Ready` task. Never pick a task the user has not agreed to.

If blocked: status `Blocked`, write the reason in the task file and ask the user.

If new work is discovered: create a new task in `Backlog` instead of expanding the current one.

## Tracker conventions

- IDs: epics `EPIC-01`, `EPIC-02`, …; tasks `LI-001`, `LI-002`, … (global sequence, never reused).
- File names: `EPIC-01-project-scaffolding.md`, `LI-007-property-list-page.md`.
- Statuses: `Backlog` → `Ready` → `In Progress` → `Review` → `Done`; plus `Blocked` and `Cancelled`.
- Sizes: `S` (under 2 hours), `M` (half a day), `L` (a day). Anything bigger must be split.
- Priority: `P1` must have for launch, `P2` should have, `P3` nice to have.
- `BOARD.md` and the task file must always show the same status.

## Development data

Until the migration (EPIC-17), the app runs on seed data:

- Every task that adds tables also adds or extends an idempotent seed module, so `db:seed` always gives a usable local app.
- Reference lists may use real taxonomy values from the current site; properties, people, inquiries and articles are fictional and recognisable as such (`Demo` titles, `example.com` emails, `+359 000` phones, placeholder images).
- Seeds never run outside local and test environments, and fictional data never reaches production.

## Git conventions

- Branch per task: `feat/LI-007-property-list-page` (`fix/`, `chore/`, `docs/` as appropriate).
- Conventional Commits with the task ID as scope or footer: `feat(web): add property list page (LI-007)`.
- Never commit secrets or `.env` files. Commit only when the user asks.

## Definition of Done

- [ ] All acceptance criteria are met
- [ ] Type check, lint and format pass for the touched apps
- [ ] Tests added or updated where logic was added (unit for logic, e2e for critical flows)
- [ ] Seed data added or updated for new tables
- [ ] Loading, empty and error states handled for every new data-driven screen
- [ ] All user-visible text goes through i18n
- [ ] No hard-coded secrets, URLs or colors (env config and theme tokens instead)
- [ ] Interactive elements have `data-testid`
- [ ] Docs updated when behaviour, env vars or setup changed
- [ ] Task file "Result" filled and BOARD.md updated

## Additional resources

- Reference stack and patterns (keep / avoid): [reference-stack.md](reference-stack.md)
- Templates for requirement analysis, ADR, epic, task: [templates.md](templates.md)
