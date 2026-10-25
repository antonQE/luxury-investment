# Board

Single source of truth for the status of every epic and task. Keep it in sync with the status line inside each file. Workflow and conventions: `.cursor/skills/luxury-investment-workflow/SKILL.md`.

Statuses: `Backlog` → `Ready` → `In Progress` → `Review` → `Done` (plus `Blocked`, `Cancelled`). Only one task may be `In Progress`.

Working mode (2026-10-25): the product owner asked to continue without stopping until a working site is visible. Tasks move to Done after verification; decisions that would normally wait for discussion are recorded as ADRs with status `Accepted (delegated)` and listed for review.

Next IDs: `EPIC-19`, `LI-011`

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
| [EPIC-01](epics/EPIC-01-project-foundation.md) | Project foundation | P1 | In Progress |
| [EPIC-02](epics/EPIC-02-identity-roles-audit.md) | Identity, roles, permissions and audit log | P1 | Backlog |
| [EPIC-03](epics/EPIC-03-locations-taxonomies-attributes.md) | Locations, markets, taxonomies and dynamic attributes | P1 | Backlog |
| [EPIC-04](epics/EPIC-04-property-catalog-editor.md) | Property catalog and admin editor | P1 | Backlog |
| [EPIC-05](epics/EPIC-05-media-pipeline.md) | Media pipeline | P1 | Backlog |
| [EPIC-06](epics/EPIC-06-public-site-shell-seo.md) | Public site shell, design system and SEO foundation | P1 | Backlog |
| [EPIC-07](epics/EPIC-07-public-search-property-page.md) | Home page, search, results and property page | P1 | In Progress |
| [EPIC-08](epics/EPIC-08-team-offices-partners.md) | Team, offices and partners | P1 | Backlog |
| [EPIC-09](epics/EPIC-09-crm.md) | CRM: contacts, inquiries, viewings, tasks, offers, deal stages | P1 | Backlog |
| [EPIC-10](epics/EPIC-10-marketing-portals.md) | Marketing plan and external portal tracking | P1 | Backlog |
| [EPIC-11](epics/EPIC-11-analytics-owner-reports.md) | Internal analytics, GA4 / Search Console, owner reports | P1 | Backlog |
| [EPIC-12](epics/EPIC-12-content-landing-pages.md) | Content: articles, pages, "Sell with us", landing pages | P1 / P2 | Backlog |
| [EPIC-13](epics/EPIC-13-documents-handbook.md) | Document library, seller handbook, download counters | P1 | Backlog |
| [EPIC-14](epics/EPIC-14-calculators-markets.md) | Calculators and market rules | P1 | Backlog |
| [EPIC-15](epics/EPIC-15-brochures-marketing-studio.md) | Brochures, print and marketing studio | P1 / P2 | Backlog |
| [EPIC-16](epics/EPIC-16-privacy-consent.md) | Privacy and consent | P1 | Backlog |
| [EPIC-17](epics/EPIC-17-migration-launch.md) | Migration and launch | P1 | Backlog |
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

## Blocked

| ID | Title | Reason |
|---|---|---|

## Backlog

| ID | Title | Epic | Priority | Size | Depends on |
|---|---|---|---|---|---|
| [LI-009](tasks/LI-009-ci-pipeline.md) | CI pipeline | EPIC-01 | P1 | S | LI-006, LI-007, LI-008, remote repository |

## Done

| ID | Title | Epic |
|---|---|---|
| [LI-001](tasks/LI-001-monorepo-root.md) | Monorepo root and workspace conventions | EPIC-01 |
| [LI-002](tasks/LI-002-lint-format-git-hooks.md) | Lint, format and Git hooks | EPIC-01 |
| [LI-003](tasks/LI-003-shared-package.md) | Shared package skeleton | EPIC-01 |
| [LI-004](tasks/LI-004-local-postgres.md) | Local Postgres with Docker Compose | EPIC-01 |
| [LI-005](tasks/LI-005-api-skeleton.md) | API skeleton | EPIC-01 |
| [LI-006](tasks/LI-006-database-drizzle.md) | Database layer with Drizzle | EPIC-01 |
| [LI-007](tasks/LI-007-web-skeleton.md) | Public web app skeleton | EPIC-01 |
| [LI-010](tasks/LI-010-first-public-catalog.md) | First public catalog and site | EPIC-07 |
| [LI-008](tasks/LI-008-admin-skeleton.md) | Admin app skeleton | EPIC-01 |
