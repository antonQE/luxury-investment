# Templates

Copy the relevant template, replace every `<placeholder>`, delete sections that do not apply.

## Requirement analysis

File: `docs/requirements/NN-<slug>.analysis.md`

```markdown
# Analysis: <requirement title>

Source: [NN-<slug>.md](NN-<slug>.md)
Date: <YYYY-MM-DD>

## Summary
<2-4 sentences: what the user wants and why>

## Features
### Public site
- <feature>
### Admin panel
- <feature>
### Backend / data
- <feature>
### Infrastructure / integrations
- <feature>

## Assumptions
- <assumption we make unless the user says otherwise>

## Open questions
- [ ] Q1: <question>
- [ ] Q2: <question>

## Technology risks
### R1: <risk>
- Why it matters: <impact>
- Options: <A>, <B>, <C>
- Recommendation: <option + one-line reason>
- Decision: <pending | ADR-NNNN>

## Proposed epics
- EPIC-??: <name> (<one line>)
```

## ADR

File: `docs/adr/NNNN-<slug>.md`

```markdown
# NNNN: <decision title>

- Status: Proposed | Accepted | Superseded by NNNN
- Date: <YYYY-MM-DD>
- Related: <requirement analysis, risk ID, tasks>

## Context
<the problem and constraints>

## Options considered
1. <option> — pros / cons
2. <option> — pros / cons

## Decision
<what we chose>

## Consequences
- <positive and negative effects, follow-up tasks>
```

## Epic

File: `docs/tracker/epics/EPIC-##-<slug>.md`

```markdown
# EPIC-##: <name>

- Status: Backlog | In Progress | Done
- Priority: P1 | P2 | P3
- Source: <requirement file / analysis section>

## Goal
<what is true when the epic is done>

## Scope
- In: <items>
- Out: <items explicitly excluded>

## Tasks
- LI-###: <title>

## Notes
<links to ADRs, designs, decisions>
```

## Task

File: `docs/tracker/tasks/LI-###-<slug>.md`

```markdown
# LI-###: <title>

- Epic: EPIC-##
- Status: Backlog | Ready | In Progress | Review | Done | Blocked | Cancelled
- Priority: P1 | P2 | P3
- Size: S | M | L
- Area: web | admin | api | infra | docs
- Depends on: <LI-### or none>

## Description
<what and why, from the user's point of view>

## Acceptance criteria
- [ ] <observable, testable criterion>

## Out of scope
- <what this task deliberately does not do>

## Implementation notes
<filled when the task starts: short plan, files to touch, reused code>

## Result
<filled when the task moves to Review: what changed, how it was verified, follow-up tasks created>
```
