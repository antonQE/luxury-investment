import { z } from 'zod';

export const ATTRIBUTE_DATA_TYPES = [
  'text',
  'number',
  'boolean',
  'select',
  'multi_select',
] as const;

export type AttributeDataType = (typeof ATTRIBUTE_DATA_TYPES)[number];

export const attributeDataTypeSchema = z.enum(ATTRIBUTE_DATA_TYPES);

/** Seeded definition keys (LI-024). More keys can be added by admins later. */
export const SEEDED_ATTRIBUTE_KEYS = [
  'heating',
  'parking',
  'furnished',
  'floor',
  'dubai_community',
] as const;

export type SeededAttributeKey = (typeof SEEDED_ATTRIBUTE_KEYS)[number];

export const seededAttributeKeySchema = z.enum(SEEDED_ATTRIBUTE_KEYS);
