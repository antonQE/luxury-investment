import { eq } from 'drizzle-orm';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import {
  properties,
  propertyPriceHistory,
  propertySlugHistory,
} from '../../src/infrastructure/db/schema.ts';
import { PropertyHistoryService } from '../../src/modules/properties/app/property-history-service.ts';
import { connectTestDatabase, resetDatabase } from '../helpers/database.ts';

const connection = connectTestDatabase();

const sample = {
  referenceNumber: 'HIST-1',
  slug: 'history-test-listing',
  titleBg: 'История',
  titleEn: 'History',
  excerptBg: 'x',
  excerptEn: 'x',
  descriptionBg: 'x',
  descriptionEn: 'x',
  transactionType: 'sale',
  propertyType: 'apartment',
  market: 'sofia',
  country: 'BG',
  city: 'Sofia',
  district: null,
  price: '200000.00',
  currency: 'EUR',
  area: '80.00',
  builtUpArea: '80.00',
  primaryArea: 'built_up',
  primaryAreaLabelBg: 'Застроена площ',
  primaryAreaLabelEn: 'Built-up area',
  badges: [],
  attributeValues: {},
  imageUrls: ['https://example.com/a.jpg'],
  agentName: 'Demo',
  agentPhone: '+359 000',
  listingStatus: 'published',
  publishedAt: new Date('2026-10-01T10:00:00Z'),
};

beforeEach(async () => {
  await resetDatabase(connection);
  await connection.db.insert(properties).values(sample);
});

afterAll(async () => {
  await connection.close();
});

describe('PropertyHistoryService', () => {
  it('records price changes and resolves old slugs', async () => {
    const history = new PropertyHistoryService(connection.db);
    const [row] = await connection.db
      .select()
      .from(properties)
      .where(eq(properties.slug, sample.slug))
      .limit(1);
    if (row === undefined) throw new Error('missing property');

    await history.recordPriceChange({
      propertyId: row.id,
      price: '210000.00',
      currency: 'EUR',
      note: 'market adjustment',
    });

    const prices = await connection.db.select().from(propertyPriceHistory);
    expect(prices).toHaveLength(1);
    expect(prices[0]?.price).toBe('210000.00');

    await history.recordSlugChange({
      propertyId: row.id,
      previousSlug: 'history-test-listing',
    });
    await connection.db
      .update(properties)
      .set({ slug: 'history-test-listing-v2', updatedAt: new Date() })
      .where(eq(properties.id, row.id));

    const slugs = await connection.db.select().from(propertySlugHistory);
    expect(slugs).toHaveLength(1);

    const resolved = await history.resolveSlug('history-test-listing');
    expect(resolved).toEqual({
      currentSlug: 'history-test-listing-v2',
      propertyId: row.id,
    });

    const current = await history.resolveSlug('history-test-listing-v2');
    expect(current?.currentSlug).toBe('history-test-listing-v2');

    expect(await history.resolveSlug('never-existed')).toBeNull();
  });
});
