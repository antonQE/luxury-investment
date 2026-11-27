import {
  boolean,
  date,
  index,
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

/** Site-wide page views and clicks (not property-bound). */
export const siteEvents = pgTable(
  'site_events',
  {
    id: uuid().defaultRandom().primaryKey(),
    /** Locale-stripped path, e.g. `/properties` or `/team/demo-ivanova`. */
    path: text().notNull(),
    /** `page_view` | `click` */
    eventType: text().notNull(),
    /** Click label (link text / aria / data-analytics); empty for page_view. */
    label: text().notNull().default(''),
    /** Click href when available. */
    href: text().notNull().default(''),
    /** Short-lived session id (30 min idle). */
    sessionKey: text().notNull().default(''),
    /** Persistent visitor id (localStorage). */
    visitorKey: text().notNull().default(''),
    deviceClass: text().notNull().default(''),
    userAgent: text().notNull().default(''),
    isBot: integer().notNull().default(0),
    occurredAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('site_events_occurred_at_idx').on(table.occurredAt)],
);

/** Persistent first-party visitors (opaque keys, not PII). */
export const analyticsVisitors = pgTable('analytics_visitors', {
  visitorKey: text().primaryKey(),
  firstSeenAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  lastSeenAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

/** GA-style sessions derived from client session ids. */
export const analyticsSessions = pgTable(
  'analytics_sessions',
  {
    sessionKey: text().primaryKey(),
    visitorKey: text().notNull().default(''),
    startedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    pageviews: integer().notNull().default(0),
    engagedMs: integer().notNull().default(0),
    bounced: boolean().notNull().default(true),
  },
  (table) => [
    index('analytics_sessions_started_at_idx').on(table.startedAt),
    index('analytics_sessions_visitor_key_idx').on(table.visitorKey),
  ],
);

/**
 * Daily site Insight KPIs (additive where possible).
 * Period users are computed from analytics_sessions (distinct visitors), not by summing `users`.
 */
export const siteInsightDaily = pgTable(
  'site_insight_daily',
  {
    id: uuid().defaultRandom().primaryKey(),
    day: date().notNull(),
    sessions: integer().notNull().default(0),
    pageviews: integer().notNull().default(0),
    /** Distinct visitors active that calendar day (do not sum across days for period totals). */
    users: integer().notNull().default(0),
    newUsers: integer().notNull().default(0),
    engagedMsSum: integer().notNull().default(0),
    bouncedSessions: integer().notNull().default(0),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('site_insight_daily_day').on(table.day)],
);

export const siteEventDailyRollups = pgTable(
  'site_event_daily_rollups',
  {
    id: uuid().defaultRandom().primaryKey(),
    path: text().notNull(),
    eventType: text().notNull(),
    label: text().notNull().default(''),
    day: date().notNull(),
    eventCount: integer().notNull().default(0),
    uniqueSessions: integer().notNull().default(0),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('site_event_daily_rollups_path_type_label_day').on(
      table.path,
      table.eventType,
      table.label,
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
