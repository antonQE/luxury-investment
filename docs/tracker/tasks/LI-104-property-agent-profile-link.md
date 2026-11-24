# LI-104: Clickable agent on property page

- Epic: EPIC-07
- Status: Done
- Priority: P1
- Size: S
- Area: api, web, shared
- Depends on: LI-103

## Description

Owner feedback: where a listing shows the responsible broker, the name should link to that agent’s public profile so visitors can see all of their properties.

## Acceptance criteria

- [x] Public property payload includes nullable `agentSlug` when the listing agent matches a public team member by phone.
- [x] Property page agent block: name (and photo) link to `/ekip/[slug]` when a match exists; plain text otherwise.
- [x] Mobile agent bar name also links when a slug is present.
- [x] Matching uses the same phone normalization as agent photo / listings.

## Out of scope

- Linking agent names on search cards; changing admin responsible-agent assignment.

## Result

`TeamPublicService.findPublicByPhone` feeds `agentSlug` + `agentPhotoUrl` on property detail; UI links to the agent profile (which lists their properties via LI-103).
