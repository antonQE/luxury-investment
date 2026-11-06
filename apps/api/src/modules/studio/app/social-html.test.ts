import { DEFAULT_SOCIAL_TOGGLES } from '@luxury-investment/shared';
import { describe, expect, it } from 'vitest';

import { buildSocialHtml } from './social-html.ts';

describe('buildSocialHtml', () => {
  it('renders badge and catalog title without inventing fields', () => {
    const html = buildSocialHtml({
      property: {
        referenceNumber: 'DEMO-1',
        slug: 'demo',
        titleBg: 'Демо имот',
        titleEn: 'Demo property',
        descriptionBg: '',
        descriptionEn: '',
        price: '200000',
        currency: 'EUR',
        city: 'София',
        district: null,
        area: '80',
        agentName: 'Agent',
        agentPhone: '000',
        imageUrls: ['https://example.com/cover.jpg'],
        badges: [],
        locale: 'bg',
      },
      toggles: DEFAULT_SOCIAL_TOGGLES,
      badgePreset: 'new',
      size: { width: 1080, height: 1350 },
    });
    expect(html).toContain('Демо имот');
    expect(html).toContain('Нова оферта');
    expect(html).toContain('200000 EUR');
    expect(html).toContain('1080px');
  });
});
