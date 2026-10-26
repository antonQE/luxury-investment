# Analysis: Luxury Investment functional specification v1.0

Source: [Luxury_Investment_Requirements_12_MD/](Luxury_Investment_Requirements_12_MD/00_README.md) (12 files, received 2026-10-25, verbatim)
Date: 2026-10-25
Domain terms used below: [../glossary.md](../glossary.md)

## Summary

A custom platform for a boutique real-estate agency: a premium public website (BG/EN, three marketing markets: Sofia, Black Sea, Dubai & abroad) plus an operational back office (catalog with admin-defined attributes, CRM, viewings, deals, marketing activity tracking, analytics, owner reports, content/SEO, document library, calculators, media studio) and a full migration of the current site luxuryinvestment.bg.

The spec is business/functional only and explicitly leaves the stack to the developer. It is large: comparable to a CMS + CRM + marketing-reporting product. It must be delivered in phases, and the data model must be designed up front for the later phases (history, versions, audit, permissions) even when the UI comes later.

## Scope map

Requirement IDs refer to the source files. Spec epics A-I are from `11_IMPLEMENTATION_BACKLOG.md`.

| Area | What it contains | Spec refs | Spec priority |
|---|---|---|---|
| Public site | Home with 3 markets + quick search + newest listings right after the first scroll; navigation, services, investments/businesses, legal services, team, offices, partners carousel, BG/EN | 01, A-01..A-05 | P1 |
| Catalog and data model | Admin-managed taxonomies, location hierarchy, markets, dynamic typed attributes per type/market, statuses vs badges, two independent apartment areas, BG construction stages, price/currency, slug history + 301 | 02, B-01..B-06 | P1 |
| Search and property page | Configurable 3-level filters, shareable URL state, newest first, empty-state lead capture, gallery (keyboard/swipe), hidden exact address, agent contact, viewing request, similar listings, share, print/PDF | 03, C-01..C-04 | P1 |
| Search extras | Map search, favorites, compare, saved searches, free text | C-05 | P2 |
| Team | Staff/partner registry, public profiles, offices, credit-consultant qualification only for the real person | 01 §5, 04 ADMIN-003, A-04 | P1 |
| CRM | Contacts with multiple roles, owners/co-owners, inquiries funnel, assignment and reminders, viewings + calendar, tasks with rules, offers, deal stages | 04 CRM-001..004, D-01..D-04 | P1 |
| CRM extras | Deals and commissions with restricted access, search-to-listing matching, Google/Outlook sync | D-05, D-06 | P2 / P3 |
| Marketing tracking | Per-listing marketing plan, unlimited external portal records with dated measurements and evidence, "Kosher" report model | 05 MKT-001..003, E-01, E-02 | P1 |
| Analytics and reports | Internal views/events per listing and article, "since first publication" period, GA4/Search Console, short and detailed owner reports (PDF/image/CSV), agency analytics | 05 ANL, RPT, E-03..E-06 | P1 / P2 |
| SEO and content | Editable SEO per entity, sitemap, canonical, hreflang, redirects, curated SEO pages, articles with sources, "Sell with us", landing page builder, AI writing assistant | 06, F-01..F-03, F-05 | P1 / P2 |
| Documents | Library with versions, seller handbook unchanged, download counters per version/period, legal templates | 06 DOC-001, F-04 | P1 |
| Media | Originals + derivatives, watermark, social JPEG 1200x630 from any source, share buttons, QR, PDF brochures with toggles, marketing studio templates (feed/story/square) | 07, G-01..G-04 | P1 / P2 |
| Auto-publishing | Meta/portal APIs only where permitted | G-05, INT-002 | P3 |
| Calculators and markets | Acquisition cost by country with configurable, audited rates; 10% deposit as part of price; mortgage estimate; local attributes for BG, Dubai, Greece, North Cyprus; mixed currencies | 08, H-01..H-04 | P1 |
| Security and privacy | Roles as templates with per-action/per-resource permissions, field-level restrictions (commissions, finance, notes), audit log, 2FA, sessions, rate limiting, consent, data subject rights, backups | 09 ROLE, SEC, PRIV, I-01, I-02 | P1 |
| Migration | Full inventory and migration of the current site with URL preservation / 301 map, taxonomy dedup, test migration, rollback plan, post-launch monitoring | 09 MIG, I-03..I-05 | P1 |

