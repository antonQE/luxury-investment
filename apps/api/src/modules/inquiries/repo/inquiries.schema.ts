import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const inquiries = pgTable('inquiries', {
  id: uuid().defaultRandom().primaryKey(),
  type: text().notNull(),
  propertySlug: text().notNull(),
  name: text().notNull(),
  email: text().notNull(),
  phone: text().notNull(),
  message: text().notNull(),
  consent: boolean().notNull(),
  status: text().notNull().default('new'),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
