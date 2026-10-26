import { z } from 'zod';

export const PROPERTY_INQUIRY_TYPES = ['inquiry', 'viewing'] as const;
export type PropertyInquiryType = (typeof PROPERTY_INQUIRY_TYPES)[number];

export const INQUIRY_TYPES = [...PROPERTY_INQUIRY_TYPES, 'consultation'] as const;
export type InquiryType = (typeof INQUIRY_TYPES)[number];

export const INQUIRY_STATUSES = ['new', 'in_progress', 'closed'] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];
export const inquiryStatusSchema = z.enum(INQUIRY_STATUSES);

export const createInquirySchema = z.object({
  type: z.enum(INQUIRY_TYPES),
  propertySlug: z.string().min(1).max(200),
  name: z.string().trim().min(2).max(120),
  email: z.email().max(200),
  phone: z.string().trim().min(6).max(40),
  message: z.string().trim().min(1).max(2000),
  consent: z.literal(true),
  /** Honeypot — must stay empty (bots fill hidden fields). */
  website: z.string().max(0).optional().default(''),
});

export type CreateInquiryInput = z.infer<typeof createInquirySchema>;

export const updateInquiryStatusSchema = z.object({
  status: inquiryStatusSchema,
});

export type UpdateInquiryStatusInput = z.infer<typeof updateInquiryStatusSchema>;
