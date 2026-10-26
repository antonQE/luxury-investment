import { date, numeric, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';

/**
 * FX rates for display equivalents and mixed-currency filter normalization (MARKET-002).
 * `rate` means: 1 baseCurrency = rate quoteCurrency.
 */
export const exchangeRates = pgTable(
  'exchange_rates',
  {
    id: uuid().defaultRandom().primaryKey(),
    baseCurrency: text().notNull(),
    quoteCurrency: text().notNull(),
    rate: numeric({ precision: 18, scale: 8 }).notNull(),
    asOf: date().notNull(),
    source: text().notNull().default(''),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.baseCurrency, table.quoteCurrency, table.asOf)],
);
