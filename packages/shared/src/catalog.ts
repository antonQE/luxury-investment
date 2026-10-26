import { z } from 'zod';

import type { PriceEquivalent } from './exchange-rates.ts';

export const TRANSACTION_TYPES = ['sale', 'rent'] as const;
export const PROPERTY_TYPES = ['apartment', 'house', 'plot', 'office', 'hotel'] as const;
export const MARKETS = ['sofia', 'black_sea', 'dubai_abroad'] as const;
export const PRIMARY_AREA_KEYS = ['built_up', 'with_common'] as const;
export const PROPERTY_LISTING_STATUSES = ['draft', 'published', 'archived'] as const;

export const transactionTypeSchema = z.enum(TRANSACTION_TYPES);
export const propertyTypeSchema = z.enum(PROPERTY_TYPES);
export const marketSchema = z.enum(MARKETS);
export const primaryAreaKeySchema = z.enum(PRIMARY_AREA_KEYS);
export const propertyListingStatusSchema = z.enum(PROPERTY_LISTING_STATUSES);

export type TransactionType = z.infer<typeof transactionTypeSchema>;
export type PropertyType = z.infer<typeof propertyTypeSchema>;
export type Market = z.infer<typeof marketSchema>;
export type PrimaryAreaKey = z.infer<typeof primaryAreaKeySchema>;
export type PropertyListingStatus = z.infer<typeof propertyListingStatusSchema>;

const optionalTrimmed = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().trim().min(1).max(120).optional(),
);

const optionalNonNegNumber = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.coerce.number().nonnegative().optional(),
);

export const propertyListQuerySchema = z.object({
  transactionType: transactionTypeSchema.optional(),
  propertyType: propertyTypeSchema.optional(),
  market: marketSchema.optional(),
  city: optionalTrimmed,
  district: optionalTrimmed,
  bedroomsMin: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.coerce.number().int().min(0).max(20).optional(),
  ),
  priceMin: optionalNonNegNumber,
  priceMax: optionalNonNegNumber,
  /**
   * Currency of priceMin/priceMax for mixed-currency normalization.
   * Defaults to EUR; listings without a rate to this currency are excluded from price bounds.
   */
  priceCurrency: z.preprocess(
    (value) =>
      typeof value === 'string' && value.trim() !== '' ? value.trim().toUpperCase() : undefined,
    z
      .string()
      .regex(/^[A-Z]{3}$/)
      .optional(),
  ),
  /** Request a display equivalent in this currency when a rate exists. */
  displayCurrency: z.preprocess(
    (value) =>
      typeof value === 'string' && value.trim() !== '' ? value.trim().toUpperCase() : undefined,
    z
      .string()
      .regex(/^[A-Z]{3}$/)
      .optional(),
  ),
  areaMin: optionalNonNegNumber,
  areaMax: optionalNonNegNumber,
  /** Reference number or free-text match against titles. */
  q: optionalTrimmed,
  offset: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(48).default(12),
});

export type PropertyListQuery = z.infer<typeof propertyListQuerySchema>;

/** Card/list payload — no description, single cover image. */
export interface PublicPropertyListItem {
  id: string;
  referenceNumber: string;
  slug: string;
  title: string;
  excerpt: string;
  transactionType: TransactionType;
  propertyType: PropertyType;
  market: Market;
  country: string;
  city: string;
  district: string | null;
  price: number;
  currency: string;
  /** Display equivalent in another currency when an FX rate exists; never replaces `price`. */
  priceEquivalent: PriceEquivalent | null;
  vatLabel: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number;
  primaryAreaLabel: string;
  constructionStage: string | null;
  badges: string[];
  coverUrl: string | null;
  agentName: string;
  publishedAt: string;
}

export interface PublicProperty {
  id: string;
  referenceNumber: string;
  slug: string;
  title: string;
  excerpt: string;
  description: string;
  transactionType: TransactionType;
  propertyType: PropertyType;
  market: Market;
  country: string;
  city: string;
  district: string | null;
  /**
   * R1 always `approximate` (city/district query only). Exact coordinates
   * stay internal until the locations epic exposes a public flag.
   */
  locationPrecision: 'approximate' | 'exact';
  /** Safe text for a Maps search URL — never raw lat/lng when approximate. */
  mapQuery: string;
  price: number;
  currency: string;
  /** Display equivalent in another currency when an FX rate exists; never replaces `price`. */
  priceEquivalent: PriceEquivalent | null;
  vatLabel: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number;
  primaryAreaLabel: string;
  constructionStage: string | null;
  badges: string[];
  imageUrls: string[];
  agentName: string;
  agentPhone: string;
  publishedAt: string;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  offset: number;
  limit: number;
}
