import { z } from 'zod';

/** Output family for a marketing export template (MEDIA-005 / MEDIA-006). */
export const BROCHURE_TEMPLATE_KINDS = ['brochure_pdf', 'social_image'] as const;
export type BrochureTemplateKind = (typeof BROCHURE_TEMPLATE_KINDS)[number];
export const brochureTemplateKindSchema = z.enum(BROCHURE_TEMPLATE_KINDS);

/**
 * Concrete render size / page format.
 * Social sizes match MEDIA-006; brochure is A4 portrait PDF.
 */
export const BROCHURE_TEMPLATE_FORMATS = [
  'a4_pdf',
  'feed_1080x1350',
  'square_1080',
  'story_1080x1920',
  'landscape_1200x630',
] as const;
export type BrochureTemplateFormat = (typeof BROCHURE_TEMPLATE_FORMATS)[number];
export const brochureTemplateFormatSchema = z.enum(BROCHURE_TEMPLATE_FORMATS);

/** Elements staff may toggle before export (catalog data only — never invent fields). */
export const BROCHURE_TOGGLE_KEYS = [
  'logo',
  'price',
  'referenceNumber',
  'photos',
  'description',
  'contact',
  'qr',
  'area',
  'location',
  'badges',
] as const;
export type BrochureToggleKey = (typeof BROCHURE_TOGGLE_KEYS)[number];
export const brochureToggleKeySchema = z.enum(BROCHURE_TOGGLE_KEYS);

export const brochureElementTogglesSchema = z.object({
  logo: z.boolean(),
  price: z.boolean(),
  referenceNumber: z.boolean(),
  photos: z.boolean(),
  description: z.boolean(),
  contact: z.boolean(),
  qr: z.boolean(),
  area: z.boolean(),
  location: z.boolean(),
  badges: z.boolean(),
});
export type BrochureElementToggles = z.infer<typeof brochureElementTogglesSchema>;

export const DEFAULT_BROCHURE_TOGGLES: BrochureElementToggles = {
  logo: true,
  price: true,
  referenceNumber: true,
  photos: true,
  description: true,
  contact: true,
  qr: true,
  area: true,
  location: true,
  badges: true,
};

export const DEFAULT_SOCIAL_TOGGLES: BrochureElementToggles = {
  logo: true,
  price: true,
  referenceNumber: false,
  photos: true,
  description: false,
  contact: true,
  qr: false,
  area: true,
  location: true,
  badges: true,
};

/** Stable seed keys for demo templates. */
export const DEMO_BROCHURE_A4_KEY = 'demo-brochure-a4';
export const DEMO_SOCIAL_FEED_KEY = 'demo-social-feed';
export const DEMO_SOCIAL_SQUARE_KEY = 'demo-social-square';

export const SOCIAL_BADGE_PRESETS = [
  '',
  'new',
  'exclusive',
  'price_reduced',
  'sold',
  'investment',
] as const;
export type SocialBadgePreset = (typeof SOCIAL_BADGE_PRESETS)[number];
export const socialBadgePresetSchema = z.enum(SOCIAL_BADGE_PRESETS);

/** Pixel size per social format (MEDIA-006). */
export const SOCIAL_FORMAT_SIZE: Record<
  Exclude<BrochureTemplateFormat, 'a4_pdf'>,
  { width: number; height: number }
> = {
  feed_1080x1350: { width: 1080, height: 1350 },
  square_1080: { width: 1080, height: 1080 },
  story_1080x1920: { width: 1080, height: 1920 },
  landscape_1200x630: { width: 1200, height: 630 },
};

export const generateBrochureSchema = z.object({
  propertyId: z.uuid(),
  /** Defaults to demo A4 brochure template when omitted. */
  templateKey: z.string().trim().min(1).max(120).optional().default(DEMO_BROCHURE_A4_KEY),
  toggles: brochureElementTogglesSchema.partial().optional(),
});
export type GenerateBrochureInput = z.infer<typeof generateBrochureSchema>;

export const generateSocialAssetSchema = z.object({
  propertyId: z.uuid(),
  /** Defaults to demo Instagram feed template when omitted. */
  templateKey: z.string().trim().min(1).max(120).optional().default(DEMO_SOCIAL_FEED_KEY),
  toggles: brochureElementTogglesSchema.partial().optional(),
  /** Overrides template badgePreset when set. */
  badgePreset: socialBadgePresetSchema.optional(),
});
export type GenerateSocialAssetInput = z.infer<typeof generateSocialAssetSchema>;

