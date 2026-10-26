import { z } from 'zod';

export const DEAL_STAGES = [
  'negotiation',
  'preliminary',
  'financing',
  'notary',
  'closed',
  'cancelled',
] as const;
export type DealStage = (typeof DEAL_STAGES)[number];
export const dealStageSchema = z.enum(DEAL_STAGES);

const money = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, 'invalid amount');

export const createDealSchema = z.object({
  propertyId: z.uuid(),
  buyerContactId: z.uuid(),
  sellerContactId: z.uuid().nullable().optional(),
  offerId: z.uuid().nullable().optional(),
  stage: dealStageSchema.optional().default('negotiation'),
  agreedPrice: money.nullable().optional(),
  currency: z.string().trim().min(3).max(3).optional().default('EUR'),
  commissionAmount: money.nullable().optional(),
  notes: z.string().trim().max(4000).optional().default(''),
});

export type CreateDealInput = z.infer<typeof createDealSchema>;

export const updateDealSchema = z.object({
  buyerContactId: z.uuid().optional(),
  sellerContactId: z.uuid().nullable().optional(),
  offerId: z.uuid().nullable().optional(),
  stage: dealStageSchema.optional(),
  agreedPrice: money.nullable().optional(),
  currency: z.string().trim().min(3).max(3).optional(),
  commissionAmount: money.nullable().optional(),
  notes: z.string().trim().max(4000).optional(),
});

export type UpdateDealInput = z.infer<typeof updateDealSchema>;

export const listDealsQuerySchema = z.object({
  stage: dealStageSchema.optional(),
  propertyId: z.uuid().optional(),
});

export type ListDealsQuery = z.infer<typeof listDealsQuerySchema>;
