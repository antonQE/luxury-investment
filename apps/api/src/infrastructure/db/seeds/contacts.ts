import { CONTACT_KINDS, CONTACT_ROLES, type ContactRole } from '@luxury-investment/shared';
import { and, eq, isNull } from 'drizzle-orm';

import { contactRoles, contacts, properties, propertyOwnerships } from '../schema.ts';
import type { SeedModule } from './index.ts';

interface ContactSeed {
  email: string;
  kind: (typeof CONTACT_KINDS)[number];
  displayName: string;
  phone: string;
  preferredLocale: 'bg' | 'en';
  preferredChannel: string;
  notes: string;
  roles: ContactRole[];
}

const DEMO: ContactSeed[] = [
  {
    email: 'client.ivanov@example.com',
    kind: 'person',
    displayName: 'Demo Иванов',
    phone: '+359 000 111 001',
    preferredLocale: 'bg',
    preferredChannel: 'phone',
    notes: 'Seed buyer interested in Sofia apartments.',
    roles: ['buyer', 'investor'],
  },
  {
    email: 'owner.petrova@example.com',
    kind: 'person',
    displayName: 'Demo Петрова',
    phone: '+359 000 111 002',
    preferredLocale: 'bg',
    preferredChannel: 'email',
    notes: 'Seed seller for Malinova Dolina listing.',
    roles: ['seller'],
  },
  {
    email: 'holdings@example.com',
    kind: 'company',
    displayName: 'Demo Holdings EOOD',
    phone: '+359 000 111 003',
    preferredLocale: 'en',
    preferredChannel: 'email',
    notes: 'Seed company landlord / partner.',
    roles: ['landlord', 'partner'],
  },
];

export const contactsSeed: SeedModule = {
  name: 'contacts',
  async run(db) {
    for (const row of DEMO) {
      const [existing] = await db
        .select({ id: contacts.id })
        .from(contacts)
        .where(and(eq(contacts.email, row.email), isNull(contacts.archivedAt)))
        .limit(1);

      let contactId = existing?.id;
      if (contactId === undefined) {
        const [inserted] = await db
          .insert(contacts)
          .values({
            kind: row.kind,
            displayName: row.displayName,
            email: row.email,
            phone: row.phone,
            preferredLocale: row.preferredLocale,
            preferredChannel: row.preferredChannel,
            notes: row.notes,
            legalBasis: 'legitimate_interest_demo',
          })
          .returning({ id: contacts.id });
        contactId = inserted?.id;
      }
      if (contactId === undefined) continue;

      for (const role of row.roles) {
        if (!CONTACT_ROLES.includes(role)) continue;
        await db.insert(contactRoles).values({ contactId, role }).onConflictDoNothing();
      }
    }

    const [owner] = await db
      .select({ id: contacts.id })
      .from(contacts)
      .where(eq(contacts.email, 'owner.petrova@example.com'))
      .limit(1);
    const [listing] = await db
      .select({ id: properties.id })
      .from(properties)
      .where(eq(properties.slug, 'demo-tristaen-malinova-dolina'))
      .limit(1);
    if (owner !== undefined && listing !== undefined) {
      await db
        .insert(propertyOwnerships)
        .values({
          propertyId: listing.id,
          contactId: owner.id,
          role: 'owner',
          agreementStartsOn: '2026-01-01',
          agreementEndsOn: '2027-01-01',
          notes: 'Demo brokerage agreement window.',
        })
        .onConflictDoNothing({
          target: [propertyOwnerships.propertyId, propertyOwnerships.contactId],
        });
    }
  },
};
