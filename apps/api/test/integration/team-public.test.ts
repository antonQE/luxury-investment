import { pino } from 'pino';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.ts';
import { SEED_MODULES } from '../../src/infrastructure/db/seeds/index.ts';
import { TeamPublicService } from '../../src/modules/team/app/team-public-service.ts';
import { teamPublicRouter } from '../../src/modules/team/handlers/team-public-handlers.ts';
import { connectTestDatabase, resetDatabase } from '../helpers/database.ts';

const connection = connectTestDatabase();
const app = createApp({
  env: { API_CORS_ORIGINS: [] },
  logger: pino({ level: 'silent' }),
  publicRouters: [teamPublicRouter(new TeamPublicService(connection.db))],
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

describe('public team API', () => {
  it('lists team, offices and partners in the requested locale', async () => {
    const team = await request(app).get('/v1/public/team?lang=en').expect(200);
    expect((team.body as { data: { slug: string; name: string }[] }).data.length).toBeGreaterThan(
      0,
    );
    expect(
      (team.body as { data: { slug: string; name: string }[] }).data.some(
        (row) => row.slug === 'demo-ivanova' && row.name.includes('Ivanova'),
      ),
    ).toBe(true);

    const profile = await request(app).get('/v1/public/team/demo-ivanova?lang=bg').expect(200);
    expect((profile.body as { data: { name: string } }).data.name).toContain('Иванова');

    const offices = await request(app).get('/v1/public/offices?lang=en').expect(200);
    expect((offices.body as { data: unknown[] }).data).toHaveLength(2);

    const partners = await request(app).get('/v1/public/partners').expect(200);
    expect((partners.body as { data: unknown[] }).data).toHaveLength(2);

    await request(app).get('/v1/public/team/missing').expect(404);
  });
});
