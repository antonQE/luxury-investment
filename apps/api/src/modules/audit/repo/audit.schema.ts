import { jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const auditEntries = pgTable('audit_entries', {
  id: uuid().defaultRandom().primaryKey(),
  actorUserId: uuid(),
  actorEmail: text(),
  action: text().notNull(),
  resourceType: text().notNull(),
  resourceId: text(),
  metadata: jsonb().$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
