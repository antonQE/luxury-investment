import { eq } from 'drizzle-orm';
import { pino } from 'pino';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.ts';
import { articles, pages, properties, teamMembers } from '../../src/infrastructure/db/schema.ts';
import { SEED_MODULES } from '../../src/infrastructure/db/seeds/index.ts';
import { ContentPublicService } from '../../src/modules/content/app/content-public-service.ts';
import { LandingPublicService } from '../../src/modules/content/app/landing-public-service.ts';
import { contentPublicRouter } from '../../src/modules/content/handlers/content-public-handlers.ts';
import { propertyPublicRouter } from '../../src/modules/properties/handlers/property-public-handlers.ts';
import { PropertyRepo } from '../../src/modules/properties/repo/property-repo.ts';
import { TeamPublicService } from '../../src/modules/team/app/team-public-service.ts';
import { teamPublicRouter } from '../../src/modules/team/handlers/team-public-handlers.ts';
import { connectTestDatabase, resetDatabase } from '../helpers/database.ts';

const connection = connectTestDatabase();
const team = new TeamPublicService(connection.db);
const app = createApp({
  env: { API_CORS_ORIGINS: [], API_ADMIN_CORS_ORIGINS: [] },
  logger: pino({ level: 'silent' }),
  publicRouters: [
    propertyPublicRouter(new PropertyRepo(connection.db), undefined, undefined, team),
    contentPublicRouter(
      new ContentPublicService(connection.db),
      new LandingPublicService(connection.db),
    ),
    teamPublicRouter(team),
  ],
});

const UNKNOWN_ID = '00000000-0000-4000-8000-000000000000';

beforeEach(async () => {
  await resetDatabase(connection);
  for (const module of SEED_MODULES) await module.run(connection.db);
});

afterAll(async () => {
  await connection.close();
});

interface Row {
  id: string;
  slug: string;
}

describe('public detail endpoints by id (LI-126)', () => {
  it('returns a property and its similar list by id; unknown or malformed id is 404', async () => {
    const [row] = await connection.db
      .select({ id: properties.id, slug: properties.slug })
      .from(properties)
      .where(eq(properties.listingStatus, 'published'))
      .limit(1);
    if (row === undefined) throw new Error('seed has no published property');

    const detail = await request(app).get(`/v1/public/properties/by-id/${row.id}`).expect(200);
    expect((detail.body as { data: Row }).data).toMatchObject({ id: row.id, slug: row.slug });

    await request(app).get(`/v1/public/properties/by-id/${row.id}/similar`).expect(200);
    await request(app).get(`/v1/public/properties/by-id/${UNKNOWN_ID}`).expect(404);
    await request(app).get(`/v1/public/properties/by-id/${UNKNOWN_ID}/similar`).expect(404);
    await request(app).get('/v1/public/properties/by-id/not-a-uuid').expect(404);
  });

  it('returns a published article and CMS page (incl. privacy) by id', async () => {
    const [article] = await connection.db
      .select({ id: articles.id, slug: articles.slug })
      .from(articles)
      .where(eq(articles.slug, 'demo-sofia-market-overview'));
    const [privacy] = await connection.db
      .select({ id: pages.id, slug: pages.slug })
      .from(pages)
      .where(eq(pages.slug, 'privacy'));
    if (article === undefined || privacy === undefined) throw new Error('seed content missing');

    const a = await request(app).get(`/v1/public/articles/by-id/${article.id}`).expect(200);
    expect((a.body as { data: Row }).data.id).toBe(article.id);
    const p = await request(app).get(`/v1/public/pages/by-id/${privacy.id}?lang=en`).expect(200);
    expect((p.body as { data: Row }).data).toMatchObject({ id: privacy.id, slug: 'privacy' });

    await request(app).get(`/v1/public/articles/by-id/${UNKNOWN_ID}`).expect(404);
    await request(app).get(`/v1/public/pages/by-id/${UNKNOWN_ID}`).expect(404);
    await request(app).get('/v1/public/pages/by-id/privacy').expect(404);
  });

  it('does not expose draft articles by id', async () => {
    const [draft] = await connection.db
      .select({ id: articles.id })
      .from(articles)
      .where(eq(articles.slug, 'demo-draft-article'));
    if (draft === undefined) throw new Error('seed draft article missing');
    await request(app).get(`/v1/public/articles/by-id/${draft.id}`).expect(404);
  });

  it('returns a team member by id; unknown id is 404', async () => {
    const [member] = await connection.db
      .select({ id: teamMembers.id, slug: teamMembers.slug })
      .from(teamMembers)
      .where(eq(teamMembers.slug, 'demo-ivanova'));
    if (member === undefined) throw new Error('seed team member missing');

    const res = await request(app).get(`/v1/public/team/by-id/${member.id}?lang=en`).expect(200);
    expect((res.body as { data: Row }).data).toMatchObject({ id: member.id, slug: 'demo-ivanova' });
    await request(app).get(`/v1/public/team/by-id/${UNKNOWN_ID}`).expect(404);
    await request(app).get('/v1/public/team/by-id/nope').expect(404);
  });

  it('returns a published landing by id; unknown id is 404', async () => {
    const bySlug = await request(app).get('/v1/public/landings/za-prodavachi?lang=bg').expect(200);
    const { id } = (bySlug.body as { data: Row }).data;

    const res = await request(app).get(`/v1/public/landings/by-id/${id}?lang=bg`).expect(200);
    expect((res.body as { data: Row }).data).toMatchObject({ id, slug: 'za-prodavachi' });
    await request(app).get(`/v1/public/landings/by-id/${UNKNOWN_ID}`).expect(404);
    await request(app).get('/v1/public/landings/by-id/nope').expect(404);
  });

  it('exposes agentId on a property whose agent matches a public team member', async () => {
    const rows = await connection.db
      .select({ id: properties.id })
      .from(properties)
      .where(eq(properties.listingStatus, 'published'));
    const withAgent: { agentId: string | null }[] = [];
    for (const row of rows) {
      const res = await request(app).get(`/v1/public/properties/by-id/${row.id}`).expect(200);
      withAgent.push((res.body as { data: { agentId: string | null } }).data);
    }
    expect(withAgent.some((item) => item.agentId !== null)).toBe(true);
  });
});
