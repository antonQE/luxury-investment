# LI-124: Show broker on admin properties list

- Epic: EPIC-04
- Status: Review
- Priority: P2
- Size: S
- Area: admin
- Depends on: none
- Source: [04-admin-properties-list-broker.md](../../requirements/04-admin-properties-list-broker.md) (change request, product owner, 2026-11-27)

## Description

Staff browsing the admin properties list need to see which broker is responsible for each property at a glance, without opening the editor. The list already receives the broker name; it is not shown in the table yet.

## Plain-language summary (BG)

В списъка с имоти в админа (меню Properties) ще има колона „Брокер“ с името на отговорния брокер. Ако няма брокер — „—“. Без нов филтър или сортиране по брокер.

## Acceptance criteria

- [x] On the admin Properties list (`/properties`), each row shows the responsible broker’s name in a dedicated column.
- [x] When a property has no broker (or an empty name), the cell shows “—”.
- [x] Column header is available in Bulgarian and English (e.g. „Брокер“ / “Broker”).
- [x] Existing list columns and behaviour (reference, title, status, market, views, Edit) stay unchanged aside from the new column.

## Assumptions

- Show name only; no filter or sort by broker in this change.
- Empty broker → “—”.
- Place the column after Market (before views), or after Title if that reads clearer.

## Out of scope

- Filtering or sorting the list by broker
- Changing who can be assigned as broker
- Public site property cards or detail page

## Handoff

1. `admin` subagent: implement, following `admin-page` skill (UI column + i18n; no API change expected — `agentName` already on list response).
2. `test` subagent: verify every acceptance criterion; add missing tests (component/unit; e2e only if needed for the list flow).

## Screenshots and links

- Admin: `http://localhost:5173/properties`

## Result

Implemented and verified 2026-11-27. Status: Review (developer approves Done).

- Admin: new "Broker" column in `apps/admin/src/pages/Properties/PropertiesList.tsx` between Market and Views, showing `agentName` (cell `data-testid="property-broker-${slug}"`). Pure helper `formatBrokerName` in `brokerName.ts` trims the name and returns "—" for empty, blank or missing values. No API change (`agentName` is already in the admin list response).
- i18n: `properties.broker` is "Брокер" in `bg.json` and "Broker" in `en.json`.
- Tests:
  - `brokerName.test.ts` (unit): trimmed name, and dash for empty / blank / null / undefined.
  - `PropertiesList.component.test.tsx` (component, new): header order (broker between market and views), named broker, dash for empty and blank names, other cells, views and Edit link still render.
  - E2E: no new spec. The existing smoke (`apps/e2e/src/admin/properties.spec.ts`) still covers opening the list; the broker column is fully covered at component level, so an e2e assertion would add no value.
- Run: admin suite 12 files / 24 tests passed; typecheck (admin, web, shared, e2e), ESLint and Prettier on touched files clean. Playwright e2e was not run (no change to it).
- Not covered: the en/bg labels are only checked by key (`properties.broker` exists in both locale files), not rendered in a real browser.
