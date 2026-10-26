import { date, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';

import { properties } from '../../properties/repo/properties.schema.ts';
import { contacts } from './contacts.schema.ts';

export const propertyOwnerships = pgTable(
  'property_ownerships',
  {
    id: uuid().defaultRandom().primaryKey(),
    propertyId: uuid()
      .notNull()
      .references(() => properties.id, { onDelete: 'cascade' }),
    contactId: uuid()
      .notNull()
      .references(() => contacts.id, { onDelete: 'cascade' }),
    role: text().notNull(),
    agreementStartsOn: date(),
    agreementEndsOn: date(),
    notes: text().notNull().default(''),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.propertyId, table.contactId)],
);
