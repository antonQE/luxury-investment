import { integer, jsonb, numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { locations } from '../../locations/repo/locations.schema.ts';
import { users } from '../../users/repo/users.schema.ts';

/**
 * Property listings (ADR-0005 snapshot evolving in EPIC-04).
 * Denormalized location labels remain for public cards until joins land.
 */
export const properties = pgTable('properties', {
  id: uuid().defaultRandom().primaryKey(),
  referenceNumber: text().notNull().unique(),
  slug: text().notNull().unique(),
  titleBg: text().notNull(),
  titleEn: text().notNull(),
  excerptBg: text().notNull(),
  excerptEn: text().notNull(),
  descriptionBg: text().notNull(),
  descriptionEn: text().notNull(),
  transactionType: text().notNull(),
  propertyType: text().notNull(),
  market: text().notNull(),
  country: text().notNull(),
  city: text().notNull(),
  district: text(),
  locationId: uuid().references(() => locations.id),
  price: numeric({ precision: 14, scale: 2 }).notNull(),
  currency: text().notNull(),
  vatLabel: text(),
  bedrooms: integer(),
  bathrooms: integer(),
  /** Resolved primary area for public cards (kept in sync with dual areas). */
  area: numeric({ precision: 10, scale: 2 }).notNull(),
  builtUpArea: numeric({ precision: 10, scale: 2 }),
  areaWithCommonParts: numeric({ precision: 10, scale: 2 }),
  /** Which dual area is primary for €/m² and public `area`: built_up | with_common. */
  primaryArea: text().notNull().default('built_up'),
  primaryAreaLabelBg: text().notNull(),
  primaryAreaLabelEn: text().notNull(),
  constructionStage: text(),
  badges: jsonb().$type<string[]>().notNull().default([]),
  /** Values keyed by attribute_definition id (ADR-0009). */
  attributeValues: jsonb().$type<Record<string, unknown>>().notNull().default({}),
  imageUrls: jsonb().$type<string[]>().notNull(),
  agentName: text().notNull(),
  agentPhone: text().notNull(),
  responsibleAgentUserId: uuid().references(() => users.id),
  /** draft | published | archived — keys match listing_statuses. */
  listingStatus: text().notNull().default('draft'),
  publishedAt: timestamp({ withTimezone: true }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
