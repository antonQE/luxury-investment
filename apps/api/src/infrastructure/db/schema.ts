import { integer, jsonb, numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export { auditEntries } from '../../modules/audit/repo/audit.schema.ts';
export { inquiries } from '../../modules/inquiries/repo/inquiries.schema.ts';
export {
  permissions,
  rolePermissions,
  roles,
  sessions,
  users,
} from '../../modules/users/repo/users.schema.ts';

/** Denormalized listing snapshot (ADR-0005). Replaced by the configurable catalog in EPIC-03/04. */
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
  price: numeric({ precision: 14, scale: 2 }).notNull(),
  currency: text().notNull(),
  vatLabel: text(),
  bedrooms: integer(),
  bathrooms: integer(),
  area: numeric({ precision: 10, scale: 2 }).notNull(),
  primaryAreaLabelBg: text().notNull(),
  primaryAreaLabelEn: text().notNull(),
  constructionStage: text(),
  badges: jsonb().$type<string[]>().notNull().default([]),
  imageUrls: jsonb().$type<string[]>().notNull(),
  agentName: text().notNull(),
  agentPhone: text().notNull(),
  publishedAt: timestamp({ withTimezone: true }).notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
