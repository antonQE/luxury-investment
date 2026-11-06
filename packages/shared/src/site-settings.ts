import { z } from 'zod';

/** Stable keys for `site_settings` (ADR-0014). */
export const SITE_SETTING_KEYS = ['public_phone', 'public_email'] as const;
export type SiteSettingKey = (typeof SITE_SETTING_KEYS)[number];
export const siteSettingKeySchema = z.enum(SITE_SETTING_KEYS);

export const PUBLIC_PHONE_SETTING_KEY = 'public_phone' as const;
export const PUBLIC_EMAIL_SETTING_KEY = 'public_email' as const;

const emptyToNull = z
  .string()
  .trim()
  .nullable()
  .optional()
  .transform((value) => {
    if (value === undefined) return undefined;
    if (value === null || value === '') return null;
    return value;
  });

export const publicSiteSettingsSchema = z.object({
  publicPhone: z.string().trim().max(40).nullable(),
  publicEmail: z.string().trim().max(200).nullable(),
});
export type PublicSiteSettings = z.infer<typeof publicSiteSettingsSchema>;

export const updateSiteSettingsSchema = z.object({
  publicPhone: emptyToNull.pipe(z.string().max(40).nullable().optional()),
  publicEmail: emptyToNull.pipe(z.union([z.email().max(200), z.null()]).optional()),
});
export type UpdateSiteSettingsInput = z.infer<typeof updateSiteSettingsSchema>;

/** Build a `tel:` href from a display phone; returns null if empty. */
export function toTelHref(phone: string | null | undefined): string | null {
  if (phone === null || phone === undefined) return null;
  const trimmed = phone.trim();
  if (trimmed === '') return null;
  const digits = trimmed.replace(/[^\d+]/g, '');
  if (digits === '' || digits === '+') return null;
  return `tel:${digits}`;
}

/** Build a `mailto:` href; returns null if empty. */
export function toMailtoHref(email: string | null | undefined): string | null {
  if (email === null || email === undefined) return null;
  const trimmed = email.trim();
  if (trimmed === '') return null;
  return `mailto:${trimmed}`;
}
