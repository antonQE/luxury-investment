# Architecture decision records

Every decision that is costly to reverse (stack, architecture, data model, hosting, third-party services) is discussed with the product owner and recorded here as `NNNN-<slug>.md` (template in `.cursor/skills/luxury-investment-workflow/templates.md`).

ADRs are not edited after acceptance. A change of mind is a new ADR that supersedes the old one; the old one gets status `Superseded by NNNN`.

Until an ADR says otherwise, the baseline in `.cursor/skills/luxury-investment-workflow/reference-stack.md` applies.

## Index

| # | Title | Status | Date |
|---|---|---|---|
| [0001](0001-public-web-nextjs-admin-vite.md) | Next.js for the public site, Vite SPA for the admin panel | Accepted | 2026-10-25 |
| [0002](0002-api-express-drizzle-postgres.md) | Own API with Express 5, Drizzle ORM, zod and Postgres | Accepted | 2026-10-25 |
| [0003](0003-ui-tailwind-web-chakra-admin.md) | Tailwind CSS for the public site, Chakra UI v3 for the admin panel | Accepted | 2026-10-25 |
| [0004](0004-monorepo-local-first-hosting-deferred.md) | npm workspaces monorepo, local-first development, hosting deferred | Accepted | 2026-10-25 |
| [0005](0005-basic-property-snapshot.md) | Basic property snapshot for the first public site | Accepted (delegated) | 2026-10-25 |
| [0006](0006-staff-auth-email-password.md) | Staff authentication with email and password | Accepted | 2026-10-25 |
| [0007](0007-public-search-postgres.md) | Public search with Postgres | Accepted | 2026-10-25 |
| [0008](0008-public-form-bot-protection.md) | Public form bot protection (honeypot first) | Accepted (delegated) | 2026-10-25 |
| [0009](0009-catalog-data-model.md) | Catalog data model (locations, taxonomies, attributes, translations) | Accepted (delegated) | 2026-10-25 |
| [0010](0010-media-storage-and-jobs.md) | Media storage interface and background jobs | Accepted (delegated) | 2026-10-26 |
| [0011](0011-transactional-email.md) | Transactional email (inquiry notifications) | Accepted (delegated) | 2026-10-26 |

## Pending decisions

Taken when the epic that needs them starts (details and options in the [requirements analysis](../requirements/01-luxury-investment-spec.analysis.md)).

| Topic | Analysis | Needed by | Release |
|---|---|---|---|
| Staff authentication and 2FA | R7 | EPIC-02 | R1 — decided: [ADR-0006](0006-staff-auth-email-password.md) email+password; 2FA later |
| Data model: dynamic attributes, locations, translations | R3, R10 | EPIC-03 | R1 — decided: [ADR-0009](0009-catalog-data-model.md) |
| Media storage and processing | R4 | EPIC-05 | R1 — decided: [ADR-0010](0010-media-storage-and-jobs.md) local port first |
| Background jobs | R5 | EPIC-05 | R1 — decided: [ADR-0010](0010-media-storage-and-jobs.md) in-process first, pg-boss later |
| Headless UI primitives for the public site | ADR-0003 | EPIC-06 | R1 (Tailwind already; primitives as needed in LI-012) |
| Search and map (Postgres search, Google Maps usage and API key) | R11, R12 | EPIC-07 | R1 — see [ADR-0007](0007-public-search-postgres.md) |
| Bot protection for public forms | R12 | EPIC-07 | R1 — decided: [ADR-0008](0008-public-form-bot-protection.md) |
| Transactional email provider (inquiry notifications to agents) | R12 | EPIC-09 | R1 — decided: [ADR-0011](0011-transactional-email.md) log stub first |
| Consent management and GA4 | R12 | EPIC-16 | R1 |
| Error monitoring (e.g. Sentry) | | first deployment | R1 |
| Hosting | R8 | first deployment | R1 |
| PDF and image rendering | R6 | EPIC-11, EPIC-15 | R2 |