## Cross-cutting rules that shape the architecture

These appear in many files and must be built into the foundation, not bolted on later:

1. **Server-side authorization everywhere**, including field-level (commissions, finance, internal notes, exact address). Hiding UI is never enough (ROLE-001, SEC-001, FLOW-015).
2. **History is never overwritten**: slugs, prices, statuses, responsible agent, portal measurements, document versions, generated reports, calculator rates (02, 05, 06, 09 OPS-001).
3. **Public vs internal projections of the same data**: exact address, owner, internal docs, finance must not leak via HTML, API, JSON-LD, metadata or map (PROP-PAGE-002, SEC-001). Separate public serializers are mandatory.
4. **Admin-configurable model**: taxonomies, attributes, filters, statuses, badges, markets, calculator rules, document categories, landing sections, all without code changes (02, 03 SRCH-003, 08).
5. **Archive / merge instead of delete** for anything referenced (02 §1, FLOW-004).
6. **Localized everything**: content, taxonomies, slugs, SEO, attribute labels; more languages later without remodelling (LANG-001).
7. **Honesty constraints**: no invented numbers, no fake "published" buttons, manual data labelled as manual, visits from different sources never summed as unique people, deposit never double-counted (05, 07, 08, 11).

## Assumptions

Used unless the user says otherwise.

- A1: Scale is agency-sized: up to ~5,000 properties, ~50 staff users, moderate public traffic. No dedicated search engine is needed; Postgres handles filtering and text search.
- A2: Public visitors do not have accounts in the first releases. Favorites and compare work in the browser (local storage); saved searches are submitted as an inquiry to the CRM.
- A3: Only staff and invited partners log in to the admin panel.
- A4: Bulgaria uses EUR (since 2026-01-01). Default currency is EUR; legacy BGN prices from the migration are converted at the fixed rate 1.95583 and the original value is kept.
- A5: There is no designer: we propose the design direction (layouts, typography, colors) and the product owner approves it before pages are built (confirmed 2026-10-25).
- A6: The current site is WordPress (based on the panel screenshots and "permalink" field). Migration source will be a DB export or the WP REST API, to be confirmed.
- A7: Exact tax/fee rates for calculators are entered by the client in the admin; we ship no real rates.

## Open questions

Business questions (for the client; none blocks the foundation work):

- [x] Q1: Will there be designs from a designer? Answer: no; we design, the product owner approves.
- [ ] Q2: Access to the current site for migration (WP admin, DB dump, media files). Answer: will be sent later; development uses dummy data until then.
- [ ] Q3: Do public visitors need accounts (favorites/saved searches synced across devices, alerts)? (see A2)
- [ ] Q4: Email for notifications: which domain/provider (Google Workspace, other)? Needed for inquiry notifications to agents.
- [ ] Q5: Existing GA4, Search Console, Google Maps, Meta accounts that we should connect to?
- [ ] Q6: Target launch date. Scope at launch is answered: Release 1 replaces the current site (see [02-current-site.analysis.md](02-current-site.analysis.md)).
- [ ] Q7: Approximate number of current listings, staff users and articles (to validate A1).

Technical questions (for the developer; these block the stack ADRs) are in the risks below.

## Technology risks

The reference stack is Fantasy_Web / Fantasy_Web_Admin (Vite SPA, Chakra UI, TanStack Query, Firebase Auth, Firebase Hosting) and Newscore_Backend (Express 5, Postgres, Sequelize v7 alpha, GCS, Cloud Run). See `.cursor/skills/luxury-investment-workflow/reference-stack.md`.

### R1: The public site cannot be a client-only SPA (blocker for the reference stack)

- Why it matters: four MUST requirements need server-rendered HTML or real HTTP responses:
  - social previews: Facebook, Viber and WhatsApp bots do not run JavaScript, so Open Graph tags must be in the initial HTML (MEDIA-003, FLOW-006);
  - real HTTP 301 redirects for changed slugs and migrated URLs (FLOW-005, MIG-001);
  - indexable listings with per-page title, description, canonical, hreflang, JSON-LD (SEO-001);
  - fast first paint with large images (01 §7).
- Options:
  - A: Next.js (App Router) for the public site. Same React + TypeScript, server rendering, metadata API, sitemap support, middleware for redirects.
  - B: Keep Vite SPA and add a prerender service or edge function for bots and redirects. Two rendering paths, fragile.
  - C: Astro or another server-first framework. Good fit, but leaves the team's React patterns.
