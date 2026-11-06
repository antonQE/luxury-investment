import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

/** Key-value agency settings for the public site shell (ADR-0014). */
export const siteSettings = pgTable('site_settings', {
  key: text().primaryKey(),
  value: text().notNull().default(''),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
