import { and, eq } from 'drizzle-orm';

import { contacts, inquiries, users } from '../schema.ts';
import type { SeedModule } from './index.ts';
import { DEMO_ADMIN_EMAIL } from './users.ts';

const DEMO = [
  {
    type: 'inquiry',
    propertySlug: 'demo-tristaen-malinova-dolina',
    name: 'Demo Клиент Иванов',
    email: 'client.ivanov@example.com',
    phone: '+359 000 111 001',
    message: 'Демо запитване за оглед. Измислени данни.',
    consent: true,
    status: 'new',
    source: 'property_form' as const,
    funnelStage: 'new' as const,
    utmSource: 'google',
    utmMedium: 'cpc',
    utmCampaign: 'demo-sofia',
    linkContact: true,
    assignAgent: true,
    nextActionNote: 'Call within 24h',
  },
  {
    type: 'viewing',
    propertySlug: 'demo-tristaen-malinova-dolina',
    name: 'Demo Клиент Петрова',
    email: 'client.petrova@example.com',
    phone: '+359 000 111 002',
    message: 'Моля за оглед в събота. Демо данни.',
    consent: true,
    status: 'in_progress',
    source: 'website' as const,
    funnelStage: 'viewing' as const,
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    linkContact: false,
    assignAgent: true,
    nextActionNote: 'Confirm viewing time',
  },
  {
    type: 'inquiry',
    propertySlug: 'demo-kashta-sarafovo',
    name: 'Demo Buyer Smith',
    email: 'buyer.smith@example.com',
    phone: '+359 000 111 003',
    message: 'Demo inquiry about Black Sea house. Fictional.',
    consent: true,
    status: 'closed',
    source: 'referral' as const,
    funnelStage: 'declined' as const,
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    linkContact: false,
    assignAgent: false,
    nextActionNote: null,
  },
] as const;

export const inquiriesSeed: SeedModule = {
  name: 'inquiries',
  async run(db) {
    const [agent] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, DEMO_ADMIN_EMAIL))
      .limit(1);

    for (const row of DEMO) {
      let contactId: string | null = null;
      if (row.linkContact) {
        const [contact] = await db
          .select({ id: contacts.id })
          .from(contacts)
          .where(eq(contacts.email, row.email))
          .limit(1);
        contactId = contact?.id ?? null;
      }

      const assignedAgentId = row.assignAgent ? (agent?.id ?? null) : null;
      const nextActionAt = row.nextActionNote !== null ? new Date(Date.now() + 86_400_000) : null;

      const [existing] = await db
        .select({ id: inquiries.id })
        .from(inquiries)
        .where(and(eq(inquiries.email, row.email), eq(inquiries.propertySlug, row.propertySlug)))
        .limit(1);

      const values = {
        type: row.type,
        name: row.name,
        phone: row.phone,
        message: row.message,
        consent: row.consent,
        status: row.status,
        contactId,
        source: row.source,
        utmSource: row.utmSource,
        utmMedium: row.utmMedium,
        utmCampaign: row.utmCampaign,
        funnelStage: row.funnelStage,
        assignedAgentId,
        nextActionAt,
        nextActionNote: row.nextActionNote,
        updatedAt: new Date(),
      };

      if (existing !== undefined) {
        await db.update(inquiries).set(values).where(eq(inquiries.id, existing.id));
        continue;
      }

      await db.insert(inquiries).values({
        ...values,
        propertySlug: row.propertySlug,
        email: row.email,
      });
    }
  },
};
