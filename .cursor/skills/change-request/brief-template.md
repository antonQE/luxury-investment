# Change request task template

Copy into `docs/tracker/tasks/LI-###-<slug>.md`. Write in English, except the Bulgarian summary. Delete sections that do not apply. Acceptance criteria must be observable by a person or a test, never "code is clean".

```markdown
# LI-###: <short title from the user's point of view>

- Epic: EPIC-##
- Status: Ready
- Priority: P2
- Size: S | M | L
- Area: web | admin | api | e2e (all that apply)
- Depends on: <LI-### or none>
- Source: [NN-<slug>.md](../../requirements/NN-<slug>.md) (change request, <requester role>, <YYYY-MM-DD>)

## Description

<What the person wants and why, from their point of view. 2-5 sentences.>

## Plain-language summary (BG)

<2-4 lines in Bulgarian, the same text the person confirmed.>

## Acceptance criteria

- [ ] <Who> can <do what> on <which page/menu>, and sees <what>.
- [ ] <Unusual case: no data / wrong input / many items> shows <what>.
- [ ] Texts are available in Bulgarian and English.
- [ ] <Existing behaviour that must not change>.

## Assumptions

- <Assumption stated to the person; mark "(confirmed)" when they agreed explicitly.>

## Out of scope

- <What was discussed but is not part of this task; new tasks if needed later.>

## Handoff

1. `admin` | `web` subagent: implement, following <admin-page | web-page | api-endpoint> skill.
2. `test` subagent: verify every acceptance criterion; add missing tests (unit/component/integration; e2e when it is a user flow).

## Screenshots and links

- <URLs, screenshot paths, examples from other sites>

## Result

(filled after implementation and verification)
```

## Sizing

| Size | Typical change request |
|---|---|
| S | Text, label, order of items, a new column from existing data, small visual fix |
| M | New field end to end (admin input + stored + shown on site), new filter, new small screen |
| L | New section/page with its own data, a new workflow; split if bigger than a day |

## Priority

`P1` only when the person says it blocks work or sales now; otherwise `P2`. Never decide `P1` silently: if unsure, ask once in step 2.
