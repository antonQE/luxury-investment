import { describe, expect, it } from 'vitest';

import { toMailtoHref, toTelHref, updateSiteSettingsSchema } from './site-settings.ts';

describe('toTelHref', () => {
  it('strips spaces and keeps leading plus', () => {
    expect(toTelHref('+359 2 000 00 00')).toBe('tel:+35920000000');
  });

  it('returns null for empty values', () => {
    expect(toTelHref(null)).toBeNull();
    expect(toTelHref('')).toBeNull();
    expect(toTelHref('   ')).toBeNull();
  });
});

describe('toMailtoHref', () => {
  it('builds mailto from email', () => {
    expect(toMailtoHref('hello@example.com')).toBe('mailto:hello@example.com');
  });

  it('returns null for empty values', () => {
    expect(toMailtoHref(null)).toBeNull();
    expect(toMailtoHref('')).toBeNull();
  });
});

describe('updateSiteSettingsSchema', () => {
  it('turns empty strings into null', () => {
    expect(updateSiteSettingsSchema.parse({ publicPhone: '  ' }).publicPhone).toBeNull();
    expect(updateSiteSettingsSchema.parse({ publicEmail: '' }).publicEmail).toBeNull();
  });

  it('accepts a valid email', () => {
    expect(
      updateSiteSettingsSchema.parse({ publicEmail: 'office@luxuryinvestment.bg' }).publicEmail,
    ).toBe('office@luxuryinvestment.bg');
  });
});
