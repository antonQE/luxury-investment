import { and, eq } from 'drizzle-orm';

import { inquiries } from '../schema.ts';
import type { SeedModule } from './index.ts';

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
  },
] as const;

export const inquiriesSeed: SeedModule = {
  name: 'inquiries',
  async run(db) {
    for (const row of DEMO) {
      const [existing] = await db
        .select({ id: inquiries.id })
        .from(inquiries)
        .where(and(eq(inquiries.email, row.email), eq(inquiries.propertySlug, row.propertySlug)))
        .limit(1);

      if (existing !== undefined) {
        await db
          .update(inquiries)
          .set({
            type: row.type,
            name: row.name,
            phone: row.phone,
            message: row.message,
            consent: row.consent,
            status: row.status,
            updatedAt: new Date(),
          })
          .where(eq(inquiries.id, existing.id));
        continue;
      }

      await db.insert(inquiries).values({
        type: row.type,
        propertySlug: row.propertySlug,
        name: row.name,
        email: row.email,
        phone: row.phone,
        message: row.message,
        consent: row.consent,
        status: row.status,
      });
    }
  },
};
