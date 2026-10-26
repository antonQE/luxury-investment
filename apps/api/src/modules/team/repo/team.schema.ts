import { boolean, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { users } from '../../users/repo/users.schema.ts';

/** Public/internal team profiles (EPIC-08). Labels via `translations`. */
export const teamMembers = pgTable('team_members', {
  id: uuid().defaultRandom().primaryKey(),
  slug: text().notNull().unique(),
  /** agent | staff | lawyer | partner */
  kind: text().notNull().default('agent'),
  userId: uuid().references(() => users.id),
  photoUrl: text(),
  email: text(),
  phone: text(),
  markets: jsonb().$type<string[]>().notNull().default([]),
  languages: jsonb().$type<string[]>().notNull().default([]),
  /** Plain text; only for the person who actually holds the credential. */
  qualifications: text(),
  sortOrder: integer().notNull().default(0),
  isPublic: boolean().notNull().default(true),
  archivedAt: timestamp({ withTimezone: true }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const offices = pgTable('offices', {
  id: uuid().defaultRandom().primaryKey(),
  slug: text().notNull().unique(),
  phone: text(),
  email: text(),
  /** Safe Maps query text — never exact coords when approximate. */
  mapQuery: text().notNull(),
  sortOrder: integer().notNull().default(0),
  isPublic: boolean().notNull().default(true),
  archivedAt: timestamp({ withTimezone: true }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const partners = pgTable('partners', {
  id: uuid().defaultRandom().primaryKey(),
  slug: text().notNull().unique(),
  logoUrl: text().notNull(),
  websiteUrl: text(),
  sortOrder: integer().notNull().default(0),
  isActive: boolean().notNull().default(true),
  archivedAt: timestamp({ withTimezone: true }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
