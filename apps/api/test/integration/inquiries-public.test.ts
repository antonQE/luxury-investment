import { pino } from 'pino';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.ts';
import { inquiries } from '../../src/infrastructure/db/schema.ts';
import { inquiryPublicRouter } from '../../src/modules/inquiries/handlers/inquiry-public-handlers.ts';
import { InquiryRepo } from '../../src/modules/inquiries/repo/inquiry-repo.ts';
import { connectTestDatabase, resetDatabase } from '../helpers/database.ts';

const connection = connectTestDatabase();
const app = createApp({
  env: { API_CORS_ORIGINS: [] },
  logger: pino({ level: 'silent' }),
  publicRouters: [inquiryPublicRouter(new InquiryRepo(connection.db))],
});

const validBody = {
  type: 'inquiry',
  propertySlug: 'demo-test-apartment',
  name: 'Demo Visitor',
  email: 'visitor@example.com',
  phone: '+359 000 111 222',
  message: 'Interested in a viewing next week.',
  consent: true,
  website: '',
};

beforeEach(async () => {
  await resetDatabase(connection);
});

afterAll(async () => {
  await connection.close();
});

describe('POST /v1/public/inquiries', () => {
  it('stores a valid inquiry', async () => {
    const res = await request(app).post('/v1/public/inquiries').send(validBody).expect(201);
    const body = res.body as { data: { id: string } };
    expect(body.data.id).toBeTruthy();
    const rows = await connection.db.select().from(inquiries);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.email).toBe('visitor@example.com');
  });

  it('rejects a filled honeypot', async () => {
    await request(app)
      .post('/v1/public/inquiries')
      .send({ ...validBody, website: 'http://spam.example' })
      .expect(400);
  });

  it('rejects missing consent', async () => {
    await request(app)
      .post('/v1/public/inquiries')
      .send({ ...validBody, consent: false })
      .expect(400);
  });
});
