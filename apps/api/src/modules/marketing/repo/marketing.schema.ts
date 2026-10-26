import { date, integer, numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { properties } from '../../properties/repo/properties.schema.ts';
import { users } from '../../users/repo/users.schema.ts';

/** Planned/done marketing activity on a listing (MKT-001). */
export const marketingActivities = pgTable('marketing_activities', {
  id: uuid().defaultRandom().primaryKey(),
  propertyId: uuid()
    .notNull()
    .references(() => properties.id, { onDelete: 'cascade' }),
  activityType: text().notNull(),
  title: text().notNull(),
  ownerUserId: uuid().references(() => users.id),
  status: text().notNull().default('planned'),
  startsOn: date(),
  endsOn: date(),
  costAmount: numeric({ precision: 14, scale: 2 }),
  costCurrency: text().notNull().default('EUR'),
  resultNotes: text().notNull().default(''),
  evidenceUrl: text(),
  recurrence: text().notNull().default(''),
  archivedAt: timestamp({ withTimezone: true }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

/** External portal publication for a listing (MKT-002). */
export const portalListings = pgTable('portal_listings', {
  id: uuid().defaultRandom().primaryKey(),
  propertyId: uuid()
    .notNull()
    .references(() => properties.id, { onDelete: 'cascade' }),
  portalName: text().notNull(),
  listingUrl: text().notNull().default(''),
  status: text().notNull().default('draft'),
  publishedOn: date(),
  notes: text().notNull().default(''),
  archivedAt: timestamp({ withTimezone: true }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

/**
 * Append-only portal measurements — never overwrite (MKT-002).
 * Each row is a dated snapshot for a listing.
 */
export const portalMeasurements = pgTable('portal_measurements', {
  id: uuid().defaultRandom().primaryKey(),
  portalListingId: uuid()
    .notNull()
    .references(() => portalListings.id, { onDelete: 'cascade' }),
  measuredOn: date().notNull(),
  periodLabel: text().notNull().default(''),
  views: integer().notNull().default(0),
  saves: integer().notNull().default(0),
  metricDefinition: text().notNull().default(''),
  enteredByUserId: uuid().references(() => users.id),
  evidenceUrl: text(),
  notes: text().notNull().default(''),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
