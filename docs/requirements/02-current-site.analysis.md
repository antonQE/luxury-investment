# Analysis: current site luxuryinvestment.bg as the starting point

Source: [02-current-site-as-starting-point.md](02-current-site-as-starting-point.md)
Date: 2026-10-25
Method: public pages, sitemaps and the public REST index only (no login). Counts are from the Yoast sitemaps on 2026-10-25.

## Summary

The current site is WordPress with the bought theme **WPResidence** (+ child theme), Elementor, TranslatePress (BG/EN), Yoast SEO and MonsterInsights (Google Analytics). This is exactly the "bought theme" the specification wants to replace.

The volume is small: about **136 properties, 9 agents, 8 real articles and 7 real pages**. "Similar for a start" is therefore read as: **Release 1 replaces the current site** with the same public functionality, built on the new platform with the specification's data rules from day one, plus a full migration with every old URL preserved or redirected. The bigger modules of the specification (full CRM, marketing reports, calculators, studio, document library) follow in later releases.

## Inventory

### Content

| Type | Count | Notes |
|---|---|---|
| Properties (`estate_property`) | 136 | Apartments 77, Houses 19, Plots 19, Offices 8, Business 3, Villa 2, Garage 2, Shop 2, Car service 1, Floor of a house 1, Restaurant 1, Guest house 1, Fish farm 1, Hotel 1 |
| Agents (`estate_agent`) | 9 | Public profile pages at `/agent/<slug>/` |
| Articles (`post`) | 10 | 8 real (Dubai guides, legal advice, credit consultant); 2 French theme demo posts |
| Pages | 56 | ~7 real: home, `/oferti/`, `/za-nas/`, `/услуги/`, `/novini/`, `/contact/`, 2 legal pages (French demo slugs). The rest are theme demo/dashboard pages |
| Property types | 14 | Mixed BG/EN labels in the English version |
| Transaction types | 2 | Sale, rent |
| Countries (`property_county_state`) | 4 | Bulgaria, UAE, Greece, North Cyprus |
| Cities | 23 | Includes duplicate `nea-agchialos` / `nea-agchialos-nea-agchialos` |
| Neighbourhoods (`property_area`) | 50 | BG and Dubai; duplicates `down-town` / `downtown`, `овча-купел` / `овча-купел-2` (the exact examples in the spec) |
| "Statuses" | 7 | Actually badges: Exclusive, New offer, Reduced price, Investment property, Rented, and duplicates "без комисиона" / "без комисионна" |
| "Features" | 28 | Mixes real amenities with construction stages (Act 14, 15, 16), utilities and "new construction" |
| Blog categories | 4 | Uncategorized, Dubai, Manastirski livadi, Legal advice |

### Public functionality today

