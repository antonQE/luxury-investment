# Glossary

One English term per domain concept, used in code, docs and tasks. Bulgarian terms are from the specification in `docs/requirements/`. Extend this file when a new concept appears; do not introduce synonyms.

## Catalog

| Bulgarian | Term in code / docs | Notes |
|---|---|---|
| Обява, имот | `Property` | The agency's listing. Avoid "listing" as a separate entity name. |
| Публичен референтен номер | `referenceNumber` | Public ID shown on the site; legacy IDs kept in `legacyId`. |
| Тип сделка (продажба / наем) | `transactionType` (`sale`, `rent`) | Not "deal type": `Deal` is a CRM entity. |
| Тип / подтип имот | `PropertyType`, `propertySubtype` | |
| Статус на обява | `PropertyStatus` | draft, in_review, published, suspended, reserved, sold, rented, archived (configurable). |
| Маркетингов бадж | `Badge` | Exclusive, New, Price reduced, Investment. Separate from status; many at once. |
| Отговорен брокер | `responsibleAgent` | Required before publishing; changes kept in history. |
| Пазар (София, Черно море, Дубай и чужбина) | `Market` | Marketing segment, independent from geography. |
| Държава → регион → град → квартал → комплекс | `Country`, `Region`, `City`, `District`, `Complex` | Location hierarchy. |
| Характеристика, динамично поле | `AttributeDefinition`, attribute value | Admin-defined typed field. |
| Стойност от списък | `AttributeOption` | Referenced by ID so it can be archived or merged. |
| Застроена площ | `builtUpArea` | Independent field. |
| Площ с общи части | `areaWithCommonParts` | Independent field; never derived from `builtUpArea`. |
| Основна площ (за цена/м²) | `primaryAreaField` | Which area is shown first and used as the €/m² denominator. |
| РЗП | `grossBuildingArea` | Разгъната застроена площ. |
| КИНТ | `floorAreaRatio` | Коефициент за интензивност на застрояване. |
| Плътност | `buildingDensity` | |
| Тип строителство | `constructionType` | Brick, panel, EPK, timber, other. |
| Строителен етап | `ConstructionStage` | BG: `building_permit`, `act_14`, `act_15`, `act_16` (or the applicable commissioning document). Per country. |
| Година на въвеждане в експлоатация | `commissioningYear` | Separate from `constructionYear`. |
| URL slug, история на slug-а | `slug`, `SlugHistory` | Old slugs answer with HTTP 301. |
| Приблизителна локация | `locationPrecision` (`exact`, `approximate`) | Exact point never leaves the API for approximate properties. |

## Media and marketing

| Bulgarian | Term | Notes |
|---|---|---|
| Оригинал / производно изображение | `MediaAsset` (original), `MediaRendition` | Original is never modified. |
| Воден знак | `Watermark` | Applied to renditions only. |
| Социално preview изображение | `socialImage` | JPEG 1200x630 rendition. |
| Брошура | `Brochure` | Client-facing PDF; not the owner report. |
| Маркетинг студио, рекламен материал | `MarketingStudio`, `MarketingAsset` | Feed, story, square, landscape, A4. |
| Маркетингов план, дейност | `MarketingPlan`, `MarketingActivity` | |
| Запис за външен портал | `PortalListing` | One per portal URL per property. |
| Измерване (преглеждания, абонирани) | `PortalMeasurement` | Dated snapshot; never overwritten. Always labelled as manual. |
| Отчет за собственика (кратък / подробен) | `OwnerReport` (`short`, `detailed`) | Generated versions are archived. |

## CRM

| Bulgarian | Term | Notes |
|---|---|---|
| Служител, брокер, партньор | `TeamMember` (kind: agent, staff, lawyer, partner) | Public profile is separate from login access. |
| Потребител на админ панела | `User` | Has roles and permissions. |
| Офис | `Office` | |
| Клиент / контакт | `Contact` | Person or company; multiple roles (seller, buyer, investor, landlord, tenant, partner). |
| Собственик, съсобственик | `PropertyOwner` | Link between `Contact` and `Property`. |
| Запитване | `Inquiry` | Source, campaign/UTM, property, agent, status, next action. |
| Оглед | `Viewing` | A request is not a confirmed booking until the agent confirms. |
| Задача (CRM) | `CrmTask` | Avoids confusion with tracker tasks. |
| Покупна оферта | `Offer` | |
| Сделка | `Deal` | Lifecycle per country. |
| Задатък | `deposit`, `depositPercent` | Part of the purchase price, never an extra cost. |
| Комисиона | `commission` | Restricted field. |

## Content

| Bulgarian | Term | Notes |
|---|---|---|
| Статия | `Article` | |
| Страница | `Page` | |
| Лендинг | `LandingPage` | Built from `LandingSection`s. |
| Документ, версия | `Document`, `DocumentVersion` | |
| Наръчник на продавача | seller handbook | A `Document`; the current PDF is published unchanged. |
| Изтегляне | `DownloadEvent` | Counted separately from page views. |
| Партньор (лого в карусела) | `Partner` | |
