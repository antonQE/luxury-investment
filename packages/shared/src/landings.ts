import { z } from 'zod';

/** Managed section kinds for campaign landings (CONTENT-003). */
export const LANDING_SECTION_TYPES = [
  'hero',
  'benefits',
  'services',
  'process',
  'related_listings',
  'testimonials',
  'team',
  'faq',
  'cta_form',
] as const;
export type LandingSectionType = (typeof LANDING_SECTION_TYPES)[number];
export const landingSectionTypeSchema = z.enum(LANDING_SECTION_TYPES);

const localizedString = z.string().trim().max(4000);

const localizedPairSchema = z.object({
  bg: localizedString,
  en: localizedString,
});

export const landingHeroPayloadSchema = z.object({
  headline: localizedPairSchema,
  subheadline: localizedPairSchema.optional(),
  imageUrl: z.string().trim().max(2000).optional(),
  ctaLabel: localizedPairSchema.optional(),
  ctaHref: z.string().trim().max(500).optional(),
});
export type LandingHeroPayload = z.infer<typeof landingHeroPayloadSchema>;

export const landingBenefitsPayloadSchema = z.object({
  title: localizedPairSchema.optional(),
  items: z
    .array(
      z.object({
        title: localizedPairSchema,
        body: localizedPairSchema.optional(),
      }),
    )
    .max(12),
});
export type LandingBenefitsPayload = z.infer<typeof landingBenefitsPayloadSchema>;

export const landingServicesPayloadSchema = z.object({
  title: localizedPairSchema.optional(),
  items: z
    .array(
      z.object({
        title: localizedPairSchema,
        body: localizedPairSchema.optional(),
      }),
    )
    .max(12),
});
export type LandingServicesPayload = z.infer<typeof landingServicesPayloadSchema>;

export const landingProcessPayloadSchema = z.object({
  title: localizedPairSchema.optional(),
  steps: z
    .array(
      z.object({
        title: localizedPairSchema,
        body: localizedPairSchema.optional(),
      }),
    )
    .max(8),
});
export type LandingProcessPayload = z.infer<typeof landingProcessPayloadSchema>;

/** Saved catalog filter for curated SEO landings (SEO-001). No offset — always first page. */
export const landingListingFilterSchema = z.object({
  transactionType: z.enum(['sale', 'rent']).optional(),
  propertyType: z.enum(['apartment', 'house', 'plot', 'office', 'hotel']).optional(),
  market: z.enum(['sofia', 'black_sea', 'dubai_abroad']).optional(),
  city: z.string().trim().min(1).max(120).optional(),
  district: z.string().trim().min(1).max(120).optional(),
  bedroomsMin: z.number().int().min(0).max(20).optional(),
  priceMin: z.number().nonnegative().optional(),
  priceMax: z.number().nonnegative().optional(),
  areaMin: z.number().nonnegative().optional(),
  areaMax: z.number().nonnegative().optional(),
  limit: z.number().int().min(1).max(24).optional().default(12),
});
export type LandingListingFilter = z.infer<typeof landingListingFilterSchema>;

export const landingRelatedListingsPayloadSchema = z.object({
  title: localizedPairSchema.optional(),
  /** Explicit property IDs; empty = use `filter` when set. */
  propertyIds: z.array(z.uuid()).max(24).default([]),
  /** Curated SEO filter query bound to this section. */
  filter: landingListingFilterSchema.optional(),
});
export type LandingRelatedListingsPayload = z.infer<typeof landingRelatedListingsPayloadSchema>;

export const landingTestimonialsPayloadSchema = z.object({
  title: localizedPairSchema.optional(),
  items: z
    .array(
      z.object({
        quote: localizedPairSchema,
        authorName: z.string().trim().min(1).max(200),
        source: z.string().trim().max(200).optional(),
        verified: z.boolean().default(true),
      }),
    )
    .max(12),
});
export type LandingTestimonialsPayload = z.infer<typeof landingTestimonialsPayloadSchema>;

export const landingTeamPayloadSchema = z.object({
  title: localizedPairSchema.optional(),
  /** Team member IDs from the team catalogue; empty = use default public team. */
  teamMemberIds: z.array(z.uuid()).max(24).default([]),
});
export type LandingTeamPayload = z.infer<typeof landingTeamPayloadSchema>;

export const landingFaqPayloadSchema = z.object({
  title: localizedPairSchema.optional(),
  items: z
    .array(
      z.object({
        question: localizedPairSchema,
        answer: localizedPairSchema,
      }),
    )
    .max(20),
});
export type LandingFaqPayload = z.infer<typeof landingFaqPayloadSchema>;

