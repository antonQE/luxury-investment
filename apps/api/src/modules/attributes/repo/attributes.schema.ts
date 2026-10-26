import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

export const attributeDefinitions = pgTable('attribute_definitions', {
  id: uuid().defaultRandom().primaryKey(),
  key: text().notNull().unique(),
  dataType: text().notNull(),
  unit: text(),
  /** Soft validation hints as JSON, e.g. `{ "min": 0, "max": 100 }`. */
  validation: jsonb().$type<Record<string, unknown>>().notNull().default({}),
  /** Empty = all property types; otherwise list of property_type keys. */
  appliesToPropertyTypes: jsonb().$type<string[]>().notNull().default([]),
  /** Empty = all markets; otherwise list of market keys. */
  appliesToMarkets: jsonb().$type<string[]>().notNull().default([]),
  required: boolean().notNull().default(false),
  isPublic: boolean().notNull().default(true),
  filterable: boolean().notNull().default(false),
  sortOrder: integer().notNull().default(0),
  archivedAt: timestamp({ withTimezone: true }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const attributeOptions = pgTable(
  'attribute_options',
  {
    id: uuid().defaultRandom().primaryKey(),
    definitionId: uuid()
      .notNull()
      .references(() => attributeDefinitions.id, { onDelete: 'cascade' }),
    key: text().notNull(),
    sortOrder: integer().notNull().default(0),
    archivedAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique('attribute_options_definition_key_unique').on(table.definitionId, table.key)],
);
