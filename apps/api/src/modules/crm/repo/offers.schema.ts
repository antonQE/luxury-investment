import { date, numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { properties } from '../../properties/repo/properties.schema.ts';
import { contacts } from './contacts.schema.ts';

export const offers = pgTable('offers', {
  id: uuid().defaultRandom().primaryKey(),
  propertyId: uuid()
    .notNull()
    .references(() => properties.id, { onDelete: 'cascade' }),
  contactId: uuid()
    .notNull()
    .references(() => contacts.id, { onDelete: 'restrict' }),
  type: text().notNull(),
  amount: numeric({ precision: 14, scale: 2 }).notNull(),
  currency: text().notNull().default('EUR'),
  validUntil: date(),
  terms: text().notNull().default(''),
  status: text().notNull().default('submitted'),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
