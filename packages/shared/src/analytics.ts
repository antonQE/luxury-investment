import { z } from 'zod';

export const PROPERTY_EVENT_TYPES = [
  'page_view',
  'gallery_open',
  'contact_click',
  'phone_click',
  'email_click',
  'form_submit',
  'brochure_click',
  'share_click',
  'favorite_click',
  'calculator_open',
  'viewing_request',
] as const;
export type PropertyEventType = (typeof PROPERTY_EVENT_TYPES)[number];
export const propertyEventTypeSchema = z.enum(PROPERTY_EVENT_TYPES);

export const ingestPropertyEventSchema = z.object({
  propertyId: z.uuid(),
  eventType: propertyEventTypeSchema,
  /** Opaque client session key for unique-visitor rollups (not PII). */
  sessionKey: z.string().trim().min(8).max(128).optional(),
  source: z.string().trim().max(80).optional().default(''),
  deviceClass: z.string().trim().max(40).optional().default(''),
  /** Honeypot — bots that fill this are ignored with a fake 201. */
  website: z.string().optional(),
});
export type IngestPropertyEventInput = z.infer<typeof ingestPropertyEventSchema>;

export const OWNER_REPORT_KINDS = ['short', 'detailed'] as const;
export type OwnerReportKind = (typeof OWNER_REPORT_KINDS)[number];
export const ownerReportKindSchema = z.enum(OWNER_REPORT_KINDS);

export const generateOwnerReportSchema = z.object({
  propertyId: z.uuid(),
  kind: ownerReportKindSchema.optional().default('short'),
  /** Inclusive YYYY-MM-DD; omit both for "since first publication". */
  periodFrom: z.iso.date().nullable().optional(),
  periodTo: z.iso.date().nullable().optional(),
  brokerComment: z.string().trim().max(8000).optional().default(''),
});
export type GenerateOwnerReportInput = z.infer<typeof generateOwnerReportSchema>;

export const listOwnerReportsQuerySchema = z.object({
  propertyId: z.uuid(),
});
export type ListOwnerReportsQuery = z.infer<typeof listOwnerReportsQuerySchema>;
