import { boolean, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

/** Logical document (EPIC-13). Labels via `translations` (title, description). */
export const documents = pgTable('documents', {
  id: uuid().defaultRandom().primaryKey(),
  slug: text().notNull().unique(),
  /** Category: seller_handbook | power_of_attorney | declaration | contract_template | guide_other */
  kind: text().notNull(),
  /** public | internal */
  accessLevel: text().notNull().default('public'),
  /** Primary language of the file content. */
  locale: text().notNull().default('bg'),
  /** Optional provenance note (URL or short citation). */
  source: text().notNull().default(''),
  /** When true, public UIs must show a legal-sample disclaimer. */
  legalSample: boolean().notNull().default(false),
  /** Display name of the responsible editor (plain text for R2). */
  responsibleEditor: text().notNull().default(''),
  currentVersionId: uuid(),
  archivedAt: timestamp({ withTimezone: true }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const documentVersions = pgTable('document_versions', {
  id: uuid().defaultRandom().primaryKey(),
  documentId: uuid()
    .notNull()
    .references(() => documents.id),
  versionLabel: text().notNull(),
  /** Storage key under MEDIA_LOCAL_ROOT or absolute path key. */
  storageKey: text().notNull(),
  fileName: text().notNull(),
  contentType: text().notNull().default('application/pdf'),
  byteSize: integer().notNull().default(0),
  publishedAt: timestamp({ withTimezone: true }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const downloadEvents = pgTable('download_events', {
  id: uuid().defaultRandom().primaryKey(),
  documentId: uuid()
    .notNull()
    .references(() => documents.id),
  versionId: uuid()
    .notNull()
    .references(() => documentVersions.id),
  success: boolean().notNull().default(true),
  source: text(),
  referrer: text(),
  occurredAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
