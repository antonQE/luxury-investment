# Migration and launch runbook (R1)

Source: EPIC-17, [02-current-site.analysis.md](../requirements/02-current-site.analysis.md).  
Importer scripts: LI-051 (`npm run db:import-wxr`).

## Prerequisites

1. Product owner delivers a WordPress **WXR** export (Tools → Export → All content), stored outside git at `.data/wxr/*.xml`.
   - Preferred alternative still valid: MySQL dump + `wp-content/uploads` archive.
   - R1 importer keeps attachment **URLs** from the live site; local binary ingest is optional follow-up.
2. Local/staging Postgres with migrations applied (`npm run db:migrate`).
3. Empty or disposable target database (never import into production without a backup). Prefer a DB that is not only demo seed if you want a clean migrated catalog.
4. Env for staging: `DATABASE_URL`, `MEDIA_LOCAL_ROOT` (or GCS adapter when available), `AUTH_SESSION_SECRET`, `INQUIRY_NOTIFY_TO`, optional `NEXT_PUBLIC_GA4_MEASUREMENT_ID`.

## Inventory (before import)

| Source | Approx. volume | Target |
|---|---|---|
| Properties | ~136 | `properties` + translations + media |
| Agents | ~9 | `team_members` |
| Real articles | ~8 | `articles` |
| Real pages | ~7 | `pages` |
| Theme demo / French stubs | ~49 pages | **do not import** — 301 to closest page or 410 |
| Taxonomies | cities, neighbourhoods, badges, features | locations + taxonomies with dedup |

URL scheme stays BG unprefixed + `/en/` (LI-007). Property/agent paths under `/obiavi/` and `/ekip/` should mostly keep working; root-level article/page slugs need redirect table entries.

## Test migration steps

1. Place the WXR file under `.data/wxr/` (gitignored).
2. Dry-run:
   ```bash
   npm run db:import-wxr -- --file .data/wxr/luxuryinvestmentltd.WordPress.2026-10-26.xml --dry-run
   ```
   Review counts, unmapped taxonomies, `en_needs_review` / zero-price warnings.
3. Apply into staging Postgres (idempotent upsert by `WP-{post_id}` / slug):
   ```bash
   npm run db:import-wxr -- --file .data/wxr/luxuryinvestmentltd.WordPress.2026-10-26.xml
   ```
   Optional: `--limit 10` for a sample.
4. Spot-check ≥10 properties (gallery URLs, price, areas, agent, slug).
5. Generate redirect candidates for changed slugs; merge into `apps/web/src/lib/seo/redirects.ts` (or a generated JSON loaded by that module).
6. Crawl old sitemap URLs against staging; expect 200 or a single 301 hop.
7. Verify forms (inquiry, consultation), handbook download, cookie banner, GA4 only after consent.

## Cutover (high level)

1. Freeze writes on the old site (maintenance or read-only).
2. Final export + final import into production.
3. Deploy apps with production env; `db:seed` **must not** run in production.
4. Point DNS / reverse proxy to the new stack.
5. Confirm `robots.txt`, `sitemap.xml`, homepage, sample property, `/prodai-s-nas`, admin login.

## Rollback

1. Keep the previous hosting/DNS target ready for ≥48h.
2. If critical failure: switch DNS/proxy back; leave new DB intact for diagnosis.
3. Do not re-enable public writes on WordPress after a successful cutover without an explicit decision.

## Launch checklist

- [ ] Production secrets set (DB, session, media, notify email, GA4)
- [ ] Migrations applied; seed disabled in prod
- [ ] SSL and canonical host (www vs apex) decided
- [ ] Sitemap reachable; Search Console property ready
- [ ] Cookie consent + GA4 smoke-tested
- [ ] Inquiry + consultation forms deliver to inbox / mailer
- [ ] Handbook download returns PDF and increments counters
- [ ] Admin login with demo password **changed**
- [ ] 404 / 5xx monitoring plan for week 1
- [ ] Redirect sample paths (`/oferti/`, known agent/article aliases) return 301

## After launch

- Watch 404s and broken images for 7 days; append redirects as needed.
- English “needs review” properties stay draft or flagged until edited.
- New analytics counters start from the stated launch date (no invented history).
