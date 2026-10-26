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

const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'invalid slug');

export const createDocumentSchema = z.object({
  slug: slugSchema,
  kind: documentCategorySchema,
  accessLevel: documentAccessLevelSchema.optional().default('public'),
  locale: documentLocaleSchema.optional().default('bg'),
  source: z.string().trim().max(500).optional().default(''),
  legalSample: z.boolean().optional().default(false),
  responsibleEditor: z.string().trim().max(200).optional().default(''),
  titleBg: z.string().trim().min(1).max(300),
  titleEn: z.string().trim().min(1).max(300),
  descriptionBg: z.string().trim().max(4000).optional().default(''),
  descriptionEn: z.string().trim().max(4000).optional().default(''),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;

export const updateDocumentSchema = z.object({
  kind: documentCategorySchema.optional(),
  accessLevel: documentAccessLevelSchema.optional(),
  locale: documentLocaleSchema.optional(),
  source: z.string().trim().max(500).optional(),
  legalSample: z.boolean().optional(),
  responsibleEditor: z.string().trim().max(200).optional(),
  titleBg: z.string().trim().min(1).max(300).optional(),
  titleEn: z.string().trim().min(1).max(300).optional(),
  descriptionBg: z.string().trim().max(4000).optional(),
  descriptionEn: z.string().trim().max(4000).optional(),
});

export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;

export const listDocumentsQuerySchema = z
  .object({
    includeArchived: z.union([z.boolean(), z.enum(['true', 'false'])]).optional(),
    kind: documentCategorySchema.optional(),
  })
  .transform((query) => ({
    includeArchived: query.includeArchived === true || query.includeArchived === 'true',
    kind: query.kind,
  }));

export type ListDocumentsQuery = z.infer<typeof listDocumentsQuerySchema>;
