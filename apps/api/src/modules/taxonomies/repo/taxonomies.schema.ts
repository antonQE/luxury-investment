import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

/** Shared shape for admin-managed catalog lists (ADR-0009). Labels live in `translations`. */
function taxonomyTable(name: string) {
  return pgTable(name, {
    id: uuid().defaultRandom().primaryKey(),
    key: text().notNull().unique(),
    sortOrder: integer().notNull().default(0),
    archivedAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  });
}

export const markets = taxonomyTable('markets');
export const propertyTypes = taxonomyTable('property_types');
export const transactionTypes = taxonomyTable('transaction_types');
export const badges = taxonomyTable('badges');
export const constructionStages = taxonomyTable('construction_stages');
/** Listing lifecycle (draft / published / …) — distinct from marketing badges. */
export const listingStatuses = taxonomyTable('listing_statuses');
