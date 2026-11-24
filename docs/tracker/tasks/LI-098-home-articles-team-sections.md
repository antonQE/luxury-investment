# LI-098: Home page articles + team sections after listings

- Epic: EPIC-06
- Status: Done
- Priority: P1
- Size: S
- Area: web
- Depends on: none

## Description

Owner feedback: after the newest listings on the home page, continue the scroll with more content — latest articles and a team preview — so the page does not end abruptly at the catalogue.

## Acceptance criteria

- [x] After the newest listings section, the home page shows a short articles strip (latest items) with a link to all articles.
- [x] After articles, a team preview strip with a link to the full team page.
- [x] Sections hide gracefully when the API returns empty / fails (no broken empty chrome).
- [x] Partners carousel (if any) remains below these sections.

## Out of scope

- Dedicated article/team card components reused site-wide; carousels; editorial curation flags.

## Implementation notes

- Fetch via existing `fetchArticles` / `fetchTeam`; slice on the server (e.g. 3 each).
- Copy under `Home.*` in `bg.json` / `en.json`.

## Result

Home scroll order: hero → markets → newest → articles → team → partners.
