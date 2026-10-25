import { integer, pgTable, primaryKey, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';

/** Location hierarchy kinds (ADR-0009). */
export const LOCATION_KINDS = ['country', 'region', 'city', 'district', 'complex'] as const;

export type LocationKind = (typeof LOCATION_KINDS)[number];

export const locations = pgTable(
  'locations',
  {
    id: uuid().defaultRandom().primaryKey(),
    kind: text().notNull(),
    slug: text().notNull(),
    parentId: uuid(),
    code: text(),
    sortOrder: integer().notNull().default(0),
    archivedAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique('locations_kind_slug_unique').on(table.kind, table.slug)],
);

/**
 * Generic translations for catalog entities (ADR-0009).
 * entityType examples: location, market, property_type, badge, attribute_definition.
 */
export const translations = pgTable(
  'translations',
  {
    entityType: text().notNull(),
    entityId: uuid().notNull(),
    locale: text().notNull(),
    field: text().notNull(),
    value: text().notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.entityType, table.entityId, table.locale, table.field],
    }),
  ],
);
