import { z } from 'zod';

export const VIEWING_STATUSES = [
  'scheduled',
  'confirmed',
  'rescheduled',
  'declined',
  'completed',
  'cancelled',
] as const;
export type ViewingStatus = (typeof VIEWING_STATUSES)[number];
export const viewingStatusSchema = z.enum(VIEWING_STATUSES);

export const createViewingSchema = z.object({
  propertyId: z.uuid(),
  contactId: z.uuid(),
  agentId: z.uuid(),
  inquiryId: z.uuid().nullable().optional(),
  scheduledAt: z.iso.datetime(),
  endsAt: z.iso.datetime().nullable().optional(),
  locationNote: z.string().trim().max(500).optional().default(''),
  accessInstructions: z.string().trim().max(2000).optional().default(''),
  status: viewingStatusSchema.optional().default('scheduled'),
  outcomeNote: z.string().trim().max(2000).optional().default(''),
  nextActionNote: z.string().trim().max(2000).optional().default(''),
});

export type CreateViewingInput = z.infer<typeof createViewingSchema>;

export const updateViewingSchema = z.object({
  propertyId: z.uuid().optional(),
  contactId: z.uuid().optional(),
  agentId: z.uuid().optional(),
  inquiryId: z.uuid().nullable().optional(),
  scheduledAt: z.iso.datetime().optional(),
  endsAt: z.iso.datetime().nullable().optional(),
  locationNote: z.string().trim().max(500).optional(),
  accessInstructions: z.string().trim().max(2000).optional(),
  status: viewingStatusSchema.optional(),
  outcomeNote: z.string().trim().max(2000).optional(),
  nextActionNote: z.string().trim().max(2000).optional(),
});

export type UpdateViewingInput = z.infer<typeof updateViewingSchema>;

export const listViewingsQuerySchema = z.object({
  from: z.iso.datetime().optional(),
  to: z.iso.datetime().optional(),
  propertyId: z.uuid().optional(),
  agentId: z.uuid().optional(),
  status: viewingStatusSchema.optional(),
});

export type ListViewingsQuery = z.infer<typeof listViewingsQuerySchema>;
