import { z } from 'zod';

/** R1 focuses on the seller handbook; more kinds arrive with the full library. */
export const DOCUMENT_KINDS = ['seller_handbook'] as const;
export type DocumentKind = (typeof DOCUMENT_KINDS)[number];
export const documentKindSchema = z.enum(DOCUMENT_KINDS);

export const DOCUMENT_ACCESS_LEVELS = ['public', 'internal'] as const;
export type DocumentAccessLevel = (typeof DOCUMENT_ACCESS_LEVELS)[number];
export const documentAccessLevelSchema = z.enum(DOCUMENT_ACCESS_LEVELS);

export const SELLER_HANDBOOK_SLUG = 'seller-handbook' as const;
