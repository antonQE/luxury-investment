# Admin panel feature guide (`apps/admin`)

Staff back office for catalogue, CRM, content, documents and marketing. Vite + React + Chakra UI; cookie session against the API.

Local: http://localhost:5173  
Demo login (after seed): `admin@example.com` / `DemoAdmin!234`

Nav items are **not** hidden by role. The API still enforces permissions (a missing permission returns 403). The only **UI** permission gate today is `finance:read` on Deals (commission field).

After pulling new migrations/permissions always run:

```sh
npm run db:migrate && npm run db:seed
```

Then log out and log in again so the session picks up new permission keys.

---

## Auth & shell

| Route | Behaviour |
|---|---|
| `/login` | Email + password → dashboard (or `from` location). Already logged in → dashboard |
| Session | `GET /v1/admin/auth/me`; logout `POST /v1/admin/auth/logout` |
| `/` | Redirects to `/dashboard` |
| `*` | Not-found page with link to dashboard |

Shell: sidebar (header: display name, BG/EN language switcher, logout).

### Sidebar order

Dashboard → Properties → Inquiries → Contacts → Viewings → CRM tasks → Offers → Deals → Articles → Landings → Documents → Handbook → Marketing → Studio → Settings → Team → Offices → Partners → Locations → Property types

### Filters / search / sort — overview

| Page | Filters | Search | Sort |
|---|---|---|---|
| Viewings | Day/week/month range; agent all \| me | — | By scheduled time in calendar |
| Marketing | Required property select | — | — |
| Everywhere else | — | — | API default order |

Most list pages call the API with a fixed limit (e.g. properties `?limit=100`) and **no** search box.

---

## Dashboard (`/dashboard`) — R1

Read-only API health: status, version, component map (`GET /health`). No CRUD.

---

## Properties (`/properties`) — R1

**List:** reference, title (BG), listing status, market, Edit. Button → create.

**Editor** (`/properties/new`, `/properties/:id`):

| Action | Notes |
|---|---|
| Create / Save | PATCH/POST |
| Publish | When not new |
| Archive | When not new |

**Visible fields:** title / excerpt / description BG+EN; transaction type (`sale` \| `rent`); property type (`apartment` \| `house` \| `plot` \| `office` \| `hotel`); market (`sofia` \| `black_sea` \| `dubai_abroad`); city; district; price; area.

**Listing status:** `draft` \| `published` \| `archived`.

**Gallery** (after save): upload jpeg/png/webp; alt BG/EN; set primary; archive asset.

Hidden/defaulted on save (not all shown in the form): country, currency EUR, agent fields, slug, image URLs, etc.

**Filters:** none.

---

## Inquiries (`/inquiries`) — R1

Inbox of public form submissions. **No create** in admin.

| Column / control | Detail |
|---|---|
| Type | `inquiry`, `viewing`, `consultation` (from API) |
| Property | Slug |
| Contact | Name, email |
| Status select | `new` \| `in_progress` \| `closed` |

**Filters:** none.

---

## Contacts (`/contacts`) — R2

| Action | Detail |
|---|---|
| Create / Edit | Inline form |
| Archive | Soft archive (not hard delete) |
| Duplicate check | By email / phone |

**Fields:** kind (`person` \| `company`); display name; email; phone; notes; roles (checkboxes): seller, buyer, investor, landlord, tenant, partner.

List excludes archived. **Filters:** none. Needs `contacts:read` / `contacts:write` on the session.

---

## Viewings (`/viewings`) — R2

Calendar of property viewings.

| Control | Detail |
|---|---|
| Mode | Day / week / month |
| Navigation | Prev / today / next |
| Agent filter | All brokers \| Me |
| Create | Property*, contact*, datetime*, location note; agent = current user; status `scheduled` |
| Per event | Reschedule, decline, status select |

**Statuses:** `scheduled`, `confirmed`, `rescheduled`, `declined`, `completed`, `cancelled`.

Client-side overlap warning when the same agent has overlapping slots. Day-empty copy when no events.

Loads properties + contacts for the create form.

---

## CRM tasks (`/crm-tasks`) — R2

| Action | Detail |
|---|---|
| Create | Title*, due at*, notes; kind forced `manual`; assignee = current user |
| Complete | For open tasks |

**Statuses:** `open` \| `completed` \| `cancelled`.  
**Kinds (display):** `manual`, `inquiry_followup`, `post_viewing`.

Overdue badge on open past-due tasks. No edit/archive UI. API supports `?status=` but the UI does not filter.

---

## Offers (`/offers`) — R2

| Action | Detail |
|---|---|
| Create | Property*, contact*, type, amount*, valid until, terms; currency EUR; status starts `submitted` |
| Update status | Inline select |

**Types:** `purchase` \| `rent`.  
**Statuses:** `draft`, `submitted`, `accepted`, `rejected`, `withdrawn`, `expired`.

**Filters:** none.

---

## Deals (`/deals`) — R2

| Action | Detail |
|---|---|
| Create | Property*, buyer contact*, agreed price, notes; stage starts `negotiation`; currency EUR |
| Update stage | Inline select |
| Commission | Shown only if session has `finance:read` |

**Stages:** `negotiation`, `preliminary`, `financing`, `notary`, `closed`, `cancelled`.

**Filters:** none.

---

## Articles (`/articles`) — R1

| Action | Detail |
|---|---|
| Create | Slug*, title/excerpt/body BG+EN |
| Publish | If not already published |
| Archive | Soft archive |

