import {
  boolean,
  date,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

/** Per-country (optional property type) switch for each calculator kind. */
export const calculatorToggles = pgTable(
  'calculator_toggles',
  {
    id: uuid().defaultRandom().primaryKey(),
    kind: text().notNull(),
    countryCode: text().notNull(),
    /** Empty string = all property types. */
    propertyType: text().notNull().default(''),
    enabled: boolean().notNull().default(true),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.kind, table.countryCode, table.propertyType)],
);

/** Versioned rule set for one calculator kind in a country. */
export const calculatorRuleSets = pgTable('calculator_rule_sets', {
  id: uuid().defaultRandom().primaryKey(),
  countryCode: text().notNull(),
  /** Empty string = all property types. */
  propertyType: text().notNull().default(''),
  kind: text().notNull(),
  name: text().notNull(),
  currency: text().notNull().default('EUR'),
  validFrom: date().notNull(),
  validTo: date(),
  source: text().notNull().default(''),
  warning: text().notNull().default(''),
  archivedAt: timestamp({ withTimezone: true }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const calculatorRuleLines = pgTable('calculator_rule_lines', {
  id: uuid().defaultRandom().primaryKey(),
  ruleSetId: uuid()
    .notNull()
    .references(() => calculatorRuleSets.id, { onDelete: 'cascade' }),
  costGroup: text().notNull(),
  lineType: text().notNull(),
  rateValue: numeric({ precision: 14, scale: 6 }).notNull(),
  minAmount: numeric({ precision: 14, scale: 2 }),
  maxAmount: numeric({ precision: 14, scale: 2 }),
  optional: boolean().notNull().default(false),
  sortOrder: integer().notNull().default(0),
  labelBg: text().notNull(),
  labelEn: text().notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
