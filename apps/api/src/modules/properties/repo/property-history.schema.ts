import { numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { users } from '../../users/repo/users.schema.ts';
import { properties } from './properties.schema.ts';

/** Append-only price changes for owner reports and audit (EPIC-04 / B-05). */
export const propertyPriceHistory = pgTable('property_price_history', {
  id: uuid().defaultRandom().primaryKey(),
  propertyId: uuid()
    .notNull()
    .references(() => properties.id, { onDelete: 'cascade' }),
  price: numeric({ precision: 14, scale: 2 }).notNull(),
  currency: text().notNull(),
  changedByUserId: uuid().references(() => users.id),
  note: text(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

/** Previous slugs for 301 redirects when an admin renames a listing. */
export const propertySlugHistory = pgTable('property_slug_history', {
  id: uuid().defaultRandom().primaryKey(),
  propertyId: uuid()
    .notNull()
    .references(() => properties.id, { onDelete: 'cascade' }),
  slug: text().notNull().unique(),
  changedByUserId: uuid().references(() => users.id),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
