import { count, eq } from 'drizzle-orm';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import {
  marketingActivities,
  portalListings,
  portalMeasurements,
  properties,
} from '../../src/infrastructure/db/schema.ts';
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

describe('marketing seed', () => {
  it('is idempotent and seeds activity + portal measurement', async () => {
    for (const module of SEED_MODULES) {
      await module.run(connection.db);
    }

    const [property] = await connection.db
      .select({ id: properties.id })
      .from(properties)
      .where(eq(properties.slug, 'demo-tristaen-malinova-dolina'))
      .limit(1);
    expect(property).toBeDefined();
    if (property === undefined) return;

    expect(
      (
        await connection.db
          .select({ total: count() })
          .from(marketingActivities)
          .where(eq(marketingActivities.propertyId, property.id))
      )[0]?.total,
    ).toBe(1);

    const listings = await connection.db
      .select()
      .from(portalListings)
      .where(eq(portalListings.propertyId, property.id));
    expect(listings).toHaveLength(1);
    const listing = listings[0];
    expect(listing).toBeDefined();
    if (listing === undefined) return;

    const measurements = await connection.db
      .select()
      .from(portalMeasurements)
      .where(eq(portalMeasurements.portalListingId, listing.id));
    expect(measurements).toHaveLength(1);
    expect(measurements[0]?.views).toBe(240);
  });
});
