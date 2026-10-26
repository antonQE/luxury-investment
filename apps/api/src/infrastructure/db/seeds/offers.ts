import { and, eq } from 'drizzle-orm';

import { contacts, offers, properties } from '../schema.ts';
import type { SeedModule } from './index.ts';

export const offersSeed: SeedModule = {
  name: 'offers',
  async run(db) {
    const [contact] = await db
      .select({ id: contacts.id })
      .from(contacts)
      .where(eq(contacts.email, 'client.ivanov@example.com'))
      .limit(1);
    const [property] = await db
      .select({ id: properties.id })
      .from(properties)
      .where(eq(properties.slug, 'demo-tristaen-malinova-dolina'))
      .limit(1);
    if (contact === undefined || property === undefined) return;

    const [existing] = await db
      .select({ id: offers.id })
      .from(offers)
      .where(and(eq(offers.propertyId, property.id), eq(offers.contactId, contact.id)))
      .limit(1);

    const values = {
      propertyId: property.id,
      contactId: contact.id,
      type: 'purchase',
      amount: '285000.00',
      currency: 'EUR',
      validUntil: '2026-12-31',
      terms: 'Demo purchase offer. Fictional data.',
      status: 'submitted',
      updatedAt: new Date(),
    };

    if (existing !== undefined) {
      await db.update(offers).set(values).where(eq(offers.id, existing.id));
      return;
    }

    await db.insert(offers).values(values);
  },
};
