import { and, eq } from 'drizzle-orm';

import { contacts, properties, users, viewings } from '../schema.ts';
import type { SeedModule } from './index.ts';
import { DEMO_ADMIN_EMAIL } from './users.ts';

export const viewingsSeed: SeedModule = {
  name: 'viewings',
  async run(db) {
    const [agent] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, DEMO_ADMIN_EMAIL))
      .limit(1);
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

    if (agent === undefined || contact === undefined || property === undefined) return;

    const scheduledAt = new Date('2026-11-05T10:00:00.000Z');
    const [existing] = await db
      .select({ id: viewings.id })
      .from(viewings)
      .where(
        and(
          eq(viewings.propertyId, property.id),
          eq(viewings.contactId, contact.id),
          eq(viewings.scheduledAt, scheduledAt),
        ),
      )
      .limit(1);

    const values = {
      propertyId: property.id,
      contactId: contact.id,
      agentId: agent.id,
      scheduledAt,
      endsAt: new Date('2026-11-05T11:00:00.000Z'),
      locationNote: 'Malinova Dolina entrance B',
      accessInstructions: 'Demo access code 0000. Fictional.',
      status: 'confirmed',
      outcomeNote: '',
      nextActionNote: 'Send follow-up after viewing',
      updatedAt: new Date(),
    };

    if (existing !== undefined) {
      await db.update(viewings).set(values).where(eq(viewings.id, existing.id));
      return;
    }

    await db.insert(viewings).values(values);
  },
};
