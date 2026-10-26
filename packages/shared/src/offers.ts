import { z } from 'zod';

export const OFFER_TYPES = ['purchase', 'rent'] as const;
export type OfferType = (typeof OFFER_TYPES)[number];
export const offerTypeSchema = z.enum(OFFER_TYPES);

export const OFFER_STATUSES = [
  'draft',
  'submitted',
  'accepted',
  'rejected',
  'withdrawn',
  'expired',
] as const;
export type OfferStatus = (typeof OFFER_STATUSES)[number];
export const offerStatusSchema = z.enum(OFFER_STATUSES);

export const createOfferSchema = z.object({
  propertyId: z.uuid(),
  contactId: z.uuid(),
  type: offerTypeSchema,
  amount: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, 'invalid amount'),
  currency: z.string().trim().min(3).max(3).default('EUR'),
  validUntil: z.iso.date().nullable().optional(),
  terms: z.string().trim().max(4000).optional().default(''),
  status: offerStatusSchema.optional().default('submitted'),
});

export type CreateOfferInput = z.infer<typeof createOfferSchema>;

export const updateOfferSchema = z.object({
  type: offerTypeSchema.optional(),
  amount: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, 'invalid amount')
    .optional(),
  currency: z.string().trim().min(3).max(3).optional(),
  validUntil: z.iso.date().nullable().optional(),
  terms: z.string().trim().max(4000).optional(),
  status: offerStatusSchema.optional(),
});

export type UpdateOfferInput = z.infer<typeof updateOfferSchema>;

export const listOffersQuerySchema = z.object({
  propertyId: z.uuid().optional(),
  contactId: z.uuid().optional(),
  status: offerStatusSchema.optional(),
});

export type ListOffersQuery = z.infer<typeof listOffersQuerySchema>;
