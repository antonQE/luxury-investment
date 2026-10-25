import { z } from 'zod';

export const TRANSACTION_TYPES = ['sale', 'rent'] as const;
export const PROPERTY_TYPES = ['apartment', 'house', 'plot', 'office', 'hotel'] as const;
export const MARKETS = ['sofia', 'black_sea', 'dubai_abroad'] as const;

export const transactionTypeSchema = z.enum(TRANSACTION_TYPES);
export const propertyTypeSchema = z.enum(PROPERTY_TYPES);
export const marketSchema = z.enum(MARKETS);

export type TransactionType = z.infer<typeof transactionTypeSchema>;
export type PropertyType = z.infer<typeof propertyTypeSchema>;
export type Market = z.infer<typeof marketSchema>;

export const propertyListQuerySchema = z.object({
  transactionType: transactionTypeSchema.optional(),
  propertyType: propertyTypeSchema.optional(),
  market: marketSchema.optional(),
  offset: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(48).default(12),
});

export type PropertyListQuery = z.infer<typeof propertyListQuerySchema>;

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
  price: number;
  currency: string;
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
