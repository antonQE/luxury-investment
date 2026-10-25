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
  primaryAreaLabelBg: 'Застроена площ',
  primaryAreaLabelEn: 'Built-up area',
  constructionStage: 'act_16',
  badges: ['new'],
  imageUrls: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'],
  agentName: 'Demo Agent',
  agentPhone: '+359 000 000 000',
  publishedAt: new Date('2026-10-01T10:00:00Z'),
};

beforeEach(async () => {
  await resetDatabase(connection);
  await connection.db.insert(properties).values(sample);
});

afterAll(async () => {
  await connection.close();
});

interface ListBody {
  data: PublicProperty[];
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
    });
  });

  it('filters by market and rejects unknown query values', async () => {
    const empty = await request(app).get('/v1/public/properties?market=black_sea').expect(200);
    expect(empty.body as ListBody).toMatchObject({ data: [], total: 0 });

    const invalid = await request(app).get('/v1/public/properties?market=moon').expect(400);
    expect((invalid.body as ErrorBody).error.code).toBe('VALIDATION_FAILED');
  });
});

describe('GET /v1/public/properties/:slug', () => {
  it('returns a listing or 404', async () => {
    const found = await request(app)
      .get('/v1/public/properties/demo-test-apartment?lang=bg')
      .expect(200);
    expect((found.body as ItemBody).data.title).toBe('Demo: Тестов апартамент');

    const missing = await request(app).get('/v1/public/properties/no-such-listing').expect(404);
    expect((missing.body as ErrorBody).error.code).toBe('NOT_FOUND');
  });
});
