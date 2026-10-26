import { and, eq } from 'drizzle-orm';

import { contacts, crmTasks, inquiries, users, viewings } from '../schema.ts';
import type { SeedModule } from './index.ts';
import { DEMO_ADMIN_EMAIL } from './users.ts';

export const crmTasksSeed: SeedModule = {
  name: 'crm-tasks',
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
    const [inquiry] = await db
      .select({ id: inquiries.id })
      .from(inquiries)
      .where(eq(inquiries.email, 'client.ivanov@example.com'))
      .limit(1);
    const [viewing] = await db.select({ id: viewings.id }).from(viewings).limit(1);

    if (agent === undefined) return;

    const demos = [
      {
        title: 'Call Demo Иванов about Malinova inquiry',
        notes: 'Seed overdue follow-up. Fictional.',
        kind: 'inquiry_followup',
        dueAt: new Date(Date.now() - 2 * 86_400_000),
        relatedInquiryId: inquiry?.id ?? null,
        relatedViewingId: null as string | null,
        relatedContactId: contact?.id ?? null,
      },
      {
        title: 'Send post-viewing summary',
        notes: 'Seed upcoming task after demo viewing.',
        kind: 'post_viewing',
        dueAt: new Date(Date.now() + 2 * 86_400_000),
        relatedInquiryId: null as string | null,
        relatedViewingId: viewing?.id ?? null,
        relatedContactId: contact?.id ?? null,
      },
    ];

    for (const demo of demos) {
      const [existing] = await db
        .select({ id: crmTasks.id })
        .from(crmTasks)
        .where(and(eq(crmTasks.title, demo.title), eq(crmTasks.assigneeId, agent.id)))
        .limit(1);

      const values = {
        title: demo.title,
        notes: demo.notes,
        kind: demo.kind,
        status: 'open',
        assigneeId: agent.id,
        dueAt: demo.dueAt,
        relatedInquiryId: demo.relatedInquiryId,
        relatedViewingId: demo.relatedViewingId,
        relatedContactId: demo.relatedContactId,
        updatedAt: new Date(),
      };

      if (existing !== undefined) {
        await db.update(crmTasks).set(values).where(eq(crmTasks.id, existing.id));
        continue;
      }

      await db.insert(crmTasks).values(values);
    }
  },
};
