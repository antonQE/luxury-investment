import { and, eq } from 'drizzle-orm';

import { marketingActivities, portalListings, portalMeasurements, properties } from '../schema.ts';
import type { SeedModule } from './index.ts';

export const marketingSeed: SeedModule = {
  name: 'marketing',
  async run(db) {
    const [property] = await db
      .select({ id: properties.id })
      .from(properties)
      .where(eq(properties.slug, 'demo-tristaen-malinova-dolina'))
      .limit(1);
    if (property === undefined) return;

    const [existingActivity] = await db
      .select({ id: marketingActivities.id })
      .from(marketingActivities)
      .where(
        and(
          eq(marketingActivities.propertyId, property.id),
          eq(marketingActivities.title, 'Demo Facebook boost'),
        ),
      )
      .limit(1);

    if (existingActivity === undefined) {
      await db.insert(marketingActivities).values({
        propertyId: property.id,
        activityType: 'paid_social',
        title: 'Demo Facebook boost',
        status: 'done',
        startsOn: '2026-01-10',
        endsOn: '2026-01-17',
        costAmount: '120.00',
        costCurrency: 'EUR',
        resultNotes: 'Demo activity — fictional spend and result.',
        evidenceUrl: 'https://example.com/demo-ad-evidence',
      });
    }

    const [existingListing] = await db
      .select({ id: portalListings.id })
      .from(portalListings)
      .where(
        and(
          eq(portalListings.propertyId, property.id),
          eq(portalListings.portalName, 'Demo Portal'),
        ),
      )
      .limit(1);

    let listingId = existingListing?.id;
    if (listingId === undefined) {
      const [inserted] = await db
        .insert(portalListings)
        .values({
          propertyId: property.id,
          portalName: 'Demo Portal',
          listingUrl: 'https://example.com/listings/demo-tristaen',
          status: 'published',
          publishedOn: '2026-01-05',
          notes: 'Demo portal publication — fictional.',
        })
        .returning({ id: portalListings.id });
      listingId = inserted?.id;
    }
    if (listingId === undefined) return;

    const [existingMeasurement] = await db
      .select({ id: portalMeasurements.id })
      .from(portalMeasurements)
      .where(
        and(
          eq(portalMeasurements.portalListingId, listingId),
          eq(portalMeasurements.measuredOn, '2026-01-20'),
        ),
      )
      .limit(1);

    if (existingMeasurement === undefined) {
      await db.insert(portalMeasurements).values({
        portalListingId: listingId,
        measuredOn: '2026-01-20',
        periodLabel: '2026-01-13..2026-01-20',
        views: 240,
        saves: 12,
        metricDefinition: 'Demo: portal-reported listing views / saves',
        notes: 'Append-only demo row — do not overwrite.',
      });
    }
  },
};
