# Public site feature guide (`apps/web`)

Visitor-facing site that replaces luxuryinvestment.bg. Locale: Bulgarian (default, no URL prefix) and English (`/en/…`). All public URLs use a trailing slash.

Local: http://localhost:3000

---

## Global chrome

| Feature | Behaviour |
|---|---|
| Header | Logo → home; primary nav; phone; BG/EN language switcher; mobile hamburger |
| Footer | Brand, Sofia office copy, phone/email, nav (no Home), Privacy, Cookie settings, copyright |
| Language | Same path under the other locale |
| Cookie banner | Until choice (or reopened from footer): Necessary only / Accept all; link to privacy. GA4 loads only after analytics consent when configured |
| Progress | Top bar on client navigations |
| SEO | Canonical, hreflang (`bg`, `en`, `x-default`), Open Graph / Twitter; property pages also emit JSON-LD |
| Sitemap / robots | `/sitemap.xml`, `/robots.txt` |
| Legacy redirects | e.g. `/oferti` → `/obiavi/`, `/agent` → `/ekip/`, `/novini` → `/stati/` |

### Primary navigation

| Label key | Path (BG) | EN |
|---|---|---|
| Home | `/` | `/en/` |
| Properties | `/obiavi/` | `/en/obiavi/` |
| Investments | `/investicii/` (+ dropdown: overview, businesses) | `/en/investicii/`… |
| Legal services | `/advokatski-uslugi/` | `/en/advokatski-uslugi/` |
| About | `/za-nas/` | `/en/za-nas/` |
| Team | `/ekip/` | `/en/ekip/` |
| Articles | `/stati/` | `/en/stati/` |
| Sell with us | `/prodai-s-nas/` | `/en/prodai-s-nas/` |
| Documents | `/dokumenti/` | `/en/dokumenti/` |
| Services | `/uslugi/` | `/en/uslugi/` |
| Contact | `/contact/` | `/en/contact/` |

CMS pages: `/stranici/{slug}/` (e.g. privacy, terms).

---

## Home (`/`)

- Full-bleed hero with brand, headline, lead and **hero search** (subset of listing filters).
- Market shortcuts → `/obiavi/?market=sofia|black_sea|dubai_abroad`.
- Newest listings (up to 6) + link to all properties.
- Partners strip when the API returns partners (logos → external sites).
- Errors: catalogue load failure message; partners section omitted when empty.

---

## Listings search (`/obiavi/`)

Results come from the public properties API. Filters live in the **URL** (shareable, back/forward). There is **no sort UI**.

### Filter parameters

| Query param | Control | Hero form | Full form | Values |
|---|---|---|---|---|
| `transactionType` | Select | Yes | Yes | `sale`, `rent`, or empty (all) |
| `propertyType` | Select | Yes | Yes | `apartment`, `house`, `plot`, `office`, `hotel` |
| `market` | Select | Yes | Yes | `sofia`, `black_sea`, `dubai_abroad` |
| `q` | Search input | No | Yes | Free text (reference / keyword) |
| `city` | Text | No | Yes | Free text |
| `district` | Text | No | Yes | Free text |
| `bedroomsMin` | Number | No | Yes | 0–20 |
| `priceMin` / `priceMax` | Number | No | Yes | ≥ 0 |
| `areaMin` / `areaMax` | Number | No | Yes | ≥ 0 (m²) |
| `offset` | Pagination only | — | — | ≥ 0 |
| `limit` | Not in UI | — | — | Default 12 (API max 48) |

Not exposed in the UI (API only): `priceCurrency`, `displayCurrency`.

### List behaviour

- Shows result count.
- Property cards: cover, badges, deal/type, title, location, price, area, bedrooms.
- Prev/next pagination when `total > limit`.
- **Empty:** message, clear-filters link to `/obiavi/`, plus a **search-request inquiry form** (type `inquiry`, slug `search-request`) that appends the active filter summary into the message.
- **Error:** load-failure message.

---

## Property page (`/obiavi/{slug}/`)