export const landingCtaFormPayloadSchema = z.object({
  title: localizedPairSchema.optional(),
  body: localizedPairSchema.optional(),
  /** Inquiry source key recorded with submissions from this section. */
  inquirySource: z.string().trim().min(1).max(80).default('landing'),
  submitLabel: localizedPairSchema.optional(),
});
export type LandingCtaFormPayload = z.infer<typeof landingCtaFormPayloadSchema>;

export const landingSectionPayloadSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('hero'), payload: landingHeroPayloadSchema }),
  z.object({ type: z.literal('benefits'), payload: landingBenefitsPayloadSchema }),
  z.object({ type: z.literal('services'), payload: landingServicesPayloadSchema }),
  z.object({ type: z.literal('process'), payload: landingProcessPayloadSchema }),
  z.object({ type: z.literal('related_listings'), payload: landingRelatedListingsPayloadSchema }),
  z.object({ type: z.literal('testimonials'), payload: landingTestimonialsPayloadSchema }),
  z.object({ type: z.literal('team'), payload: landingTeamPayloadSchema }),
  z.object({ type: z.literal('faq'), payload: landingFaqPayloadSchema }),
  z.object({ type: z.literal('cta_form'), payload: landingCtaFormPayloadSchema }),
]);
export type LandingSectionPayload = z.infer<typeof landingSectionPayloadSchema>;

export const landingRobotsSchema = z.enum(['index,follow', 'noindex,follow', 'noindex,nofollow']);
export type LandingRobots = z.infer<typeof landingRobotsSchema>;

export const DEMO_SELLERS_LANDING_SLUG = 'za-prodavachi';

/** Localized public landing DTO (CONTENT-003). */
export interface PublicLandingSection {
  id: string;
  type: LandingSectionType;
  sortOrder: number;
  payload: Record<string, unknown>;
}

export interface PublicLanding {
  id: string;
  slug: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  robots: LandingRobots;
  showInNav: boolean;
  campaignKey: string;
  publishedAt: string | null;
  sections: PublicLandingSection[];
}

export function parseLandingSection(
  type: LandingSectionType,
  payload: unknown,
): LandingSectionPayload {
  return landingSectionPayloadSchema.parse({ type, payload });
}

const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const landingKeySchema = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const landingSectionInputSchema = z.object({
  type: landingSectionTypeSchema,
  payload: z.unknown(),
});
export type LandingSectionInput = z.infer<typeof landingSectionInputSchema>;

export const createLandingPageSchema = z.object({
  key: landingKeySchema,
  slug: slugSchema,
  titleBg: z.string().trim().min(1).max(300),
  titleEn: z.string().trim().min(1).max(300),
  seoTitleBg: z.string().trim().max(300).optional().default(''),
  seoTitleEn: z.string().trim().max(300).optional().default(''),
  seoDescriptionBg: z.string().trim().max(1000).optional().default(''),
  seoDescriptionEn: z.string().trim().max(1000).optional().default(''),
  robots: landingRobotsSchema.optional().default('index,follow'),
  showInNav: z.boolean().optional().default(false),
  campaignKey: z.string().trim().max(120).optional().default(''),
  sortOrder: z.number().int().optional().default(0),
  sections: z.array(landingSectionInputSchema).max(40).optional().default([]),
});
export type CreateLandingPageInput = z.infer<typeof createLandingPageSchema>;

export const updateLandingPageSchema = z.object({
  slug: slugSchema.optional(),
  titleBg: z.string().trim().min(1).max(300).optional(),
  titleEn: z.string().trim().min(1).max(300).optional(),
  seoTitleBg: z.string().trim().max(300).optional(),
  seoTitleEn: z.string().trim().max(300).optional(),
  seoDescriptionBg: z.string().trim().max(1000).optional(),
  seoDescriptionEn: z.string().trim().max(1000).optional(),
  robots: landingRobotsSchema.optional(),
  showInNav: z.boolean().optional(),
  campaignKey: z.string().trim().max(120).optional(),
  sortOrder: z.number().int().optional(),
  /** When provided, replaces the full ordered section list. */
  sections: z.array(landingSectionInputSchema).max(40).optional(),
});
export type UpdateLandingPageInput = z.infer<typeof updateLandingPageSchema>;

/** Validate each section payload against its type schema. */
export function validateLandingSections(sections: LandingSectionInput[]): LandingSectionPayload[] {
  return sections.map((section) => parseLandingSection(section.type, section.payload));
}
