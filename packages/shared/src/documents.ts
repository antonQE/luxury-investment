import { z } from 'zod';

/** Public library groups (DOC-001). Stored on `documents.kind` for R1 compatibility. */
export const DOCUMENT_CATEGORIES = [
  'seller_handbook',
  'power_of_attorney',
  'declaration',
  'contract_template',
  'guide_other',
] as const;
export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];
export const documentCategorySchema = z.enum(DOCUMENT_CATEGORIES);

/** Alias of DOCUMENT_CATEGORIES (R1 column name was `kind`). */
export const DOCUMENT_KINDS = DOCUMENT_CATEGORIES;
export type DocumentKind = DocumentCategory;
export const documentKindSchema = documentCategorySchema;

export const DOCUMENT_ACCESS_LEVELS = ['public', 'internal'] as const;
export type DocumentAccessLevel = (typeof DOCUMENT_ACCESS_LEVELS)[number];
export const documentAccessLevelSchema = z.enum(DOCUMENT_ACCESS_LEVELS);

export const DOCUMENT_LOCALES = ['bg', 'en'] as const;
export type DocumentLocale = (typeof DOCUMENT_LOCALES)[number];
export const documentLocaleSchema = z.enum(DOCUMENT_LOCALES);

export const SELLER_HANDBOOK_SLUG = 'seller-handbook' as const;
export const DEMO_POWER_OF_ATTORNEY_SLUG = 'demo-power-of-attorney' as const;
