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

export const SITE_EVENT_TYPES = ['page_view', 'click'] as const;
export type SiteEventType = (typeof SITE_EVENT_TYPES)[number];
export const siteEventTypeSchema = z.enum(SITE_EVENT_TYPES);

export const ingestSiteEventSchema = z.object({
  path: z.string().trim().min(1).max(300),
  eventType: siteEventTypeSchema,
  label: z.string().trim().max(200).optional().default(''),
  href: z.string().trim().max(500).optional().default(''),
  sessionKey: z.string().trim().min(8).max(128).optional(),
  deviceClass: z.string().trim().max(40).optional().default(''),
  website: z.string().optional(),
});
export type IngestSiteEventInput = z.infer<typeof ingestSiteEventSchema>;

export const siteAnalyticsQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(90).optional().default(30),
});
export type SiteAnalyticsQuery = z.infer<typeof siteAnalyticsQuerySchema>;

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
