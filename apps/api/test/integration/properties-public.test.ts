import type { PublicProperty } from '@luxury-investment/shared';
import { pino } from 'pino';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.ts';
import { properties } from '../../src/infrastructure/db/schema.ts';
import { propertyPublicRouter } from '../../src/modules/properties/handlers/property-public-handlers.ts';
import { PropertyRepo } from '../../src/modules/properties/repo/property-repo.ts';
import { connectTestDatabase, resetDatabase } from '../helpers/database.ts';

const connection = connectTestDatabase();
const app = createApp({
  env: { API_CORS_ORIGINS: [] },
  logger: pino({ level: 'silent' }),
  publicRouters: [propertyPublicRouter(new PropertyRepo(connection.db))],
});

const sample = {
  referenceNumber: 'DEMO-TEST-1',
  slug: 'demo-test-apartment',
  titleBg: 'Demo: Тестов апартамент',
  titleEn: 'Demo: Test apartment',
  excerptBg: 'Кратко BG.',
  excerptEn: 'Short EN.',
  descriptionBg: 'Описание BG.',
  descriptionEn: 'Description EN.',
  transactionType: 'sale',
  propertyType: 'apartment',
  market: 'sofia',
  country: 'България',
  city: 'София',
  district: 'Лозенец',
  price: '199000.00',
  currency: 'EUR',
  vatLabel: 'incl. VAT',
  bedrooms: 2,
  bathrooms: 1,
  area: '88.50',
  builtUpArea: '88.50',
  areaWithCommonParts: '95.00',
  primaryArea: 'built_up',
  primaryAreaLabelBg: 'Застроена площ',
  primaryAreaLabelEn: 'Built-up area',
  constructionStage: 'act_16',
  badges: ['new'],
  attributeValues: {},
  imageUrls: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'],
  agentName: 'Demo Agent',
  agentPhone: '+359 000 000 000',
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

interface ListItem {
  slug: string;
  title: string;
  coverUrl: string | null;
  description?: string;
  imageUrls?: string[];
}

interface ListBody {
  data: ListItem[];
  total: number;
}

interface ItemBody {
  data: PublicProperty;
}

interface ErrorBody {
  error: { code: string };
}

describe('GET /v1/public/properties', () => {
  it('returns the newest listings in the requested locale', async () => {
    const res = await request(app).get('/v1/public/properties?lang=en').expect(200);
    const body = res.body as ListBody;
    expect(body.total).toBe(1);
    expect(body.data[0]).toMatchObject({
      slug: 'demo-test-apartment',
      title: 'Demo: Test apartment',
      primaryAreaLabel: 'Built-up area',
      price: 199000,
      area: 88.5,
      market: 'sofia',
      coverUrl: sample.imageUrls[0],
    });
    expect(body.data[0]?.description).toBeUndefined();
    expect(body.data[0]?.imageUrls).toBeUndefined();
  });

  it('filters by market and rejects unknown query values', async () => {
    const empty = await request(app).get('/v1/public/properties?market=black_sea').expect(200);
    expect(empty.body as ListBody).toMatchObject({ data: [], total: 0 });

    const invalid = await request(app).get('/v1/public/properties?market=moon').expect(400);
    expect((invalid.body as ErrorBody).error.code).toBe('VALIDATION_FAILED');
  });

  it('filters by reference/q, city, bedrooms and price range', async () => {
    const byRef = await request(app).get('/v1/public/properties?q=DEMO-TEST-1').expect(200);
    expect((byRef.body as ListBody).total).toBe(1);

    const byCity = await request(app)
      .get('/v1/public/properties?city=%D0%A1%D0%BE%D1%84')
      .expect(200);
    expect((byCity.body as ListBody).total).toBe(1);

    const byBedrooms = await request(app).get('/v1/public/properties?bedroomsMin=3').expect(200);
    expect((byBedrooms.body as ListBody).total).toBe(0);

    const byPrice = await request(app)
      .get('/v1/public/properties?priceMin=100000&priceMax=250000')
      .expect(200);
    expect((byPrice.body as ListBody).total).toBe(1);

    const missPrice = await request(app).get('/v1/public/properties?priceMax=1000').expect(200);
    expect((missPrice.body as ListBody).total).toBe(0);
  });

  it('hides draft listings from the public list and detail', async () => {
    await connection.db.insert(properties).values({
      ...sample,
      referenceNumber: 'DEMO-DRAFT-TEST',
      slug: 'demo-draft-hidden-test',
      listingStatus: 'draft',
      publishedAt: null,
    });

    const list = await request(app).get('/v1/public/properties').expect(200);
    expect((list.body as ListBody).data.every((row) => row.slug !== 'demo-draft-hidden-test')).toBe(
      true,
    );

    await request(app).get('/v1/public/properties/demo-draft-hidden-test').expect(404);
  });
});

describe('GET /v1/public/properties/:slug', () => {
  it('returns a listing or 404', async () => {
    const found = await request(app)
      .get('/v1/public/properties/demo-test-apartment?lang=bg')
      .expect(200);
    const item = (found.body as ItemBody).data;
    expect(item.title).toBe('Demo: Тестов апартамент');
    expect(item.locationPrecision).toBe('approximate');
    expect(item.mapQuery).toContain('София');
    expect(item).not.toHaveProperty('latitude');

    const missing = await request(app).get('/v1/public/properties/no-such-listing').expect(404);
    expect((missing.body as ErrorBody).error.code).toBe('NOT_FOUND');
  });
});

describe('GET /v1/public/properties/:slug/similar', () => {
  it('returns same market and type excluding self', async () => {
    await connection.db.insert(properties).values({
      ...sample,
      referenceNumber: 'DEMO-TEST-2',
      slug: 'demo-test-apartment-2',
      titleBg: 'Demo: Втори апартамент',
      titleEn: 'Demo: Second apartment',
      publishedAt: new Date('2026-10-02T10:00:00Z'),
    });
    await connection.db.insert(properties).values({
      ...sample,
      referenceNumber: 'DEMO-TEST-3',
      slug: 'demo-test-house',
      propertyType: 'house',
      titleBg: 'Demo: Къща',
      titleEn: 'Demo: House',
    });

    const res = await request(app)
      .get('/v1/public/properties/demo-test-apartment/similar?lang=en')
      .expect(200);
    const body = res.body as ListBody;
    expect(body.data).toHaveLength(1);
    expect(body.data[0]?.slug).toBe('demo-test-apartment-2');
  });
});
