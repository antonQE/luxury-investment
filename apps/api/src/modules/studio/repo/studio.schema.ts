import { boolean, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { properties } from '../../properties/repo/properties.schema.ts';
import { users } from '../../users/repo/users.schema.ts';

/**
 * Export templates for brochures and social assets (MEDIA-005 / MEDIA-006).
 * Renders use catalog property data only — toggles never invent attributes.
 */
export const brochureTemplates = pgTable('brochure_templates', {
  id: uuid().defaultRandom().primaryKey(),
  /** Stable admin/seed key, e.g. demo-brochure-a4. */
  key: text().notNull().unique(),
  /** brochure_pdf | social_image */
  kind: text().notNull(),
  /** a4_pdf | feed_1080x1350 | square_1080 | story_1080x1920 | landscape_1200x630 */
  format: text().notNull(),
  /** Primary content locale for labels in the template. */
  locale: text().notNull().default('bg'),
  nameBg: text().notNull(),
  nameEn: text().notNull(),
  /** Default element visibility for new export jobs. */
  defaultToggles: jsonb().$type<Record<string, boolean>>().notNull(),
  /** Optional badge preset key: new | exclusive | price_reduced | sold | investment | ''. */
  badgePreset: text().notNull().default(''),
  isActive: boolean().notNull().default(true),
  archivedAt: timestamp({ withTimezone: true }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

/** Append-only brochure/social export jobs for audit and re-download (MEDIA-005). */
export const brochureExports = pgTable('brochure_exports', {
  id: uuid().defaultRandom().primaryKey(),
  propertyId: uuid()
    .notNull()
    .references(() => properties.id, { onDelete: 'cascade' }),
  templateId: uuid()
    .notNull()
    .references(() => brochureTemplates.id, { onDelete: 'restrict' }),
  format: text().notNull(),
  toggles: jsonb().$type<Record<string, boolean>>().notNull(),
  listingUrl: text().notNull(),
  storageKey: text().notNull(),
  fileName: text().notNull(),
  contentType: text().notNull().default('application/pdf'),
  byteSize: integer().notNull().default(0),
  generatedByUserId: uuid().references(() => users.id),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
