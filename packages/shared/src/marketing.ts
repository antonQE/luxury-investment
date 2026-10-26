import { z } from 'zod';

export const MARKETING_ACTIVITY_STATUSES = ['planned', 'in_progress', 'done', 'cancelled'] as const;
export type MarketingActivityStatus = (typeof MARKETING_ACTIVITY_STATUSES)[number];
export const marketingActivityStatusSchema = z.enum(MARKETING_ACTIVITY_STATUSES);

export const PORTAL_LISTING_STATUSES = ['draft', 'published', 'paused', 'removed'] as const;
export type PortalListingStatus = (typeof PORTAL_LISTING_STATUSES)[number];
export const portalListingStatusSchema = z.enum(PORTAL_LISTING_STATUSES);

export const createMarketingActivitySchema = z.object({
  propertyId: z.uuid(),
  activityType: z.string().trim().min(1).max(80),
  title: z.string().trim().min(1).max(200),
  ownerUserId: z.uuid().nullable().optional(),
  status: marketingActivityStatusSchema.optional().default('planned'),
  startsOn: z.iso.date().nullable().optional(),
  endsOn: z.iso.date().nullable().optional(),
  costAmount: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/)
    .nullable()
    .optional(),
  costCurrency: z.string().trim().min(3).max(3).optional().default('EUR'),
  resultNotes: z.string().trim().max(4000).optional().default(''),
  evidenceUrl: z.url().nullable().optional(),
  recurrence: z.string().trim().max(200).optional().default(''),
});

export type CreateMarketingActivityInput = z.infer<typeof createMarketingActivitySchema>;

export const updateMarketingActivitySchema = createMarketingActivitySchema
  .omit({ propertyId: true })
  .partial();
export type UpdateMarketingActivityInput = z.infer<typeof updateMarketingActivitySchema>;

export const createPortalListingSchema = z.object({
  propertyId: z.uuid(),
  portalName: z.string().trim().min(1).max(120),
  listingUrl: z.string().trim().max(2000).optional().default(''),
  status: portalListingStatusSchema.optional().default('draft'),
  publishedOn: z.iso.date().nullable().optional(),
  notes: z.string().trim().max(4000).optional().default(''),
});

export type CreatePortalListingInput = z.infer<typeof createPortalListingSchema>;

export const updatePortalListingSchema = createPortalListingSchema
  .omit({ propertyId: true })
  .partial();
export type UpdatePortalListingInput = z.infer<typeof updatePortalListingSchema>;

export const createPortalMeasurementSchema = z.object({
  measuredOn: z.iso.date(),
  periodLabel: z.string().trim().max(120).optional().default(''),
  views: z.number().int().min(0).optional().default(0),
  saves: z.number().int().min(0).optional().default(0),
  metricDefinition: z.string().trim().max(500).optional().default(''),
  evidenceUrl: z.url().nullable().optional(),
  notes: z.string().trim().max(2000).optional().default(''),
});

export type CreatePortalMeasurementInput = z.infer<typeof createPortalMeasurementSchema>;

export const listMarketingQuerySchema = z.object({
  propertyId: z.uuid(),
});

export type ListMarketingQuery = z.infer<typeof listMarketingQuerySchema>;

/** Build a UTM-tagged URL for a portal listing (MKT-003 helper). */
export function buildUtmUrl(
  baseUrl: string,
  params: { source: string; medium: string; campaign: string; content?: string },
): string {
  const parts = [
    `utm_source=${encodeURIComponent(params.source)}`,
    `utm_medium=${encodeURIComponent(params.medium)}`,
    `utm_campaign=${encodeURIComponent(params.campaign)}`,
  ];
  if (params.content !== undefined && params.content !== '') {
    parts.push(`utm_content=${encodeURIComponent(params.content)}`);
  }
  const joiner = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${joiner}${parts.join('&')}`;
}
