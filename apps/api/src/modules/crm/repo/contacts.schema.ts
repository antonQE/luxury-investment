import { pgTable, primaryKey, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const contacts = pgTable('contacts', {
  id: uuid().defaultRandom().primaryKey(),
  kind: text().notNull(),
  displayName: text().notNull(),
  email: text(),
  phone: text(),
  preferredLocale: text().notNull().default('bg'),
  preferredChannel: text(),
  notes: text().notNull().default(''),
  legalBasis: text(),
  archivedAt: timestamp({ withTimezone: true }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const contactRoles = pgTable(
  'contact_roles',
  {
    contactId: uuid()
      .notNull()
      .references(() => contacts.id, { onDelete: 'cascade' }),
    role: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.contactId, table.role] })],
);
