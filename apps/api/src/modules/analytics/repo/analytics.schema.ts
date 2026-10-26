import {
  date,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { properties } from '../../properties/repo/properties.schema.ts';
import { users } from '../../users/repo/users.schema.ts';

/** Raw property interaction events (ANL-001). */
export const propertyEvents = pgTable('property_events', {
  id: uuid().defaultRandom().primaryKey(),
  propertyId: uuid()
    .notNull()
    .references(() => properties.id, { onDelete: 'cascade' }),
  eventType: text().notNull(),
  /** Opaque session key for unique-visitor estimates (not PII). */
  sessionKey: text().notNull().default(''),
  source: text().notNull().default(''),
  deviceClass: text().notNull().default(''),
  userAgent: text().notNull().default(''),
  isBot: integer().notNull().default(0),
  occurredAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

/** Daily rollups per property + event type (ANL-001 / ANL-002). */
export const propertyEventDailyRollups = pgTable(
  'property_event_daily_rollups',
  {
    id: uuid().defaultRandom().primaryKey(),
    propertyId: uuid()
      .notNull()
      .references(() => properties.id, { onDelete: 'cascade' }),
    eventType: text().notNull(),
    day: date().notNull(),
    eventCount: integer().notNull().default(0),
    uniqueSessions: integer().notNull().default(0),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('property_event_daily_rollups_property_type_day').on(
      table.propertyId,
      table.eventType,
      table.day,
    ),
  ],
);

/** Append-only owner report snapshots (RPT-001). Payload never includes buyer PII. */
export const ownerReportSnapshots = pgTable('owner_report_snapshots', {
  id: uuid().defaultRandom().primaryKey(),
  propertyId: uuid()
    .notNull()
    .references(() => properties.id, { onDelete: 'cascade' }),
  kind: text().notNull().default('short'),
  periodFrom: date(),
  periodTo: date(),
  generatedByUserId: uuid().references(() => users.id),
  brokerComment: text().notNull().default(''),
  /** JSON snapshot: views, inquiries/viewings/offers counts, price history, methodology. */
  payload: jsonb().notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
