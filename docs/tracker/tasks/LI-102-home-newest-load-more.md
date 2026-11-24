# LI-102: Home newest listings — extra row + load more

- Epic: EPIC-07
- Status: Done
- Priority: P1
- Size: S
- Area: web
- Depends on: LI-010

## Description

Owner feedback: the home catalogue should use smaller cards, four per row, with a “load more” control after the rows. Listings stay newest → oldest (`publishedAt` desc).

## Acceptance criteria

- [x] Home newest section uses a denser 4-column grid with compact framed cards (border so price/facts stay grouped with the listing).
- [x] Initially loads 8 properties (2 rows × 4); “Load more” fetches the next page (newest-first) until exhausted.
- [x] Button hides when there are no further listings; BG/EN copy for idle, pending and error states.
- [x] API ordering remains `publishedAt` descending (unchanged).

## Out of scope

- Infinite scroll; client-side re-sort; changing the catalogue `/obiavi` pagination UX.

## Result

Client `HomeNewestProperties` on the home page: compact 4-up cards, SSR first page of 8, then browser fetch via `NEXT_PUBLIC_API_URL` for subsequent pages.
