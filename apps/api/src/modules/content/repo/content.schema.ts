import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

/** CMS articles (EPIC-12). Labels/body via `translations` (title, excerpt, body). */
export const articles = pgTable('articles', {
  id: uuid().defaultRandom().primaryKey(),
  slug: text().notNull().unique(),
  /** draft | published | archived */
  status: text().notNull().default('draft'),
  coverUrl: text(),
  /** Display name for R1; link to team_members later. */
  authorName: text(),
  publishedAt: timestamp({ withTimezone: true }),
  sortOrder: integer().notNull().default(0),
  archivedAt: timestamp({ withTimezone: true }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

/** CMS pages (EPIC-12). Labels/body via `translations` (title, body). */
export const pages = pgTable('pages', {
  id: uuid().defaultRandom().primaryKey(),
  slug: text().notNull().unique(),
  /** static | sell_with_us */
  kind: text().notNull().default('static'),
  /** draft | published | archived */
  status: text().notNull().default('draft'),
  heroUrl: text(),
  publishedAt: timestamp({ withTimezone: true }),
  sortOrder: integer().notNull().default(0),
  archivedAt: timestamp({ withTimezone: true }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
