import { and, eq } from 'drizzle-orm';
import { pino } from 'pino';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.ts';
import {
  properties,
  propertyEventDailyRollups,
  propertyEvents,
} from '../../src/infrastructure/db/schema.ts';
import { SEED_MODULES } from '../../src/infrastructure/db/seeds/index.ts';
import { analyticsPublicRouter } from '../../src/modules/analytics/handlers/analytics-public-handlers.ts';
import { AnalyticsRepo } from '../../src/modules/analytics/repo/analytics-repo.ts';
import { connectTestDatabase, resetDatabase } from '../helpers/database.ts';

const connection = connectTestDatabase();
const logger = pino({ level: 'silent' });

const env = {
  NODE_ENV: 'test' as const,
  API_CORS_ORIGINS: ['http://localhost:3000'],
  API_ADMIN_CORS_ORIGINS: ['http://localhost:5173'],
  AUTH_SESSION_SECRET: 'test-session-secret-32',
  AUTH_COOKIE_NAME: 'li_session',
  AUTH_SESSION_TTL_HOURS: 24,
};

function buildApp() {
  return createApp({
    env,
    logger,
    publicRouters: [analyticsPublicRouter(new AnalyticsRepo(connection.db))],
  });
}

beforeEach(async () => {
  await resetDatabase(connection);
  for (const module of SEED_MODULES) {
    await module.run(connection.db);
  }
});

afterAll(async () => {
  await connection.close();
});

describe('analytics public event ingest', () => {
  it('counts page_view into daily rollup and ignores bots', async () => {
    const app = buildApp();
    const [property] = await connection.db
      .select({ id: properties.id })
      .from(properties)
      .where(eq(properties.slug, 'demo-tristaen-malinova-dolina'))
      .limit(1);
    expect(property).toBeDefined();
    if (property === undefined) return;

    await request(app)
      .post('/v1/public/analytics/events')
      .set('User-Agent', 'Mozilla/5.0 test-browser')
      .send({
        propertyId: property.id,
        eventType: 'page_view',
        sessionKey: 'session-abc-12345',
        source: 'direct',
      })
      .expect(201);

    await request(app)
      .post('/v1/public/analytics/events')
      .set('User-Agent', 'Mozilla/5.0 test-browser')
      .send({
        propertyId: property.id,
        eventType: 'page_view',
        sessionKey: 'session-abc-12345',
        source: 'direct',
      })
      .expect(201);

    await request(app)
      .post('/v1/public/analytics/events')
      .set('User-Agent', 'Googlebot/2.1')
      .send({
        propertyId: property.id,
        eventType: 'page_view',
        sessionKey: 'bot-session-zzzz',
      })
      .expect(201);

    const events = await connection.db
      .select()
      .from(propertyEvents)
      .where(eq(propertyEvents.propertyId, property.id));
    expect(events).toHaveLength(3);
    expect(events.filter((row) => row.isBot === 1)).toHaveLength(1);

    const day = new Date().toISOString().slice(0, 10);
    const [rollup] = await connection.db
      .select()
      .from(propertyEventDailyRollups)
      .where(
        and(
          eq(propertyEventDailyRollups.propertyId, property.id),
          eq(propertyEventDailyRollups.eventType, 'page_view'),
          eq(propertyEventDailyRollups.day, day),
        ),
      )
      .limit(1);
    expect(rollup).toBeDefined();
    expect(rollup?.eventCount).toBe(2);
    expect(rollup?.uniqueSessions).toBe(1);
  });
});
