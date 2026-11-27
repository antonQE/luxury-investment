# 05 — English public URLs + IDs (no shyukavitsa)

- Received: 2026-11-27
- From: product owner (change request)
- Status: Change request

## Verbatim request

> искам всички урлс да не са на шлюкавица. вместо prodai-s-nas да е само на англ. sell with us или нещо подобно.

Follow-ups:

> и основните раздели, но няма нужда от миграция на старите, просто новите да са по този начин

> Може би не е нужно да изписваме някакви имена, нека просто да е по идс например: properties/12345/23455

> да, навсякъде просто искам да е на англ + идс

## Q/A

- Q: Scope — fixed section paths only, or also CMS content slugs?
  A: Основните раздели; later clarified: English + IDs everywhere for detail pages too.
- Q: Migrate / redirect old transliteration URLs?
  A: Няма нужда от миграция на старите; просто новите да са по този начин.
- Q: ID-based detail URLs for which entities?
  A: Навсякъде — English section + IDs (properties, articles, team, pages, campaigns).
- Q: Preferred English section names?
  A: (not specified — use the suggested map)

## Suggested English section map

- `obiavi` → `properties`
- `prodai-s-nas` → `sell-with-us`
- `ekip` → `team`
- `za-nas` → `about`
- `stati` → `articles`
- `uslugi` → `services`
- `dokumenti` → `documents`
- `investicii` → `investments`
- `investicii/biznesi` → `investments/businesses`
- `advokatski-uslugi` → `legal-services`
- `stranici` → `pages`
- `kampanii` → `campaigns`
- `contact` unchanged

Detail examples: `/properties/{id}/`, `/articles/{id}/`, `/team/{id}/`, `/pages/{id}/`, `/campaigns/{id}/` (and `/en/…`).

## Linked tasks

- [LI-125](../tracker/tasks/LI-125-english-section-urls.md) — English fixed section paths
- [LI-126](../tracker/tasks/LI-126-public-detail-urls-by-id.md) — Detail pages by English section + id
