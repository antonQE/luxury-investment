import { pino } from 'pino';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.ts';
import { SEED_MODULES } from '../../src/infrastructure/db/seeds/index.ts';
import { ContentPublicService } from '../../src/modules/content/app/content-public-service.ts';
import { contentPublicRouter } from '../../src/modules/content/handlers/content-public-handlers.ts';
import { connectTestDatabase, resetDatabase } from '../helpers/database.ts';

const connection = connectTestDatabase();
const app = createApp({
  env: { API_CORS_ORIGINS: [], API_ADMIN_CORS_ORIGINS: [] },
  logger: pino({ level: 'silent' }),
  publicRouters: [contentPublicRouter(new ContentPublicService(connection.db))],
});

beforeEach(async () => {
  await resetDatabase(connection);
  for (const module of SEED_MODULES) {
    await module.run(connection.db);
  }
});

afterAll(async () => {
  await connection.close();
});

describe('public content API', () => {
  it('lists published articles and serves pages; hides drafts', async () => {
    const list = await request(app).get('/v1/public/articles?lang=en').expect(200);
    const articles = (list.body as { data: { slug: string; title: string }[] }).data;
    expect(articles.some((row) => row.slug === 'demo-sofia-market-overview')).toBe(true);
    expect(articles.some((row) => row.slug === 'demo-draft-article')).toBe(false);

    const article = await request(app)
      .get('/v1/public/articles/demo-sofia-market-overview?lang=bg')
      .expect(200);
    expect((article.body as { data: { title: string; body: string } }).data.title).toContain(
      'София',
    );
    expect((article.body as { data: { body: string } }).data.body.length).toBeGreaterThan(0);

    const page = await request(app).get('/v1/public/pages/privacy?lang=en').expect(200);
    expect((page.body as { data: { title: string } }).data.title).toContain('Privacy');

    await request(app).get('/v1/public/articles/demo-draft-article').expect(404);
    await request(app).get('/v1/public/pages/missing').expect(404);
  });
});
