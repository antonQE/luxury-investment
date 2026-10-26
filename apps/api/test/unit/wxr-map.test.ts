import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { mapWxrDocument } from '../../src/modules/migration/wxr-map.ts';
import { parseWxr } from '../../src/modules/migration/wxr-parse.ts';

const fixture = path.join(path.dirname(fileURLToPath(import.meta.url)), '../fixtures/wxr-mini.xml');

describe('WXR parse + map', () => {
  it('maps a mini WXR fixture to property, agent and article', () => {
    const xml = readFileSync(fixture, 'utf8');
    const doc = parseWxr(xml);
    expect(doc.items).toHaveLength(4);

    const report = mapWxrDocument(doc);
    expect(report.summary.propertiesPublished).toBe(1);
    expect(report.summary.agents).toBe(1);
    expect(report.summary.articles).toBe(1);
    expect(report.summary.attachments).toBe(1);

    const property = report.properties[0];
    expect(property).toMatchObject({
      referenceNumber: 'WP-30',
      slug: 'tristaen-malinova',
      transactionType: 'sale',
      propertyType: 'apartment',
      market: 'sofia',
      city: 'София',
      district: 'Малинова долина',
      price: '250000.00',
      bedrooms: 2,
      agentName: 'Demo Agent',
      agentPhone: '+359 888 111 222',
      listingStatus: 'published',
    });
    expect(property?.imageUrls).toEqual([
      'https://luxuryinvestment.bg/wp-content/uploads/2024/01/demo.jpg',
    ]);
    expect(property?.badges).toContain('new');
  });
});
