import { and, eq } from 'drizzle-orm';

import { contacts, deals, offers, properties } from '../schema.ts';
import type { SeedModule } from './index.ts';

export const dealsSeed: SeedModule = {
  name: 'deals',
  async run(db) {
    const [buyer] = await db
      .select({ id: contacts.id })
      .from(contacts)
      .where(eq(contacts.email, 'client.ivanov@example.com'))
      .limit(1);
    const [seller] = await db
      .select({ id: contacts.id })
      .from(contacts)
      .where(eq(contacts.email, 'owner.petrova@example.com'))
      .limit(1);
    const [property] = await db
      .select({ id: properties.id })
      .from(properties)
      .where(eq(properties.slug, 'demo-tristaen-malinova-dolina'))
      .limit(1);
    if (buyer === undefined || property === undefined) return;

    const [offer] = await db
      .select({ id: offers.id })
      .from(offers)
      .where(eq(offers.propertyId, property.id))
      .limit(1);

    const [existing] = await db
      .select({ id: deals.id })
      .from(deals)
      .where(and(eq(deals.propertyId, property.id), eq(deals.buyerContactId, buyer.id)))
      .limit(1);

    const values = {
      propertyId: property.id,
      buyerContactId: buyer.id,
      sellerContactId: seller?.id ?? null,
      offerId: offer?.id ?? null,
      stage: 'preliminary',
      agreedPrice: '285000.00',
      currency: 'EUR',
      commissionAmount: '8550.00',
      notes: 'Demo deal in preliminary stage. Fictional.',
      updatedAt: new Date(),
    };

    if (existing !== undefined) {
      await db.update(deals).set(values).where(eq(deals.id, existing.id));
      return;
    }

    await db.insert(deals).values(values);
  },
};