**Statuses:** `draft` \| `published` \| `archived`. No post-create edit form. **Filters:** none.

---

## Documents (`/documents`) — R2 (library) / R1 (handbook overlap)

Document library list (seeded categories). **No “create document”** in the UI.

| Action | Detail |
|---|---|
| List | Title, kind, access level, legal-sample flag |
| Manage | Select row → versions + download totals; upload PDF version (label, auto-publish) |
| Archive | Soft-archive document |

**Kinds:** `seller_handbook`, `power_of_attorney`, `declaration`, `contract_template`, `guide_other`.  
**Access:** `public` \| `internal`.

Link to the dedicated Handbook screen. **Filters:** none.

Admin download-stats API exists (`by period/source`) without a dedicated stats UI on this page.

---

## Handbook (`/handbook`) — R1

Seller handbook only:

- Total download count.
- Upload PDF version (published).
- Version list; publish a non-current version.

---

## Studio (`/studio`) — R3

Marketing materials from catalog data for a selected property. No AI; no auto-publish.

| Control | Detail |
|---|---|
| Property | Required select |
| Brochure | A4 PDF template + element toggles → generate/download |
| Social | PNG template (feed/square/…), badge preset → generate/download |
| Channel copy | FB/IG/TikTok/LinkedIn/email × BG/EN × short/long; copy to clipboard after human review |
| Exports | History table with re-download |

QR / listing URL use `PUBLIC_SITE_URL`.

## Settings (`/settings`)

Agency shell contact: **public phone** (header icon + footer) and **correspondence email** (footer). Empty hides the field. Requires `content:write`.

## Landings (`/landings`) — R3

Campaign landing builder: create/edit/publish/archive; ordered typed sections (hero, benefits, FAQ, CTA, related listings with saved filter, …). JSON payloads for section content. Demo seeds: `za-prodavachi`, `apartamenti-sofia` (`showInNav: false`). Public URL: `/kampanii/{slug}`. Publish accepts optional future `publishAt`.

## Marketing (`/marketing`) — R2

Everything is **scoped to one property** (required select). Until a property is chosen, the page asks to pick one.

### Activities

- Create: type (free text), title, status (`planned` \| `in_progress` \| `done` \| `cancelled`).
- List only (no edit UI).

### Portal listings

- Create: portal name, listing URL, status (`draft` \| `published` \| `paused` \| `removed`).
- Select a listing → measurements panel.

### Measurements (append-only)

- Append: measured on (date), views, saves.
- Previous rows are never overwritten; history grows.

**Filters:** property only.

---

## Team (`/team`) — R1

Create: slug*, kind (`agent` \| `staff` \| `lawyer` \| `partner`), name/role BG+EN.  
List + Archive. No edit form. **Filters:** none.

---

## Offices (`/offices`) — R1

Create: slug*, map query*, name/address BG+EN, phone, email.  
List + Archive. No edit form.

---

## Partners (`/partners`) — R1

Create: slug*, logo URL*, name BG+EN, website URL.  
List + Archive. No edit form.

---

## Locations (`/locations`) — R1

Create: kind (`country` \| `region` \| `city` \| `district` \| `complex`), slug*, name BG+EN.  
List (archived excluded) + Archive. No edit form. No include-archived toggle in UI.

---

## Property types (`/property-types`) — R1

Taxonomy `property_types`: create key* + name BG+EN; list + Archive.

---

## Features with API but no admin tab (R2)

| Feature | Where |
|---|---|
| Property event ingest + daily rollups | Public `POST /v1/public/analytics/events` |
| Owner report JSON snapshots | Admin `POST/GET /v1/admin/analytics/owner-reports` |
| Calculator rule sets / FX rates admin | API only (rules used by public calculators) |
| Property ownership / brokerage links | API (CRM ownership endpoints) |
| Document download stats by period/source | Admin documents stats endpoint |

---

## Status / enum cheat sheet

| Domain | Values |
|---|---|
| Property listing | draft, published, archived |
| Inquiry | new, in_progress, closed |
| Viewing | scheduled, confirmed, rescheduled, declined, completed, cancelled |
| CRM task | open, completed, cancelled |
| Offer | draft, submitted, accepted, rejected, withdrawn, expired |
| Deal stage | negotiation, preliminary, financing, notary, closed, cancelled |
| Article | draft, published, archived |
| Marketing activity | planned, in_progress, done, cancelled |
| Portal listing | draft, published, paused, removed |
| Contact | person/company · roles seller…partner |
| Team kind | agent, staff, lawyer, partner |
| Location kind | country, region, city, district, complex |
| Transaction / type / market | sale/rent · apartment/house/plot/office/hotel · sofia/black_sea/dubai_abroad |

---

## Release coverage

| Release | Admin surface |
|---|---|
| R1 | Login, dashboard health, properties + gallery, inquiries inbox, articles, handbook, team/offices/partners, locations, property types |
| R2 | Contacts, viewings calendar, CRM tasks, offers, deals, document library, marketing portals/activities |

---

## Related API prefixes

```
GET  /health
POST /v1/admin/auth/login | GET /me | POST /logout
/v1/admin/properties | …/media
/v1/admin/inquiries | contacts | viewings | crm-tasks | offers | deals
/v1/admin/articles | documents | marketing/*
/v1/admin/team | offices | partners | locations | taxonomies/property_types
/v1/admin/analytics/owner-reports
```