/** Marketing channel keys for MEDIA-006 copy snippets (no auto-publish). */
export const CHANNEL_COPY_CHANNELS = [
  'facebook',
  'instagram',
  'tiktok',
  'linkedin',
  'email',
] as const;
export type ChannelCopyChannel = (typeof CHANNEL_COPY_CHANNELS)[number];
export const channelCopyChannelSchema = z.enum(CHANNEL_COPY_CHANNELS);

export const CHANNEL_COPY_LENGTHS = ['short', 'long'] as const;
export type ChannelCopyLength = (typeof CHANNEL_COPY_LENGTHS)[number];
export const channelCopyLengthSchema = z.enum(CHANNEL_COPY_LENGTHS);

export const channelCopyQuerySchema = z.object({
  propertyId: z.uuid(),
});
export type ChannelCopyQuery = z.infer<typeof channelCopyQuerySchema>;

export interface ChannelCopyPropertyFields {
  referenceNumber: string;
  titleBg: string;
  titleEn: string;
  descriptionBg: string;
  descriptionEn: string;
  price: string;
  currency: string;
  city: string;
  district: string | null;
  area: string;
  agentName: string;
  agentPhone: string;
}

export interface ChannelCopySnippet {
  channel: ChannelCopyChannel;
  locale: 'bg' | 'en';
  length: ChannelCopyLength;
  text: string;
}

function truncate(value: string, max: number): string {
  const trimmed = value.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

function locationLine(city: string, district: string | null): string {
  return [city, district].filter((part) => part !== null && part !== '').join(', ');
}

/**
 * Build channel texts from catalog fields only (template strings — no AI).
 * Staff must review before any manual publish (MEDIA-006).
 */
export function buildChannelCopySnippets(
  property: ChannelCopyPropertyFields,
  listingUrl: string,
): ChannelCopySnippet[] {
  const location = locationLine(property.city, property.district);
  const priceLabel = `${property.price} ${property.currency}`;
  const areaLabel = `${property.area} m²`;
  const snippets: ChannelCopySnippet[] = [];

  for (const channel of CHANNEL_COPY_CHANNELS) {
    for (const locale of ['bg', 'en'] as const) {
      const title = locale === 'bg' ? property.titleBg : property.titleEn;
      const description = locale === 'bg' ? property.descriptionBg : property.descriptionEn;
      const hashtags =
        locale === 'bg'
          ? '#луксозниимоти #LuxuryInvestment #недвижимиимоти'
          : '#LuxuryRealEstate #LuxuryInvestment #Sofia';

      for (const length of CHANNEL_COPY_LENGTHS) {
        const desc = length === 'short' ? truncate(description, 180) : truncate(description, 600);
        let text: string;

        if (channel === 'email') {
          if (locale === 'bg') {
            text =
              length === 'short'
                ? `${title}\n${location} · ${areaLabel} · ${priceLabel}\nРеф. ${property.referenceNumber}\n${listingUrl}`
                : `Здравейте,\n\nПредставяме ви ${title}.\n\n${desc}\n\nЛокация: ${location}\nПлощ: ${areaLabel}\nЦена: ${priceLabel}\nРеф. ${property.referenceNumber}\n\nКонтакт: ${property.agentName}, ${property.agentPhone}\n${listingUrl}\n\nПоздрави,\nLuxury Investment`;
          } else {
            text =
              length === 'short'
                ? `${title}\n${location} · ${areaLabel} · ${priceLabel}\nRef. ${property.referenceNumber}\n${listingUrl}`
                : `Hello,\n\nWe are presenting ${title}.\n\n${desc}\n\nLocation: ${location}\nArea: ${areaLabel}\nPrice: ${priceLabel}\nRef. ${property.referenceNumber}\n\nContact: ${property.agentName}, ${property.agentPhone}\n${listingUrl}\n\nBest regards,\nLuxury Investment`;
          }
        } else if (length === 'short') {
          text =
            locale === 'bg'
              ? `${title}\n${location} · ${areaLabel} · ${priceLabel}\n${listingUrl}\n${hashtags}`
              : `${title}\n${location} · ${areaLabel} · ${priceLabel}\n${listingUrl}\n${hashtags}`;
        } else {
          text =
            locale === 'bg'
              ? `${title}\n\n${desc}\n\n${location} · ${areaLabel} · ${priceLabel}\nРеф. ${property.referenceNumber}\n${listingUrl}\n${hashtags}`
              : `${title}\n\n${desc}\n\n${location} · ${areaLabel} · ${priceLabel}\nRef. ${property.referenceNumber}\n${listingUrl}\n${hashtags}`;
        }

        snippets.push({ channel, locale, length, text });
      }
    }
  }

  return snippets;
}
