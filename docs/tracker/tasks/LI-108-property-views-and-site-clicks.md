# LI-108: Property view counters + site click tracking (admin)

- Epic: EPIC-11
- Status: Done
- Priority: P1
- Size: M
- Area: api, web, admin, shared
- Depends on: LI-082

## Description

Owner feedback: no visible view counter for listings. Need total + unique views (not public), shown in admin. Also want to see where people click across the site, not only on properties.

## Acceptance criteria

- [x] Public property pages send `page_view` (first-party; not shown on public UI).
- [x] Admin property list and editor show **total** and **unique** views.
- [x] Site-wide `page_view` + `click` events are ingested (path / label / href).
- [x] Admin Analytics screen lists top pages and top clicks for a recent period.
- [x] Bots excluded; rate-limited public ingest.

## Out of scope

- Public display of view counts; GA4 dashboards; heatmaps; PDF owner-report polish.

## Result

- `site_events` / `site_event_daily_rollups` + migration `0033`.
- Public `POST /v1/public/analytics/site-events`; admin `GET /analytics/site` and `/analytics/property-views`.
- Web: invisible `SiteAnalytics` + `PropertyViewBeacon`.
- Admin: views columns on properties list/editor; Analytics nav page (30 days).
