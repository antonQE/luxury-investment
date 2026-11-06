import { pino } from 'pino';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.ts';
import { SEED_MODULES } from '../../src/infrastructure/db/seeds/index.ts';
import { ContentPublicService } from '../../src/modules/content/app/content-public-service.ts';
import { LandingPublicService } from '../../src/modules/content/app/landing-public-service.ts';
import { contentPublicRouter } from '../../src/modules/content/handlers/content-public-handlers.ts';
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
    publicRouters: [
      contentPublicRouter(
        new ContentPublicService(connection.db),
        new LandingPublicService(connection.db),
      ),
    ],
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

describe('public landings API', () => {
  it('returns the published sellers landing and 404s unknown slugs', async () => {
    const app = buildApp();
    const ok = await request(app).get('/v1/public/landings/za-prodavachi?lang=bg').expect(200);
    const body = ok.body as {
      data: { slug: string; title: string; showInNav: boolean; sections: unknown[] };
    };
    expect(body.data.slug).toBe('za-prodavachi');
    expect(body.data.showInNav).toBe(false);
    expect(body.data.title).toContain('продавачи');
    expect(body.data.sections.length).toBeGreaterThanOrEqual(3);

    await request(app).get('/v1/public/landings/does-not-exist').expect(404);
  });
});
