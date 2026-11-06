import { describe, expect, it } from 'vitest';

import {
  brochureElementTogglesSchema,
  buildChannelCopySnippets,
  CHANNEL_COPY_CHANNELS,
  DEFAULT_BROCHURE_TOGGLES,
  DEFAULT_SOCIAL_TOGGLES,
} from './brochures.ts';

describe('brochure element toggles', () => {
  it('accepts default brochure and social toggle sets', () => {
    expect(brochureElementTogglesSchema.parse(DEFAULT_BROCHURE_TOGGLES)).toEqual(
      DEFAULT_BROCHURE_TOGGLES,
    );
    expect(brochureElementTogglesSchema.parse(DEFAULT_SOCIAL_TOGGLES).description).toBe(false);
  });
});

describe('buildChannelCopySnippets', () => {
  const property = {
    referenceNumber: 'LI-100',
    titleBg: 'Апартамент в центъра',
    titleEn: 'Apartment in the centre',
    descriptionBg: 'Светъл апартамент с две спални и тераса.',
    descriptionEn: 'Bright apartment with two bedrooms and a terrace.',
    price: '250000',
    currency: 'EUR',
    city: 'Sofia',
    district: 'Centre',
    area: '98',
    agentName: 'Demo Agent',
    agentPhone: '+359888000111',
  };

  it('builds BG/EN short and long texts for every channel from catalog fields', () => {
    const snippets = buildChannelCopySnippets(property, 'https://example.com/obiavi/demo/');
    expect(snippets).toHaveLength(CHANNEL_COPY_CHANNELS.length * 2 * 2);
    const fbShortBg = snippets.find(
      (row) => row.channel === 'facebook' && row.locale === 'bg' && row.length === 'short',
    );
    expect(fbShortBg?.text).toContain('Апартамент в центъра');
    expect(fbShortBg?.text).toContain('250000 EUR');
    expect(fbShortBg?.text).toContain('https://example.com/obiavi/demo/');
    const emailLongEn = snippets.find(
      (row) => row.channel === 'email' && row.locale === 'en' && row.length === 'long',
    );
    expect(emailLongEn?.text).toContain('Demo Agent');
    expect(emailLongEn?.text).toContain('LI-100');
  });
});
