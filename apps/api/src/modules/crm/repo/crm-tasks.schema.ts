import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { inquiries } from '../../inquiries/repo/inquiries.schema.ts';
import { properties } from '../../properties/repo/properties.schema.ts';
import { users } from '../../users/repo/users.schema.ts';
import { contacts } from './contacts.schema.ts';
import { viewings } from './viewings.schema.ts';

export const crmTasks = pgTable('crm_tasks', {
  id: uuid().defaultRandom().primaryKey(),
  title: text().notNull(),
  notes: text().notNull().default(''),
  kind: text().notNull().default('manual'),
  status: text().notNull().default('open'),
  assigneeId: uuid()
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  dueAt: timestamp({ withTimezone: true }).notNull(),
  relatedInquiryId: uuid().references(() => inquiries.id, { onDelete: 'set null' }),
  relatedViewingId: uuid().references(() => viewings.id, { onDelete: 'set null' }),
  relatedPropertyId: uuid().references(() => properties.id, { onDelete: 'set null' }),
  relatedContactId: uuid().references(() => contacts.id, { onDelete: 'set null' }),
  completedAt: timestamp({ withTimezone: true }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
