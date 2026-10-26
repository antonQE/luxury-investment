# Board

Single source of truth for the status of every epic and task. Keep it in sync with the status line inside each file. Workflow and conventions: `.cursor/skills/luxury-investment-workflow/SKILL.md`.

Statuses: `Backlog` → `Ready` → `In Progress` → `Review` → `Done` (plus `Blocked`, `Cancelled`). Only one task may be `In Progress`.

Working mode (2026-10-25): the product owner asked to continue without stopping until a working site is visible. Tasks move to Done after verification; decisions that would normally wait for discussion are recorded as ADRs with status `Accepted (delegated)` and listed for review.

Next IDs: `EPIC-19`, `LI-075`


## Releases

R1 approved on 2026-10-25; R2 and R3 are the planned order. Details: [02-current-site.analysis.md](../requirements/02-current-site.analysis.md#release-1-replace-the-current-site).

| Release | Goal | Epics |
|---|---|---|
| R1 | Replace the current site: same public functionality, new platform and design, seller handbook, full migration | EPIC-01..08 (basic scope), EPIC-09 inquiries inbox, EPIC-12 articles, pages and "Sell with us", EPIC-13 seller handbook, EPIC-16 basics, EPIC-17 |
| R2 | Agency operations: CRM, marketing tracking, owner reports, document library, calculators | EPIC-09 rest, EPIC-10, EPIC-11, EPIC-13 rest, EPIC-14 |
| R3 | Growth: landing builder, AI assistant, brochures and studio, later extensions | EPIC-12 rest, EPIC-15, EPIC-18 |

## Epics

Order follows the dependency list in the specification (`11_IMPLEMENTATION_BACKLOG.md`).

| ID | Name | Priority | Status |
|---|---|---|---|
| [EPIC-01](epics/EPIC-01-project-foundation.md) | Project foundation | P1 | Done |
| [EPIC-02](epics/EPIC-02-identity-roles-audit.md) | Identity, roles, permissions and audit log | P1 | Done |
| [EPIC-03](epics/EPIC-03-locations-taxonomies-attributes.md) | Locations, markets, taxonomies and dynamic attributes | P1 | Done |
| [EPIC-04](epics/EPIC-04-property-catalog-editor.md) | Property catalog and admin editor | P1 | Done |
| [EPIC-05](epics/EPIC-05-media-pipeline.md) | Media pipeline | P1 | Done |
| [EPIC-06](epics/EPIC-06-public-site-shell-seo.md) | Public site shell, design system and SEO foundation | P1 | Done |
| [EPIC-07](epics/EPIC-07-public-search-property-page.md) | Home page, search, results and property page | P1 | Done |
| [EPIC-08](epics/EPIC-08-team-offices-partners.md) | Team, offices and partners | P1 | Done |
| [EPIC-09](epics/EPIC-09-crm.md) | CRM: contacts, inquiries, viewings, tasks, offers, deal stages | P1 | Done |
| [EPIC-10](epics/EPIC-10-marketing-portals.md) | Marketing plan and external portal tracking | P1 | Backlog |
| [EPIC-11](epics/EPIC-11-analytics-owner-reports.md) | Internal analytics, GA4 / Search Console, owner reports | P1 | Backlog |
| [EPIC-12](epics/EPIC-12-content-landing-pages.md) | Content: articles, pages, "Sell with us", landing pages | P1 / P2 | Done |
| [EPIC-13](epics/EPIC-13-documents-handbook.md) | Document library, seller handbook, download counters | P1 | Done |
| [EPIC-14](epics/EPIC-14-calculators-markets.md) | Calculators and market rules | P1 | In Progress |
| [EPIC-15](epics/EPIC-15-brochures-marketing-studio.md) | Brochures, print and marketing studio | P1 / P2 | Backlog |
| [EPIC-16](epics/EPIC-16-privacy-consent.md) | Privacy and consent | P1 | Done |
| [EPIC-17](epics/EPIC-17-migration-launch.md) | Migration and launch | P1 | Done |
| [EPIC-18](epics/EPIC-18-later-extensions.md) | Later extensions | P2 / P3 | Backlog |

## In Progress

| ID | Title | Epic | Size |
|---|---|---|---|

## Review

| ID | Title | Epic | Size |
|---|---|---|---|

## Ready

| ID | Title | Epic | Priority | Size |
|---|---|---|---|---|
| [LI-072](tasks/LI-072-deposit-calculator.md) | Deposit calculator (no double-counting) | EPIC-14 | P1 | M |

## Blocked

| ID | Title | Reason |
|---|---|---|

## Backlog

| ID | Title | Epic | Priority | Size | Depends on |
|---|---|---|---|---|---|
| [LI-073](tasks/LI-073-mortgage-estimate-cta.md) | Mortgage estimate + consultant CTA | EPIC-14 | P1 | M | LI-069 |
| [LI-074](tasks/LI-074-exchange-rates-normalized-prices.md) | Exchange rates for normalized prices | EPIC-14 | P1 | M | — |

## Done

| ID | Title | Epic |
|---|---|---|
| [LI-071](tasks/LI-071-acquisition-cost-calculator.md) | Acquisition cost calculator (API + property page) | EPIC-14 |
| [LI-070](tasks/LI-070-calculator-rules-admin-api.md) | Calculator rules admin API + audit | EPIC-14 |
| [LI-069](tasks/LI-069-calculator-rules-schema-seed.md) | Calculator rules schema + seed | EPIC-14 |
| [LI-068](tasks/LI-068-deal-stages-basic.md) | Deal stages (basic) | EPIC-09 |
| [LI-067](tasks/LI-067-offers-basic.md) | Offers register (basic) | EPIC-09 |
| [LI-066](tasks/LI-066-crm-tasks-basic.md) | CRM tasks schema + basic admin | EPIC-09 |
| [LI-065](tasks/LI-065-viewings-calendar-ui.md) | Viewings calendar UI (basic) | EPIC-09 |
| [LI-064](tasks/LI-064-viewings-schema-api.md) | Viewings schema + admin API | EPIC-09 |
| [LI-063](tasks/LI-063-contact-duplicate-hints.md) | Contact duplicate detection hints | EPIC-09 |
| [LI-062](tasks/LI-062-admin-contacts-crud.md) | Admin contacts CRUD API + UI | EPIC-09 |
| [LI-061](tasks/LI-061-inquiry-crm-fields.md) | Inquiry CRM fields (contact, source, funnel) | EPIC-09 |
| [LI-060](tasks/LI-060-property-owners-brokerage.md) | Property owners / co-owners + brokerage | EPIC-09 |
| [LI-059](tasks/LI-059-contacts-schema-seed.md) | Contacts schema + seed | EPIC-09 |
| [LI-058](tasks/LI-058-api-security-hardening.md) | API security hardening | EPIC-02 |
| [LI-057](tasks/LI-057-e2e-component-tests.md) | E2E + component test coverage | EPIC-01 |
| [LI-051](tasks/LI-051-wordpress-import-scripts.md) | WordPress/data import scripts (WXR) | EPIC-17 |
| [LI-056](tasks/LI-056-property-print-qr.md) | Property print view and QR | EPIC-07 |
| [LI-055](tasks/LI-055-catalog-list-filters.md) | Catalog list filters (city, range, ID) | EPIC-07 |
| [LI-054](tasks/LI-054-empty-search-inquiry.md) | Empty search results inquiry form | EPIC-07 |
| [LI-053](tasks/LI-053-admin-offices-ui.md) | Admin offices CRUD UI | EPIC-08 |
| [LI-052](tasks/LI-052-redirect-map-expansion.md) | Expand redirect map from current-site inventory | EPIC-17 |
| [LI-050](tasks/LI-050-migration-runbook.md) | Migration runbook and launch checklist | EPIC-17 |
| [LI-049](tasks/LI-049-consent-ga4-form-notices.md) | Consent-gated GA4 + form privacy links | EPIC-16 |
| [LI-048](tasks/LI-048-cookie-consent-banner.md) | Cookie consent banner + preference storage | EPIC-16 |
| [LI-047](tasks/LI-047-admin-handbook-upload.md) | Admin handbook upload/version UI (basic) | EPIC-13 |
| [LI-046](tasks/LI-046-public-handbook-download.md) | Public handbook download API + page | EPIC-13 |
| [LI-045](tasks/LI-045-documents-schema-seed.md) | Documents schema + download events + seed | EPIC-13 |
| [LI-044](tasks/LI-044-admin-content-crud.md) | Admin articles/pages CRUD (basic) | EPIC-12 |
| [LI-043](tasks/LI-043-sell-with-us-consultation.md) | Sell with us page + consultation form | EPIC-12 |
| [LI-042](tasks/LI-042-public-articles-pages.md) | Public articles and pages API + site routes | EPIC-12 |
| [LI-041](tasks/LI-041-articles-pages-schema.md) | Articles and pages schema + seed | EPIC-12 |
| [LI-040](tasks/LI-040-email-notification-adr-stub.md) | Transactional email ADR + notification stub | EPIC-09 |
| [LI-039](tasks/LI-039-admin-inquiries-inbox-ui.md) | Admin inquiries inbox UI | EPIC-09 |
| [LI-038](tasks/LI-038-inquiry-status-admin-api.md) | Inquiry status fields + admin list API | EPIC-09 |
| [LI-037](tasks/LI-037-team-admin-crud.md) | Admin team, offices and partners CRUD (basic) | EPIC-08 |
| [LI-036](tasks/LI-036-team-public-api-pages.md) | Public team/offices/partners API and pages | EPIC-08 |
| [LI-035](tasks/LI-035-team-offices-partners-schema.md) | Team, offices and partners schema + seed | EPIC-08 |
| [LI-034](tasks/LI-034-admin-property-gallery-ui.md) | Admin property gallery UI | EPIC-05 |
| [LI-033](tasks/LI-033-media-upload-renditions.md) | Media upload API + sharp renditions | EPIC-05 |
| [LI-032](tasks/LI-032-media-assets-schema.md) | Media assets schema + local storage port | EPIC-05 |
| [LI-031](tasks/LI-031-media-storage-jobs-adr.md) | Media storage and jobs ADR | EPIC-05 |
| [LI-030](tasks/LI-030-property-duplicate.md) | Duplicate property | EPIC-04 |
| [LI-029](tasks/LI-029-admin-property-editor-ui.md) | Admin property list and editor UI (basic) | EPIC-04 |
| [LI-028](tasks/LI-028-admin-properties-api.md) | Admin properties API (CRUD + publish) | EPIC-04 |
| [LI-027](tasks/LI-027-price-slug-history.md) | Price history and slug history | EPIC-04 |
| [LI-026](tasks/LI-026-property-schema-evolution.md) | Property schema evolution (catalog model) | EPIC-04 |
| [LI-025](tasks/LI-025-admin-taxonomy-crud.md) | Admin taxonomy and location CRUD (basic) | EPIC-03 |
| [LI-024](tasks/LI-024-attribute-definitions-schema.md) | Attribute definitions schema + seed | EPIC-03 |
| [LI-023](tasks/LI-023-taxonomies-markets-seed.md) | Markets and core taxonomies schema + seed | EPIC-03 |
| [LI-022](tasks/LI-022-locations-schema-seed.md) | Locations schema and seed | EPIC-03 |
| [LI-021](tasks/LI-021-catalog-data-model-adr.md) | Catalog data model ADR | EPIC-03 |
| [LI-020](tasks/LI-020-audit-log-foundation.md) | Audit log foundation | EPIC-02 |
| [LI-017](tasks/LI-017-inquiry-forms.md) | Inquiry and viewing request forms | EPIC-07 |
| [LI-016](tasks/LI-016-maps-similar.md) | Maps link and similar properties | EPIC-07 |
| [LI-019](tasks/LI-019-admin-login-api-auth.md) | Admin login and API auth middleware | EPIC-02 |
| [LI-015](tasks/LI-015-property-page-enrichment.md) | Property page enrichment | EPIC-07 |
| [LI-014](tasks/LI-014-sitemap-robots-redirects.md) | Sitemap, robots and redirect skeleton | EPIC-06 |
| [LI-018](tasks/LI-018-auth-adr-users-schema.md) | Auth ADR + users/roles schema | EPIC-02 |
| [LI-013](tasks/LI-013-seo-foundation.md) | SEO metadata foundation | EPIC-06 |
| [LI-012](tasks/LI-012-design-tokens-chrome.md) | Design tokens and public chrome | EPIC-06 |
| [LI-011](tasks/LI-011-design-direction.md) | Public site design direction | EPIC-06 |
| [LI-001](tasks/LI-001-monorepo-root.md) | Monorepo root and workspace conventions | EPIC-01 |
| [LI-002](tasks/LI-002-lint-format-git-hooks.md) | Lint, format and Git hooks | EPIC-01 |
| [LI-003](tasks/LI-003-shared-package.md) | Shared package skeleton | EPIC-01 |
| [LI-004](tasks/LI-004-local-postgres.md) | Local Postgres with Docker Compose | EPIC-01 |
| [LI-005](tasks/LI-005-api-skeleton.md) | API skeleton | EPIC-01 |
| [LI-006](tasks/LI-006-database-drizzle.md) | Database layer with Drizzle | EPIC-01 |
| [LI-007](tasks/LI-007-web-skeleton.md) | Public web app skeleton | EPIC-01 |
| [LI-010](tasks/LI-010-first-public-catalog.md) | First public catalog and site | EPIC-07 |
| [LI-008](tasks/LI-008-admin-skeleton.md) | Admin app skeleton | EPIC-01 |
| [LI-009](tasks/LI-009-ci-pipeline.md) | CI pipeline | EPIC-01 |
