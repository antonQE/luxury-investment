import { z } from 'zod';

/** Location hierarchy kinds (ADR-0009). */
export const LOCATION_KINDS = ['country', 'region', 'city', 'district', 'complex'] as const;

export type LocationKind = (typeof LOCATION_KINDS)[number];

export const locationKindSchema = z.enum(LOCATION_KINDS);

/** Admin taxonomy list kinds — URL segment maps to a table. */
export const TAXONOMY_KINDS = [
  'markets',
  'property_types',
  'transaction_types',
  'badges',
  'construction_stages',
  'listing_statuses',
] as const;

export type TaxonomyKind = (typeof TAXONOMY_KINDS)[number];

export const taxonomyKindSchema = z.enum(TAXONOMY_KINDS);

/** Translation entity_type for each taxonomy kind. */
export const TAXONOMY_ENTITY_TYPES: Record<TaxonomyKind, string> = {
  markets: 'market',
  property_types: 'property_type',
  transaction_types: 'transaction_type',
  badges: 'badge',
  construction_stages: 'construction_stage',
  listing_statuses: 'listing_status',
};
