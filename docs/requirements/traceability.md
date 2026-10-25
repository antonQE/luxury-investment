# Traceability: specification → epics → releases

Every requirement ID of the specification ([Luxury_Investment_Requirements_12_MD/](Luxury_Investment_Requirements_12_MD/00_README.md)) mapped to the epic that delivers it and the release. When a requirement is split, each part is listed. Tasks reference these IDs in their "Source" line; update this file when an epic is decomposed and the split changes.

Releases: R1 replace the current site, R2 agency operations, R3 growth ([02-current-site.analysis.md](02-current-site.analysis.md#release-1-replace-the-current-site)).

## 01 Product and site (no IDs)

| Section | Epic | Release |
|---|---|---|
| §2 Home: three markets, quick search, newest listings first, services, team, partners carousel, footer | EPIC-07, EPIC-08 | R1 |
| §3 Information architecture (all sections incl. Investments → Businesses, Legal services) | EPIC-06 | R1 |
| §4 "Sell with us" with handbook download and consultation CTA | EPIC-12, EPIC-13 | R1 |
| §5 Team profiles and offices | EPIC-08 | R1 |
| §6 Multilingual and currencies | EPIC-03, EPIC-06 | R1 |
| §7 Design principles, original logo | EPIC-06 | R1 |

## 02 Properties data model (no IDs)

| Section | Epic | Release |
|---|---|---|
| §1 Admin-defined typed attributes, archive/merge, duplicate prevention | EPIC-03 | R1 |
| §2 Universal fields, slug history, statuses vs badges, responsible agent, price history, location precision | EPIC-04 | R1 |
| §3-§7 Type-specific fields (apartments with two independent areas, houses, land, commercial, hotels/businesses) | EPIC-03 (definitions), EPIC-04 (values) | R1 |
| §8 International attributes (Dubai, Greece, North Cyprus) | EPIC-03 | R1 |
| §9 Admin CRUD of lists, hierarchy, merge view, duplicate property, import/export | EPIC-03, EPIC-04 | R1 (import/export R2) |

## 03 Search and property page

| ID | Epic | Release |
|---|---|---|
| SRCH-001 Quick search | EPIC-07 | R1 |
| SRCH-002 Results page | EPIC-07 | R1 |
| SRCH-003 Three filter levels, admin-configured | EPIC-03 (config), EPIC-07 (UI) | R1 |
| SRCH-004 Type-specific filters | EPIC-07 | R1 |
| SRCH-005 ID and free-text search | EPIC-07 | R1 |
| SRCH-005 Map search, favorites, compare, saved searches, curated SEO category URLs | EPIC-18, EPIC-12 | R3 |
| PROP-PAGE-001 Media presentation | EPIC-07, EPIC-05 | R1 |
| PROP-PAGE-002 Content, areas, hidden address, similar properties | EPIC-07 | R1 |
| PROP-PAGE-003 Agent and conversion (inquiry, viewing request, contact channels) | EPIC-07, EPIC-09 | R1 |
| PROP-PAGE-004 Print, Open Graph image | EPIC-07, EPIC-05 | R1 |
| PROP-PAGE-004 Calculator | EPIC-14 | R2 |
| PROP-PAGE-004 Price history (admin) | EPIC-04 | R1 |
| PROP-PAGE-004 Public view counter | EPIC-11 | R2 |
| PROP-PAGE-004 PDF brochure, social formats | EPIC-15 | R3 |

## 04 Admin and CRM

| ID | Epic | Release |
|---|---|---|
| ADMIN-001 Dashboard (shell) | EPIC-02 | R1 |
| ADMIN-001 Dashboard KPIs | EPIC-11 | R2 |
| ADMIN-002 Property lifecycle and editor | EPIC-04 | R1 |
| ADMIN-003 Staff and profiles | EPIC-08 | R1 |
| CRM-001 Contacts and owners | EPIC-09 | R2 |
| CRM-002 Inquiries inbox: stored, linked to property and agent, email to agent | EPIC-09 | R1 |
| CRM-002 Funnel stages, assignment rules, reminders | EPIC-09 | R2 |
| CRM-003 Viewings, calendar, tasks | EPIC-09 | R2 |
| CRM-003 Google/Outlook sync | EPIC-18 | R3 |
| CRM-004 Offers and deal stages | EPIC-09 | R2 |
| CRM-004 Commissions and payments | EPIC-18 | R3 |
| CRM-005 Matching searches with properties | EPIC-18 | R3 |
| CRM-006 Link to marketing and reports, performance by agent/property/source | EPIC-11 | R2 |

## 05 Marketing and analytics

| ID | Epic | Release |
|---|---|---|
| MKT-001 Marketing plan | EPIC-10 | R2 |
| MKT-002 External portals with dated measurements | EPIC-10 | R2 |
| MKT-003 "Kosher" report model | EPIC-10, EPIC-11 | R2 |
| ANL-001 Internal analytics | EPIC-11 | R2 |
| ANL-001 Alerts | EPIC-18 | R3 |
| ANL-002 Since first publication, history | EPIC-11 (data kept from R1 by EPIC-04) | R2 |
| ANL-003 GA4 tag with consent | EPIC-16 | R1 |
| ANL-003 GA4/Search Console reporting, UTM | EPIC-11, EPIC-10 | R2 |
| RPT-001 Short and detailed owner reports | EPIC-11 | R2 |
| RPT-002 Agency analytics | EPIC-18 | R3 |

## 06 Content, SEO, documents

| ID | Epic | Release |
|---|---|---|
| SEO-001 Metadata, slugs, 301, hreflang, sitemap, robots | EPIC-06, EPIC-04 | R1 |
| SEO-001 SEO assistant, curated SEO pages | EPIC-12 | R3 |
| CONTENT-001 Articles (basic: sources, BG/EN, linked properties, drafts) | EPIC-12 | R1 |
| CONTENT-001 Scheduling, approval roles, AI tools | EPIC-12 | R3 |
| CONTENT-002 "Sell with us" | EPIC-12 | R1 |
| CONTENT-003 Partners carousel, team | EPIC-08 | R1 |
| CONTENT-003 Landing page builder | EPIC-12 | R3 |
| DOC-001 Seller handbook: versions, public download, counters | EPIC-13 | R1 |
| DOC-001 Document library, legal templates | EPIC-13 | R2 |

## 07 Media and integrations

| ID | Epic | Release |
|---|---|---|
| MEDIA-001 Photos, galleries, originals, renditions, visibility | EPIC-05 | R1 |
| MEDIA-002 Watermark | EPIC-05 | R1 |
| MEDIA-003 Social preview JPEG | EPIC-05, EPIC-06 | R1 |
| MEDIA-004 Share buttons, copy link, QR | EPIC-07 | R1 |
| MEDIA-005 PDF brochures | EPIC-15 | R3 |
| MEDIA-006 Marketing studio | EPIC-15 | R3 |
| INT-001 GA4 events and Search Console | EPIC-16 (tag), EPIC-11 (reporting) | R1 / R2 |
| INT-002 UTM tracking | EPIC-10 | R2 |
| INT-002 Meta/portal APIs | EPIC-18 | R3 |
| INT-003 Forms to CRM, agent notification, contact buttons | EPIC-09, EPIC-07 | R1 |
| INT-003 Calendar sync, email automation | EPIC-18 | R3 |
| MEDIA-ACCEPT 1, 2, 5, 6 | EPIC-05, EPIC-06, EPIC-07 | R1 |
| MEDIA-ACCEPT 3, 4 | EPIC-15 | R3 |

## 08 Calculators and markets

| ID | Epic | Release |
|---|---|---|
| CALC-001 Acquisition cost | EPIC-14 | R2 |
| CALC-002 Deposit as part of price | EPIC-14 | R2 |
| CALC-003 Mortgage estimate | EPIC-14 | R2 |
| CALC-ADMIN Rules, audit, enable/disable | EPIC-14 | R2 |
| MARKET-001 Geography and local attributes | EPIC-03 | R1 |
| MARKET-002 Original price and currency, €/m² base | EPIC-04 | R1 |
| MARKET-002 Exchange rates, normalized mixed-currency filtering | EPIC-14 | R2 |
| MARKET-003 International terminology | EPIC-03 | R1 |

## 09 Roles, security, migration

| ID | Epic | Release |
|---|---|---|
| ROLE-001 Roles and permissions | EPIC-02 | R1 |
| SEC-001 Auth, 2FA, sessions, audit, upload safety, rate limiting | EPIC-02, EPIC-05, EPIC-09 | R1 |
| SEC-001 Backups and restore procedure | EPIC-16 | R1 |
| PRIV-001 Consent, form notices | EPIC-16 | R1 |
| PRIV-001 Data subject requests, retention | EPIC-16 | R2 |
| LANG-001 Multilingual | EPIC-03, EPIC-06 | R1 |
| MIG-001, MIG-002 Migration | EPIC-17 | R1 |
| OPS-001 Continuity of history | EPIC-04, EPIC-11, EPIC-13 | R1 / R2 |

## 10 User flows

| Flow | Release | Notes |
|---|---|---|
| FLOW-001 Market and search | R1 | |
| FLOW-002 Filters | R1 | Map sync in R3 |
| FLOW-003 Create property | R1 | |
| FLOW-004 New neighbourhood / feature | R1 | |
| FLOW-005 Slug change and 301 | R1 | |
| FLOW-006 Gallery, contact, share | R1 | |
| FLOW-007 Viewing request | R1 / R2 | R1 stores and notifies; confirm, reschedule, outcome in R2 |
| FLOW-008 External portals | R2 | |
| FLOW-009 Owner reports | R2 | |
| FLOW-010 Handbook | R1 | Legal templates part in R2 |
| FLOW-011 Marketing studio | R3 | |
| FLOW-012 CRM and agent accountability | R1 / R2 | R1 links inquiry to property and agent |
| FLOW-013 Deposit calculator | R2 | |
| FLOW-014 Migration and SEO | R1 | |
| FLOW-015 Access control | R1 | Applies to every later module too |

## 11 Spec backlog epics

| Spec ID | Our epic |
|---|---|
| A-01..A-05 | EPIC-06, EPIC-07, EPIC-08 |
| B-01..B-06 | EPIC-03, EPIC-04, EPIC-05 |
| C-01..C-04 | EPIC-07 |
| C-05 | EPIC-18 |
| D-01 | EPIC-02, EPIC-08 |
| D-02..D-04 | EPIC-09 |
| D-05, D-06 | EPIC-18 |
| E-01, E-02 | EPIC-10 |
| E-03..E-05 | EPIC-11 |
| E-06 | EPIC-18 |
| F-01 | EPIC-06 |
| F-02, F-03, F-05 | EPIC-12 |
| F-04 | EPIC-13 |
| G-01, G-02 | EPIC-05 |
| G-03, G-04 | EPIC-15 |
| G-05 | EPIC-18 |
| H-01..H-04 | EPIC-14, EPIC-03 |
| I-01 | EPIC-02 |
| I-02 | EPIC-16 |
| I-03..I-05 | EPIC-17 |
