import { boolean, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

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

/**
 * Campaign / template landing pages composed of ordered typed sections (CONTENT-003).
 * Not shown in main nav unless `showInNav` is true (LI-091+).
 */
export const landingPages = pgTable('landing_pages', {
  id: uuid().defaultRandom().primaryKey(),
  slug: text().notNull().unique(),
  /** Stable seed/admin key, e.g. demo-sellers. */
  key: text().notNull().unique(),
  /** draft | published | archived */
  status: text().notNull().default('draft'),
  titleBg: text().notNull(),
  titleEn: text().notNull(),
  seoTitleBg: text().notNull().default(''),
  seoTitleEn: text().notNull().default(''),
  seoDescriptionBg: text().notNull().default(''),
  seoDescriptionEn: text().notNull().default(''),
  /** index,follow | noindex,follow | noindex,nofollow */
  robots: text().notNull().default('index,follow'),
  showInNav: boolean().notNull().default(false),
  /** Optional campaign / UTM content key for inquiry attribution. */
  campaignKey: text().notNull().default(''),
  publishedAt: timestamp({ withTimezone: true }),
  sortOrder: integer().notNull().default(0),
  archivedAt: timestamp({ withTimezone: true }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

/** Ordered section payloads for a landing (validated by shared zod schemas). */
export const landingSections = pgTable('landing_sections', {
  id: uuid().defaultRandom().primaryKey(),
  landingPageId: uuid()
    .notNull()
    .references(() => landingPages.id, { onDelete: 'cascade' }),
  /** hero | benefits | services | process | related_listings | testimonials | team | faq | cta_form */
  type: text().notNull(),
  sortOrder: integer().notNull().default(0),
  payload: jsonb().$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