- **Header**: logo, menu (Home, Properties, About us, Useful info, Contacts), language switch, phone.
- **Home**: hero "Find your future home" with advanced search; newest property cards right below (the spec's "listings after the first scroll" already holds); services blocks (financial advice, analysis, legal advice, investment properties, design and repair, management/rental/resale); contact form with GDPR checkbox; agents carousel; footer with about, contacts, property types with counts, legal links.
- **Search**: sale/rent, property type, city, country, bedrooms, construction year, ID, price (more options); sort: price, newest/oldest, bedrooms, bathrooms. Pagination without AJAX.
- **Property card**: photo, badges (several at once), title, bedrooms, baths, size, price with VAT label ("incl. VAT", "excluding VAT", "no VAT due").
- **Property page**: badges, title, location, price, share and print, gallery with thumbnails, tabs (description, address, details, features), Google Maps link, similar properties, sticky agent bar with WhatsApp, compare.
- **Theme extras not used as features**: visitor login/registration, front-end submission, dashboards, invoices, Stripe, Zillow estimate, a basic CRM (leads/contacts pages exist; whether the team uses them is unknown).

### URL patterns (must be preserved or redirected with 301)

| Content | BG | EN |
|---|---|---|
| Home | `/` | `/en/` |
| Property | `/obiavi/<slug>/` | `/en/obiavi/<same slug>/` |
| All properties | `/oferti/`, `/obiavi/` | `/en/oferti/`, `/en/obiavi/` |
| Property type | `/kategorii/<slug>/` | `/en/kategorii/<slug>/` |
| Transaction | `/action/<slug>/` | `/en/action/<slug>/` |
| City | `/grad/<slug>/` | `/en/grad/<slug>/` |
| Neighbourhood | `/kvartal/<slug>/` | `/en/kvartal/<slug>/` |
| Country | `/property_county_state/<slug>/` | `/en/...` |
| Badge ("status") | `/property_status/<slug>/` | `/en/...` |
| Feature | `/property_features/<slug>/` | `/en/...` |
| Agent | `/agent/<slug>/` | `/en/agent/<slug>/` |
| Article, page | `/<slug>/` (root level) | `/en/<slug>/` |

Observations:

- **Bulgarian has no prefix, English has `/en/`.** Keeping this scheme in the new site means most property, agent and article URLs keep working with zero redirects.
- Slugs are the same in both languages (Latin transliteration or percent-encoded Cyrillic). The new site will have localized slugs; old `/en/` URLs then redirect once to the new English slug.
- Articles and pages live at the root, so the new router must resolve root-level legacy slugs (through the redirect table) without clashing with new sections.

## Data quality issues found (input for EPIC-17)

1. **English is machine-translated** by TranslatePress ("Lakshury Investment", "PI for sale in."), and many English property titles are still Bulgarian. English versions should be migrated flagged "needs review", not published as final.
2. **Badges are stored as statuses**, and **construction stages as features**. Migration maps them to `Badge` and `ConstructionStage`.
3. **Only one area field ("Size")** exists. It cannot be decided automatically whether it is the built-up area or the area with common parts. It is kept as the original value and flagged for review (MIG-001).
4. **Zero means "unknown"** in the old data ("0 Bedrooms", "0 Year of construction"). Migration converts these to empty values.
5. **Wrong defaults**: at least one property has country "Afghanistan" (theme default); state field filled with "Bulgaria".
6. **Contact data inside descriptions** (agent name and phone typed into the text). The new page shows the responsible agent from the structured field; such text is flagged for cleanup.
7. **Duplicate taxonomy terms** (cities, neighbourhoods, badges) as listed above.
8. **Demo content** (French posts, French legal slugs, ~49 theme pages). Not migrated; their URLs get a 301 to the closest real page or a 410.
9. Services text mentions markets (Georgia, Bahrain, Spain) beyond the spec's list; they fit under "Dubai & abroad".

## Migration source

The property post type is **not exposed** in the public WordPress REST API, so a proper export is needed: a **database dump plus the `wp-content/uploads` folder** (preferred), or admin access to run an export plugin. The public sitemaps already give the full URL inventory for the redirect map.

## Release 1: replace the current site

Same public functionality as today, built properly, plus migration. Everything here is in the spec's P1; the split is about order, not about dropping requirements.

**Public site**
- Home: three markets (Sofia, Black Sea, Dubai & abroad) + quick search + newest properties right after the first scroll + services + team + contact form + partners carousel.
- Properties list with the current filters (transaction, type, market/country, city, neighbourhood, bedrooms, price, area, ID) and sort, shareable URLs, empty state that sends the search as an inquiry.
- Property page: gallery with keyboard and swipe, badges, price with VAT label, both areas with the labelled €/m² base, details and features, construction stage, approximate or exact map, similar properties, responsible agent with phone / Viber / WhatsApp / email, inquiry and viewing request form, share (Facebook, Viber, WhatsApp, copy link), print.
- Team list and profiles, offices and contacts, about, services, articles list and article page, legal pages.
- "Sell with us" section (structure from the seller handbook: preparation → marketing → viewings and negotiation → sale) with a consultation request form, and public download of the current seller handbook, unchanged.
- BG (no prefix) and EN (`/en/`), correct SEO metadata, Open Graph JPEG previews, sitemap, hreflang, 301 redirects.
- Cookie consent and GA4 (the current site already has Google Analytics, so tracking must not be lost at launch).

**Admin**
- Login with roles (basic templates), users.
- Locations, markets, property types, attributes, badges with archive/merge.
- Property editor (drafts, validation, responsible agent required, slug history), media upload with renditions and social JPEG.
- Team members, offices, partners.
- Articles and static pages (simple editor).
- Seller handbook as a versioned document: upload a new version without losing statistics; download counter in total, per version and per period.
- Inquiries inbox: every form submission stored and emailed to the responsible agent.

**Migration**: all properties, media, agents, real articles and pages; taxonomy dedup; full redirect map; test migration and URL check.

**Not in Release 1** (Release 2 and later): viewings calendar, CRM tasks, offers and deals; marketing plan and portal tracking; internal analytics and owner reports; the full document library and legal templates; calculators; brochures and marketing studio; landing page builder; favorites, compare, map search.

### Epic impact

| Release 1 | Release 2 | Release 3 |
|---|---|---|
| EPIC-01..08 (basic scope of each), EPIC-09 inquiries inbox only, EPIC-12 articles, pages and "Sell with us", EPIC-13 seller handbook with versions and download counter, EPIC-16 cookie consent and form notices, EPIC-17 | EPIC-09 rest, EPIC-10, EPIC-11, EPIC-13 rest (library, legal templates), EPIC-14 | EPIC-12 landing builder and AI assistant, EPIC-15, EPIC-18 |

Release 1 scope approved by the product owner on 2026-10-25, including the seller handbook and "Sell with us".

## Design

Approved on 2026-10-25: "similar" is functional, not visual. There is no designer; we create a clean premium design ourselves from the references in the spec (savoirproperties.com for visuals, imotireplace.bg for function, the current Framer campaign site for the seller content) and the original logo. The design direction is proposed and approved before pages are built (first task of EPIC-06).

## Development data

Decided on 2026-10-25: migration data arrives later, so development uses dummy data.

- Reference lists (property types, transaction types, countries, cities, neighbourhoods, badges, construction stages, amenities) are seeded from the public inventory above, deduplicated. These are taxonomy values, not personal data.
- Properties, team members, inquiries and articles are fictional and recognisable as such (e.g. "Demo" in titles, `example.com` emails, `+359 000` phone numbers); images are placeholders we are allowed to use.
- Seeds are idempotent, run with one command and refuse to run outside the local and test environments.
- The real migration (EPIC-17) replaces the dummy content; nothing fictional reaches production.

## Decisions this input changes

- **URL scheme**: Bulgarian without a prefix, English under `/en/` (instead of `/bg/` + `/en/`). Updates analysis R10 and task LI-007.

## Open questions

- [x] Q8: Does the team use the theme's built-in CRM? Answer: no; nothing to migrate from it.
- [ ] Q9: Database dump and uploads folder for the migration. Answer: will be sent later; until then we develop with dummy data (see Development data).
- [x] Q10: Does "similar" also mean the look? Answer: no, functional only; we design (see Design).
