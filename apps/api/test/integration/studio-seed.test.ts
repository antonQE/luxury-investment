import {
  DEMO_BROCHURE_A4_KEY,
  DEMO_SOCIAL_FEED_KEY,
  DEMO_SOCIAL_SQUARE_KEY,
} from '@luxury-investment/shared';
import { count, eq } from 'drizzle-orm';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { brochureTemplates } from '../../src/infrastructure/db/schema.ts';
import { SEED_MODULES } from '../../src/infrastructure/db/seeds/index.ts';
import { connectTestDatabase, resetDatabase } from '../helpers/database.ts';

const connection = connectTestDatabase();

beforeEach(async () => {
  await resetDatabase(connection);
  for (const module of SEED_MODULES) {
    await module.run(connection.db);
  }
});

afterAll(async () => {
  await connection.close();
});

describe('studio seed', () => {
  it('is idempotent and seeds A4 brochure + two social templates', async () => {
    for (const module of SEED_MODULES) {
      await module.run(connection.db);
    }

    expect((await connection.db.select({ total: count() }).from(brochureTemplates))[0]?.total).toBe(
      3,
    );

    const [brochure] = await connection.db
      .select()
      .from(brochureTemplates)
      .where(eq(brochureTemplates.key, DEMO_BROCHURE_A4_KEY))
      .limit(1);
    expect(brochure).toMatchObject({
      kind: 'brochure_pdf',
      format: 'a4_pdf',
      locale: 'bg',
      isActive: true,
    });
    expect(brochure?.defaultToggles).toMatchObject({ price: true, qr: true });

    const [social] = await connection.db
      .select()
      .from(brochureTemplates)
      .where(eq(brochureTemplates.key, DEMO_SOCIAL_FEED_KEY))
      .limit(1);
    expect(social).toMatchObject({
      kind: 'social_image',
      format: 'feed_1080x1350',
      badgePreset: 'new',
    });
    expect(social?.defaultToggles).toMatchObject({ description: false, photos: true });

    const [square] = await connection.db
      .select()
      .from(brochureTemplates)
      .where(eq(brochureTemplates.key, DEMO_SOCIAL_SQUARE_KEY))
      .limit(1);
    expect(square).toMatchObject({
      kind: 'social_image',
      format: 'square_1080',
      badgePreset: 'exclusive',
    });
  });
});