- Recommendation: A. The admin panel stays a Vite SPA built on the Fantasy_Web_Admin patterns, because it needs no SEO.
- Detail to remember: Next.js `permanentRedirect()` sends 308; the acceptance criterion literally asks for 301, so redirects are served from `proxy.ts` (Next.js 16 name for middleware) with an explicit 301 status.
- Decision: [ADR-0001](../adr/0001-public-web-nextjs-admin-vite.md)

### R2: Backend shape and ORM

- Why it matters: the domain (CRM, permissions, audit, history, dynamic attributes, reports, jobs) needs a real backend used by both the public site and the admin. The reference ORM is a pre-release (Sequelize 7 alpha) and the reference handlers have no request validation.
- Options:
  - A: Own API app `apps/api` with Express 5 and the Newscore_Backend layering (domain / repo / app / handlers / serializers), plus zod validation and **Drizzle ORM** (SQL-first, good control over JSONB and complex filters, typed, migrations).
  - B: Same as A but with **Sequelize v6** (stable, closest to the team's current code, weaker typing).
  - C: Same as A but with **Prisma** (best DX, but dynamic JSONB filtering and reporting queries often fall back to raw SQL).
  - D: Put the backend inside Next.js route handlers. Rejected: the admin is a separate app and the domain is too large for a web framework's API layer.
- Recommendation: A.
- Decision: [ADR-0002](../adr/0002-api-express-drizzle-postgres.md)

### R3: Admin-defined dynamic attributes and filtering

- Why it matters: types, units, validation, per-category/per-market applicability, filter configuration and translations are all editable without code (02 §1, SRCH-003, FLOW-004). Wrong storage makes filtering slow or validation impossible.
- Options:
  - A: Pure EAV (one row per property per attribute). Flexible, painful queries.
  - B: Everything in one JSONB column. Simple, weak integrity.
  - C: Hybrid: universal and heavily filtered fields as real columns (transaction type, type, location, price, normalized price, built-up area, area with common parts, rooms, bedrooms, bathrooms, floor, construction stage, status, dates); admin-defined attributes in a JSONB column validated against `attribute_definitions`, with GIN indexes; select options as rows referenced by ID so archive/merge works.
- Recommendation: C. Decided in the data model ADR together with the location hierarchy and translations.
- Decision: [ADR-0009](../adr/0009-catalog-data-model.md)

### R4: Media pipeline (new: the reference backend has no uploads)

- Why it matters: originals must be kept, derivatives generated (web sizes, thumbnails, social JPEG 1200x630 from a 7000x5000 PNG, optional watermark), private files must not be publicly reachable, archived documents must stop downloading (MEDIA-001..003, DOC-001, 09).
- Options: A: GCS (public and private buckets) + sharp in a background job + CDN in front of public derivatives, private files only via short-lived signed URLs after a permission check. B: a managed image service (Cloudinary, imgix). Faster to start, monthly cost, data outside our storage.
- Recommendation: A, with direct-to-storage uploads through signed URLs.
- Decision: [ADR-0010](../adr/0010-media-storage-and-jobs.md) — storage port with local adapter first; GCS later. Multipart upload for R1 local.

### R5: Background jobs

- Why it matters: image derivatives, PDF rendering, analytics rollups, reminders and task rules, exchange rates, sitemap refresh. The reference runs node-schedule inside the API process, which breaks on Cloud Run (instances scale to zero and run in parallel).
- Options: A: pg-boss (queue in Postgres, no extra infrastructure) + Cloud Scheduler for cron triggers. B: Cloud Tasks / Pub/Sub. C: Redis-based BullMQ.
- Recommendation: A.
- Decision: [ADR-0010](../adr/0010-media-storage-and-jobs.md) — in-process job runner for R1 local; pg-boss when hosting lands.

### R6: PDF and image rendering (brochures, owner reports, marketing studio)

- Why it matters: branded PDFs and PNG/JPG exports with toggled sections and previews (MEDIA-005, MEDIA-006, RPT-001). Not needed for the first milestones.
- Options: A: headless Chromium (Playwright) rendering HTML templates in a separate Cloud Run service; one template technology for PDF and images. B: @react-pdf/renderer for PDF + Satori for images; lighter, two template systems with CSS limits.
- Recommendation: A, decided when the brochure epic starts.
- Decision: pending (not blocking)

### R7: Authentication, 2FA and permissions

- Why it matters: 2FA, session management, immediate access revocation, role templates with per-user overrides, field-level restrictions (SEC-001, ROLE-001).
- Options: A: Firebase Auth for identity (team experience), MFA via Identity Platform, `checkRevoked` on token verification; all roles and permissions in our database and enforced in the API. B: own auth (sessions, TOTP) in the API. C: another provider (Auth0, Clerk).
- Recommendation: A. Firebase custom claims are not used for permissions; the reference "admin claim only" model is not enough.
- Decision: pending

### R8: Hosting

- Why it matters: Firebase Hosting alone cannot serve server-rendered pages.
- Options: A: GCP, as in the reference projects: Cloud Run for `web` (Next.js standalone) and `api`, Cloud SQL Postgres, GCS + Cloud CDN, Firebase Hosting for `admin`. B: Vercel for `web`, GCP for the rest. Split billing and two platforms.
- Recommendation: A.
- Decision: deferred by [ADR-0004](../adr/0004-monorepo-local-first-hosting-deferred.md): local-first now, simplest possible hosting chosen later; apps stay portable.

### R9: UI library on the public site

- Why it matters: Chakra UI v3 (reference) uses runtime CSS-in-JS (Emotion). In Next.js App Router that forces most components to be client components and adds runtime cost, which matters for Core Web Vitals on an SEO site.
- Options: A: Chakra UI v3 in both apps (one design-token system, team knowledge). B: Chakra in admin, a zero-runtime solution on web (Panda CSS uses the same token model as Chakra v3; or Tailwind / CSS modules).
- Recommendation: A to start, with a performance budget checked in the public-site epic; switch the web app to B only if the budget fails.
- Decision: [ADR-0003](../adr/0003-ui-tailwind-web-chakra-admin.md): Tailwind CSS on web, Chakra UI v3 in admin.

### R10: Localization model

- Why it matters: localized slugs, hreflang, translated taxonomies and attributes, more languages later.
- Recommendation: Bulgarian without a URL prefix and other locales prefixed (`/en/...`), matching the current site so most old URLs keep working (see [02-current-site.analysis.md](02-current-site.analysis.md)); translation tables per translatable entity (not columns per language), `next-intl` on web (locale routing and metadata), i18next in admin (reference). Part of the data model ADR.
- Decision: pending

### R11: Search and map

- Why it matters: filters, free text in Bulgarian and English, ID lookup, map viewport search, approximate locations.
- Recommendation: Postgres only: indexed columns, JSONB GIN for attributes, `pg_trgm` + `unaccent` for text (Postgres has no Bulgarian stemmer), latitude/longitude bounding-box queries; the approximate point is computed and stored server-side so the exact point is never sent to public clients. Google Maps on the client (required by the spec). PostGIS only if needs grow.
- Decision: pending (not blocking)

### R12: Third-party dependencies to disclose to the client

The spec asks to name provider dependencies explicitly. Each needs an account, keys and sometimes billing: Google Maps Platform, GA4, Search Console API, Meta (Pixel, CAPI, publishing), transactional email provider, bot protection (e.g. Cloudflare Turnstile or reCAPTCHA), a consent management solution, an exchange-rate source (e.g. ECB daily rates), and an LLM provider for the AI writing assistant (F-05, P2). Portal APIs (imot.bg, alo.bg, imoti.net) are unknown; manual entry is the guaranteed path.

## Proposed stack

Accepted parts are recorded in ADR-0001..0004; the rest is decided when the epic that needs it starts (see the pending list in [../adr/README.md](../adr/README.md)).

| Layer | Reference | Proposal | Change because |
|---|---|---|---|
| Monorepo | separate repos | npm workspaces: `apps/web`, `apps/admin`, `apps/api`, `packages/shared` | one place for schemas, permissions, types |
| Public site | Vite SPA | Next.js App Router, React 19, TypeScript strict | R1, ADR-0001 |
| Admin | Vite SPA | Vite SPA (keep, Fantasy_Web_Admin patterns) | |
| API | Express 5, Newscore layering | Express 5, same layering + zod validation | R2 |
| ORM | Sequelize 7 alpha | Drizzle ORM + drizzle-kit migrations | R2, ADR-0002 |
| Database | Postgres | Postgres (Cloud SQL) + pg_trgm, unaccent | |
| Shared contracts | none | zod schemas in `packages/shared` used by API, admin forms and web | reference smell: defensive mappers |
| Forms | useState per field | react-hook-form + zod | huge dynamic forms |
| Server state | TanStack Query | TanStack Query + query-key factories | |
| UI | Chakra UI v3 | Tailwind CSS (web), Chakra UI v3 (admin) | R9, ADR-0003 |
| i18n | i18next | next-intl (web), i18next (admin) | R10 |
| Auth | Firebase Auth, admin claim | Firebase Auth + MFA; permissions in our DB | R7 |
| Storage and media | GCS, no uploads | GCS public/private + signed uploads + sharp + Cloud CDN | R4 |
| Jobs | node-schedule in process | pg-boss + Cloud Scheduler | R5 |
| Rendering | none | Playwright render service (later) | R6 |
| Rich text | Tiptap (admin) | Tiptap, stored as JSON, sanitized HTML output | |
| Hosting | Firebase Hosting, Cloud Run | Deferred; local-first with Docker Compose Postgres, portable apps | R8, ADR-0004 |
| Tests | Vitest, Playwright | Vitest, Playwright, API integration tests against a real Postgres | |
| Tooling | ESLint strict, Prettier, Husky, commitlint, CI | same | |
| Monitoring | Sentry | Sentry + Cloud Logging | |

## Proposed epics and order

Our IDs (`EPIC-##`) map to the spec's epics (A-I). Order follows the spec's dependency list in `11_IMPLEMENTATION_BACKLOG.md`, with a foundation epic first. Each epic starts with a basic version; refinements become later tasks.

| Order | Epic | Spec refs | Priority |
|---|---|---|---|
| 1 | EPIC-01 Project foundation: monorepo, tooling, CI, environments, API/web/admin skeletons, DB + migrations | infra | P1 |
| 2 | EPIC-02 Identity, roles, permissions and audit log | D-01, I-01, ROLE-001, SEC-001 | P1 |
| 3 | EPIC-03 Locations, markets, taxonomies and dynamic attributes | B-01, B-02, B-04, H-04 | P1 |
| 4 | EPIC-04 Property catalog and admin editor (statuses, badges, areas, stages, price history, slug history) | B-03, B-05, B-06 | P1 |
| 5 | EPIC-05 Media pipeline (originals, derivatives, watermark, social JPEG, private files) | G-01, G-02 | P1 |
| 6 | EPIC-06 Public site shell, design system, BG/EN routing, SEO foundation (metadata, sitemap, hreflang, 301) | A-01, A-03, A-05, F-01 | P1 |
| 7 | EPIC-07 Public search, results and property page (gallery, agent contact, share) | A-02, C-01..C-04 | P1 |
| 8 | EPIC-08 Team, offices and partners | A-04, ADMIN-003 | P1 |
| 9 | EPIC-09 CRM: contacts, owners, inquiries, viewings, calendar, tasks, offers, deal stages | D-02..D-04 | P1 |
| 10 | EPIC-10 Marketing plan and external portal tracking | E-01, E-02 | P1 |
| 11 | EPIC-11 Internal analytics, GA4/Search Console, owner reports | E-03..E-05 | P1 |
| 12 | EPIC-12 Content: articles, pages, "Sell with us", landing pages | F-02, F-03, F-05 | P1 / P2 |
| 13 | EPIC-13 Document library, seller handbook, download counters | F-04 | P1 |
| 14 | EPIC-14 Calculators and market rules | H-01..H-04 | P1 |
| 15 | EPIC-15 Brochures, print, marketing studio | G-03, G-04 | P1 / P2 |
| 16 | EPIC-16 Privacy and consent | I-02 | P1 |
| 17 | EPIC-17 Migration and launch | I-03..I-05 | P1 |
| 18 | EPIC-18 Later: map search, favorites, compare, deals and commissions, matching, calendar sync, auto-publishing, agency analytics | C-05, D-05, D-06, E-06, G-05 | P2 / P3 |

Epic files are in `docs/tracker/epics/` and tracked on [the board](../tracker/BOARD.md). Tasks are written per epic when the epic starts; EPIC-01 is already decomposed.

Note on migration: EPIC-17 is last for delivery, but a migration **inventory** task should run early (inside EPIC-03) if access is available (Q2), because real data will validate the data model.
