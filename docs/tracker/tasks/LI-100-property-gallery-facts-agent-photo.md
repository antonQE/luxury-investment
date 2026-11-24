# LI-100: Property page gallery lightbox, facts under photos, agent photo

- Epic: EPIC-07
- Status: Done
- Priority: P1
- Size: M
- Area: web, api
- Depends on: LI-015

## Description

Owner feedback on the property page: open photos fullscreen; show key characteristics under the gallery (not only in the side column); show the responsible agent’s photo in the right-hand agent block.

## Acceptance criteria

- [x] Clicking a gallery image opens a fullscreen lightbox with prev/next and Escape to close.
- [x] Key facts (bedrooms, bathrooms, primary area, construction stage when present) render in a strip directly under the gallery.
- [x] Side column keeps price / agent / inquiry; agent block shows photo when the team member can be matched.
- [x] Public property payload includes `agentPhotoUrl` (nullable), resolved by normalizing agent phone against public team members.

## Out of scope

- Dedicated yard/plot area field (not in schema yet); attribute-driven feature chips; swipe gestures polish.

## Result

Gallery lightbox; facts strip under photos; agent photo via phone match to `team_members`.
