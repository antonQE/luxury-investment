# LI-052: Expand redirect map from current-site inventory

- Epic: EPIC-17
- Status: Done
- Priority: P1
- Size: M
- Area: web
- Depends on: LI-014, LI-050

## Description

Expand the 301 redirect table in the public web app with known legacy paths from the current-site analysis, keeping the sample rows and structure ready for the full map after import.

## Acceptance criteria

- [x] Additional redirects for known section aliases from the inventory.
- [x] Lookup still returns HTTP 301 via `proxy.ts`; tests cover new samples.
- [x] Document how imported property/article redirects will be generated later.

## Out of scope

- Full auto-generated map from dump (needs LI-051).

## Implementation notes

## Result

- Expanded `redirects.ts` (oferti, agent, novini, taxonomy aliases); tests updated; full map deferred to LI-051.
