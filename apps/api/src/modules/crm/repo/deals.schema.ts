import { numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { properties } from '../../properties/repo/properties.schema.ts';
import { contacts } from './contacts.schema.ts';
import { offers } from './offers.schema.ts';

export const deals = pgTable('deals', {
  id: uuid().defaultRandom().primaryKey(),
  propertyId: uuid()
    .notNull()
    .references(() => properties.id, { onDelete: 'cascade' }),
  buyerContactId: uuid()
    .notNull()
    .references(() => contacts.id, { onDelete: 'restrict' }),
  sellerContactId: uuid().references(() => contacts.id, { onDelete: 'set null' }),
  offerId: uuid().references(() => offers.id, { onDelete: 'set null' }),
  stage: text().notNull().default('negotiation'),
  agreedPrice: numeric({ precision: 14, scale: 2 }),
  currency: text().notNull().default('EUR'),
  commissionAmount: numeric({ precision: 14, scale: 2 }),
  notes: text().notNull().default(''),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
