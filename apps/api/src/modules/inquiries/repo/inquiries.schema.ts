import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { contacts } from '../../crm/repo/contacts.schema.ts';
import { users } from '../../users/repo/users.schema.ts';

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
  contactId: uuid().references(() => contacts.id, { onDelete: 'set null' }),
  source: text(),
  utmSource: text(),
  utmMedium: text(),
  utmCampaign: text(),
  utmTerm: text(),
  utmContent: text(),
  assignedAgentId: uuid().references(() => users.id, { onDelete: 'set null' }),
  funnelStage: text().notNull().default('new'),
  nextActionAt: timestamp({ withTimezone: true }),
  nextActionNote: text(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
