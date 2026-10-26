import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { inquiries } from '../../inquiries/repo/inquiries.schema.ts';
import { properties } from '../../properties/repo/properties.schema.ts';
import { users } from '../../users/repo/users.schema.ts';
import { contacts } from './contacts.schema.ts';

export const viewings = pgTable('viewings', {
  id: uuid().defaultRandom().primaryKey(),
  propertyId: uuid()
    .notNull()
    .references(() => properties.id, { onDelete: 'cascade' }),
  contactId: uuid()
    .notNull()
    .references(() => contacts.id, { onDelete: 'restrict' }),
  agentId: uuid()
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  inquiryId: uuid().references(() => inquiries.id, { onDelete: 'set null' }),
  scheduledAt: timestamp({ withTimezone: true }).notNull(),
  endsAt: timestamp({ withTimezone: true }),
  locationNote: text().notNull().default(''),
  accessInstructions: text().notNull().default(''),
  status: text().notNull().default('scheduled'),
  outcomeNote: text().notNull().default(''),
  nextActionNote: text().notNull().default(''),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
