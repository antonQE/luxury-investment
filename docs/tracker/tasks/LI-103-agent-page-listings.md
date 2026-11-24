# LI-103: Agent page listings

- Epic: EPIC-08
- Status: Done
- Priority: P1
- Size: S
- Area: api, web, shared
- Depends on: LI-037, LI-010

## Description

Owner feedback: each broker/agent public profile (`/ekip/[slug]`) should list that person’s published properties underneath.

## Acceptance criteria

- [x] Public properties list accepts an `agentPhone` filter (digit-normalized suffix match, same idea as agent photo).
- [x] Team member page shows a “Properties” section with that agent’s published listings (newest first).
- [x] Section shows an empty state when there is no phone / no matching listings; error state if the catalogue call fails.
- [x] BG/EN copy for the section heading and empty/error states.

## Out of scope

- Hard FK `properties.teamMemberId`; changing how admin assigns the responsible agent; pagination beyond the first 24 on the profile.

## Implementation notes

- Extended `propertyListQuerySchema` + `PropertyRepo.filters` with `agentPhone`.
- `/ekip/[slug]` fetches via `fetchProperties({ agentPhone })` and reuses `PropertyGrid`.
- Demo seeds: Ivanova / Petrov phones aligned with `team.ts` so local profiles show listings.

## Result

Agent profiles list matching published properties by phone; unit + public properties integration tests cover the filter.
