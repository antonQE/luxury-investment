import { DEFAULT_BROCHURE_TOGGLES } from '@luxury-investment/shared';
import { describe, expect, it } from 'vitest';

import { buildBrochureHtml } from './brochure-html.ts';

describe('buildBrochureHtml', () => {
  it('includes catalog fields when toggles are on and omits inventing attributes', () => {
    const html = buildBrochureHtml({
      property: {
        referenceNumber: 'DEMO-1001',
        slug: 'demo-tristaen-malinova-dolina',
        titleBg: 'Demo апартамент',
        titleEn: 'Demo apartment',
        descriptionBg: 'Описание',
        descriptionEn: 'Description',
        price: '285000.00',
        currency: 'EUR',
        city: 'София',
        district: 'Малинова долина',
        area: '112.00',
        agentName: 'Demo Agent',
        agentPhone: '+359 000 000',
        imageUrls: ['https://example.com/a.jpg'],
        badges: ['exclusive'],
        locale: 'bg',
      },
      toggles: DEFAULT_BROCHURE_TOGGLES,
      listingUrl: 'http://localhost:3000/obiavi/demo-tristaen-malinova-dolina/',
      qrDataUrl: 'data:image/png;base64,abc',
    });

    expect(html).toContain('DEMO-1001');
    expect(html).toContain('285000.00 EUR');
    expect(html).toContain('http://localhost:3000/obiavi/demo-tristaen-malinova-dolina/');
    expect(html).not.toContain('invented');
  });

  it('hides price when toggled off', () => {
    const html = buildBrochureHtml({
      property: {
        referenceNumber: 'DEMO-1001',
        slug: 'demo',
        titleBg: 'T',
        titleEn: 'T',
        descriptionBg: '',
        descriptionEn: '',
        price: '100',
        currency: 'EUR',
        city: 'Sofia',
        district: null,
        area: '50',
        agentName: 'A',
        agentPhone: '0',
        imageUrls: [],
        badges: [],
        locale: 'en',
      },
      toggles: { ...DEFAULT_BROCHURE_TOGGLES, price: false },
      listingUrl: 'http://localhost:3000/obiavi/demo/',
      qrDataUrl: null,
    });
    expect(html).not.toContain('100 EUR');
  });
});
