import { eq } from 'drizzle-orm';
import { pino } from 'pino';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.ts';
import { contacts, inquiries } from '../../src/infrastructure/db/schema.ts';
import type { MailerPort } from '../../src/infrastructure/mailer/mailer-port.ts';
import { inquiryPublicRouter } from '../../src/modules/inquiries/handlers/inquiry-public-handlers.ts';
import { InquiryRepo } from '../../src/modules/inquiries/repo/inquiry-repo.ts';
import { connectTestDatabase, resetDatabase } from '../helpers/database.ts';

const connection = connectTestDatabase();
const logger = pino({ level: 'silent' });
const sent: { to: string; subject: string }[] = [];
const mailer: MailerPort = {
  send(message) {
    sent.push({ to: message.to, subject: message.subject });
    return Promise.resolve();
  },
};
const app = createApp({
  env: { API_CORS_ORIGINS: [], API_ADMIN_CORS_ORIGINS: [] },
  logger,
  publicRouters: [
    inquiryPublicRouter(new InquiryRepo(connection.db), mailer, 'agent@example.com', logger),
  ],
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
  sent.length = 0;
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
    expect(rows[0]?.source).toBe('property_form');
    expect(rows[0]?.funnelStage).toBe('new');
    expect(rows[0]?.contactId).toBeNull();
    expect(sent).toEqual([
      { to: 'agent@example.com', subject: '[LI] New inquiry: demo-test-apartment' },
    ]);
  });

  it('links an existing contact by email without overwriting it', async () => {
    const [contact] = await connection.db
      .insert(contacts)
      .values({
        kind: 'person',
        displayName: 'Existing Contact',
        email: 'visitor@example.com',
        phone: '+359 000 999 000',
        notes: 'Do not overwrite',
      })
      .returning({ id: contacts.id, displayName: contacts.displayName, phone: contacts.phone });
    expect(contact).toBeDefined();
    if (contact === undefined) throw new Error('expected contact insert');

    await request(app)
      .post('/v1/public/inquiries')
      .send({
        ...validBody,
        name: 'Different Name',
        phone: '+359 000 111 999',
        source: 'ads',
        utmSource: 'fb',
        utmCampaign: 'spring',
      })
      .expect(201);

    const rows = await connection.db.select().from(inquiries);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.contactId).toBe(contact.id);
    expect(rows[0]?.source).toBe('ads');
    expect(rows[0]?.utmSource).toBe('fb');
    expect(rows[0]?.utmCampaign).toBe('spring');

    const [unchanged] = await connection.db
      .select()
      .from(contacts)
      .where(eq(contacts.id, contact.id));
    expect(unchanged?.displayName).toBe('Existing Contact');
    expect(unchanged?.phone).toBe('+359 000 999 000');
  });

  it('silently accepts a filled honeypot without storing', async () => {
    await request(app)
      .post('/v1/public/inquiries')
      .send({ ...validBody, website: 'http://spam.example' })
      .expect(201);
    const rows = await connection.db.select().from(inquiries);
    expect(rows).toHaveLength(0);
  });

  it('rejects missing consent', async () => {
    await request(app)
      .post('/v1/public/inquiries')
      .send({ ...validBody, consent: false })
      .expect(400);
  });
});
