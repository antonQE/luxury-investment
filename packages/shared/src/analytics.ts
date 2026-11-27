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
  /** Short-lived session id. */
  sessionKey: z.string().trim().min(8).max(128).optional(),
  /** Persistent visitor id. */
  visitorKey: z.string().trim().min(8).max(128).optional(),
  deviceClass: z.string().trim().max(40).optional().default(''),
  website: z.string().optional(),
});
export type IngestSiteEventInput = z.infer<typeof ingestSiteEventSchema>;

export const ingestSiteSessionPingSchema = z.object({
  sessionKey: z.string().trim().min(8).max(128),
  visitorKey: z.string().trim().min(8).max(128).optional(),
  /** Engaged milliseconds since last ping (capped server-side). */
  engagedMsDelta: z.coerce.number().int().min(0).max(120_000),
  website: z.string().optional(),
});
export type IngestSiteSessionPingInput = z.infer<typeof ingestSiteSessionPingSchema>;

export const SITE_INSIGHT_RANGES = ['1d', '7d', '30d', '90d', '180d'] as const;
export type SiteInsightRange = (typeof SITE_INSIGHT_RANGES)[number];
export const siteInsightRangeSchema = z.enum(SITE_INSIGHT_RANGES);

export const siteInsightOverviewQuerySchema = z.object({
  range: siteInsightRangeSchema.optional().default('30d'),
});
export type SiteInsightOverviewQuery = z.infer<typeof siteInsightOverviewQuerySchema>;

export const siteAnalyticsQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(180).optional().default(30),
});
export type SiteAnalyticsQuery = z.infer<typeof siteAnalyticsQuerySchema>;

export function siteInsightRangeDays(range: SiteInsightRange): number {
  switch (range) {
    case '1d':
      return 1;
    case '7d':
      return 7;
    case '30d':
      return 30;
    case '90d':
      return 90;
    case '180d':
      return 180;
  }
}

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