| Section | Features |
|---|---|
| Gallery | Carousel, counter, prev/next, keyboard arrows; empty placeholder if no images |
| Header | Deal · type; title; location; reference |
| Map | Google Maps search link; “approximate” note when location precision is approximate |
| Share | Copy link, Facebook, WhatsApp, Viber |
| Print / QR | `window.print()`; QR of the page URL |
| Description | Full body |
| Facts | Price (+ /month for rent), €/m², VAT label, area, bedrooms, bathrooms, construction stage, agent name/phone, Call / Viber / WhatsApp |
| Inquiry form | Type `inquiry` or `viewing`; name, email, phone, message; privacy consent; honeypot |
| Calculators (sale only) | Acquisition costs; deposit / initial funds; mortgage estimate (+ optional credit-consultant CTA) |
| Similar | Grid of related listings or empty message |
| Mobile bar | Fixed Call / Viber / WhatsApp |
| Missing slug | Locale 404 |

Calculator UI states: loading, disabled, insufficient data, result + disclaimer.

---

## Content & marketing pages

| Path | What it does |
|---|---|
| `/za-nas/` | About — i18n copy |
| `/uslugi/` | Services — five cards (finance, legal, analysis, invest, manage) |
| `/investicii/` | Investments overview + links |
| `/investicii/biznesi/` | Businesses — title/lead |
| `/advokatski-uslugi/` | Legal services — title/lead |
| `/prodai-s-nas/` | Sell with us: CMS body (fallback i18n), seller-handbook download, 4 process steps, **consultation form** (`consultation`, slug `prodai-s-nas`) |
| `/kampanii/{slug}/` | Campaign landing (sections: hero, benefits, FAQ, CTA, curated listings…). Not in main nav unless `showInNav`. Demo: `za-prodavachi`, `apartamenti-sofia` |
| `/stati/` | Article index (title, excerpt, date); empty/error |
| `/stati/{slug}/` | Article detail (cover, author, body); 404 → not-found |
| `/stranici/{slug}/` | CMS page (optional hero, title, body) |
| `/dokumenti/` | Document library grouped by kind; legal-sample disclaimer; download via API (`source=document-library`) |
| `/ekip/` | Team grid → member pages |
| `/ekip/{slug}/` | Photo, role, bio, qualifications, email, phone |
| `/contact/` | Offices list (name, address, hours, phone, email, map); empty offices message |

Partners appear on the home page only (no `/partners` route). Offices appear on contact only (no `/offices` route).

Document kinds (display order): `seller_handbook`, `power_of_attorney`, `declaration`, `contract_template`, `guide_other`.

---

## Forms (all public)

| Form | Where | Inquiry type | Notes |
|---|---|---|---|
| Property inquiry / viewing | Property page | `inquiry` \| `viewing` | Bound to property slug |
| Consultation | Sell with us | `consultation` | Slug `prodai-s-nas` |
| Landing CTA | `/kampanii/{slug}/` | `consultation` | `source=landing` + UTM campaign/content from landing |
| Search request | Listings empty state | `inquiry` | Slug `search-request`; filters in message |

Shared: name, email, phone, message, consent checkbox, honeypot `website`. Success replaces the form; errors show inline.

---

## Cookie consent & analytics

- Storage key `li_cookie_consent_v1` in `localStorage`.
- Necessary cookies always; analytics boolean.
- Footer “Cookie settings” reopens the banner.
- GA4 scripts load only when analytics is accepted and a measurement ID is configured.

---

## Intentionally not in the public UI (yet)

- Sort control on listings.
- Dedicated partners / offices index routes.
- Owner reports, CRM, marketing portals (admin / API only).
- Currency picker for display equivalents (API can attach equivalents; no filter UI).

---

## Release coverage

| Release | Public surface |
|---|---|
| R1 | Shell, SEO, listings + filters, property page (gallery, inquiry, map, share), team/offices/partners, articles/pages, sell-with-us + handbook download, cookie consent, redirects/sitemap |
| R2 | Document library page; acquisition / deposit / mortgage calculators on sale listings; FX display equivalents in API payloads |
| R3 | Campaign landings (`/kampanii/{slug}`), marketing studio exports (admin); curated SEO landings with filtered listings; scheduled `publishAt` |
