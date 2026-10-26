import {
  badges,
  constructionStages,
  listingStatuses,
  markets,
  propertyTypes,
  transactionTypes,
} from '../schema.ts';
import type { SeedModule } from './index.ts';
import { type TaxonomySeedRow, upsertTaxonomyRows } from './taxonomy-helpers.ts';

/** Three marketing markets — independent of geography (ADR-0009). */
const MARKET_ROWS: TaxonomySeedRow[] = [
  { key: 'sofia', sortOrder: 1, nameBg: 'София', nameEn: 'Sofia' },
  { key: 'black_sea', sortOrder: 2, nameBg: 'Черно море', nameEn: 'Black Sea' },
  { key: 'dubai_abroad', sortOrder: 3, nameBg: 'Дубай и чужбина', nameEn: 'Dubai and abroad' },
];

const TRANSACTION_ROWS: TaxonomySeedRow[] = [
  { key: 'sale', sortOrder: 1, nameBg: 'Продажба', nameEn: 'Sale' },
  { key: 'rent', sortOrder: 2, nameBg: 'Наем', nameEn: 'Rent' },
];

/** Shared R1 types plus inventory extras used on the current site. */
const PROPERTY_TYPE_ROWS: TaxonomySeedRow[] = [
  { key: 'apartment', sortOrder: 1, nameBg: 'Апартамент', nameEn: 'Apartment' },
  { key: 'house', sortOrder: 2, nameBg: 'Къща', nameEn: 'House' },
  { key: 'plot', sortOrder: 3, nameBg: 'Парцел', nameEn: 'Plot' },
  { key: 'office', sortOrder: 4, nameBg: 'Офис', nameEn: 'Office' },
  { key: 'hotel', sortOrder: 5, nameBg: 'Хотел', nameEn: 'Hotel' },
  { key: 'business', sortOrder: 6, nameBg: 'Бизнес', nameEn: 'Business' },
  { key: 'villa', sortOrder: 7, nameBg: 'Вила', nameEn: 'Villa' },
  { key: 'garage', sortOrder: 8, nameBg: 'Гараж', nameEn: 'Garage' },
  { key: 'shop', sortOrder: 9, nameBg: 'Магазин', nameEn: 'Shop' },
];

/** Deduped badges from the current-site inventory (merged commission spelling variants). */
const BADGE_ROWS: TaxonomySeedRow[] = [
  { key: 'exclusive', sortOrder: 1, nameBg: 'Ексклузив', nameEn: 'Exclusive' },
  { key: 'new', sortOrder: 2, nameBg: 'Нова оферта', nameEn: 'New offer' },
  { key: 'reduced_price', sortOrder: 3, nameBg: 'Намалена цена', nameEn: 'Reduced price' },
  { key: 'investment', sortOrder: 4, nameBg: 'Инвестиция', nameEn: 'Investment property' },
  { key: 'rented', sortOrder: 5, nameBg: 'Отдаден под наем', nameEn: 'Rented' },
  { key: 'no_commission', sortOrder: 6, nameBg: 'Без комисиона', nameEn: 'No commission' },
];

const CONSTRUCTION_STAGE_ROWS: TaxonomySeedRow[] = [
  {
    key: 'building_permit',
    sortOrder: 1,
    nameBg: 'Разрешение за строеж',
    nameEn: 'Building permit',
  },
  { key: 'act_14', sortOrder: 2, nameBg: 'Акт 14', nameEn: 'Act 14' },
  { key: 'act_15', sortOrder: 3, nameBg: 'Акт 15', nameEn: 'Act 15' },
  { key: 'act_16', sortOrder: 4, nameBg: 'Акт 16', nameEn: 'Act 16' },
];

const LISTING_STATUS_ROWS: TaxonomySeedRow[] = [
  { key: 'draft', sortOrder: 1, nameBg: 'Чернова', nameEn: 'Draft' },
  { key: 'published', sortOrder: 2, nameBg: 'Публикувана', nameEn: 'Published' },
  { key: 'archived', sortOrder: 3, nameBg: 'Архивирана', nameEn: 'Archived' },
];

export const taxonomiesSeed: SeedModule = {
  name: 'taxonomies',
  run: async (db) => {
    await upsertTaxonomyRows(db, markets, 'market', MARKET_ROWS);
    await upsertTaxonomyRows(db, transactionTypes, 'transaction_type', TRANSACTION_ROWS);
    await upsertTaxonomyRows(db, propertyTypes, 'property_type', PROPERTY_TYPE_ROWS);
    await upsertTaxonomyRows(db, badges, 'badge', BADGE_ROWS);
    await upsertTaxonomyRows(db, constructionStages, 'construction_stage', CONSTRUCTION_STAGE_ROWS);
    await upsertTaxonomyRows(db, listingStatuses, 'listing_status', LISTING_STATUS_ROWS);
  },
};
