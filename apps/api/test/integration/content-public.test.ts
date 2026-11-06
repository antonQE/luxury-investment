import { eq } from 'drizzle-orm';
import { pino } from 'pino';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.ts';
import { articles } from '../../src/infrastructure/db/schema.ts';
import { SEED_MODULES } from '../../src/infrastructure/db/seeds/index.ts';
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from '../../src/infrastructure/db/seeds/users.ts';
import { ContentAdminService } from '../../src/modules/content/app/content-admin-service.ts';
import { ContentPublicService } from '../../src/modules/content/app/content-public-service.ts';
import { contentAdminRouter } from '../../src/modules/content/handlers/content-admin-handlers.ts';
import { contentPublicRouter } from '../../src/modules/content/handlers/content-public-handlers.ts';
import { AuthService } from '../../src/modules/users/app/auth-service.ts';
import { mountAdminAuth } from '../../src/modules/users/handlers/auth-handlers.ts';
import { UserRepo } from '../../src/modules/users/repo/user-repo.ts';
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
  const auth = new AuthService(
    new UserRepo(connection.db),
    env.AUTH_SESSION_TTL_HOURS,
    env.AUTH_SESSION_SECRET,
  );
  const mounted = mountAdminAuth(auth, env);
  return createApp({
    env,
    logger,
    publicRouters: [contentPublicRouter(new ContentPublicService(connection.db))],
    adminPublicRouters: [mounted.publicRouter],
    adminAuthGate: mounted.gate,
    adminRouters: [
      mounted.protectedRouter,
      contentAdminRouter(new ContentAdminService(connection.db)),
    ],
  });
}

const app = buildApp();

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

  it('hides articles scheduled with a future publishedAt', async () => {
    const agent = request.agent(buildApp());
    await agent
      .post('/v1/admin/auth/login')
      .send({ email: DEMO_ADMIN_EMAIL, password: DEMO_ADMIN_PASSWORD })
      .expect(200);

    const create = await agent
      .post('/v1/admin/articles')
      .send({
        slug: 'future-scheduled-article',
        titleBg: 'Бъдеще',
        titleEn: 'Future',
        excerptBg: 'ex',
        excerptEn: 'ex',
        bodyBg: 'body',
        bodyEn: 'body',
      })
      .expect(201);
    const id = (create.body as { data: { id: string } }).data.id;
    const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    await agent.post(`/v1/admin/articles/${id}/publish`).send({ publishAt: future }).expect(200);

    const [row] = await connection.db.select().from(articles).where(eq(articles.id, id)).limit(1);
    expect(row?.status).toBe('published');
    expect(row?.publishedAt?.getTime()).toBeGreaterThan(Date.now());

    await request(buildApp()).get('/v1/public/articles/future-scheduled-article').expect(404);

    await connection.db
      .update(articles)
      .set({ publishedAt: new Date(Date.now() - 60_000) })
      .where(eq(articles.id, id));

    await request(buildApp())
      .get('/v1/public/articles/future-scheduled-article?lang=en')
      .expect(200);
  });
});
