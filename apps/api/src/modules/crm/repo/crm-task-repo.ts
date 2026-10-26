import type {
  CreateCrmTaskInput,
  ListCrmTasksQuery,
  UpdateCrmTaskInput,
} from '@luxury-investment/shared';
import { and, asc, eq, type SQL } from 'drizzle-orm';

import type { Database } from '../../../infrastructure/db/client.ts';
import { crmTasks } from '../../../infrastructure/db/schema.ts';

export type CrmTaskRow = typeof crmTasks.$inferSelect;

export class CrmTaskRepo {
  readonly #db: Database;

  constructor(db: Database) {
    this.#db = db;
  }

  async list(query: ListCrmTasksQuery = {}): Promise<CrmTaskRow[]> {
    const clauses: SQL[] = [];
    if (query.status !== undefined) clauses.push(eq(crmTasks.status, query.status));
    if (query.assigneeId !== undefined) clauses.push(eq(crmTasks.assigneeId, query.assigneeId));
    const where = clauses.length > 0 ? and(...clauses) : undefined;
    return this.#db.select().from(crmTasks).where(where).orderBy(asc(crmTasks.dueAt));
  }

  async getById(id: string): Promise<CrmTaskRow | null> {
    const [row] = await this.#db.select().from(crmTasks).where(eq(crmTasks.id, id)).limit(1);
    return row ?? null;
  }

  async create(input: CreateCrmTaskInput): Promise<CrmTaskRow> {
    const [row] = await this.#db
      .insert(crmTasks)
      .values({
        title: input.title,
        notes: input.notes,
        kind: input.kind,
        status: 'open',
        assigneeId: input.assigneeId,
        dueAt: new Date(input.dueAt),
        relatedInquiryId: input.relatedInquiryId ?? null,
        relatedViewingId: input.relatedViewingId ?? null,
        relatedPropertyId: input.relatedPropertyId ?? null,
        relatedContactId: input.relatedContactId ?? null,
      })
      .returning();
    if (row === undefined) throw new Error('insert crm_tasks returned no row');
    return row;
  }

  async update(id: string, input: UpdateCrmTaskInput): Promise<CrmTaskRow | null> {
    const patch: Partial<typeof crmTasks.$inferInsert> = { updatedAt: new Date() };
    if (input.title !== undefined) patch.title = input.title;
    if (input.notes !== undefined) patch.notes = input.notes;
    if (input.kind !== undefined) patch.kind = input.kind;
    if (input.assigneeId !== undefined) patch.assigneeId = input.assigneeId;
    if (input.dueAt !== undefined) patch.dueAt = new Date(input.dueAt);
    if (input.relatedInquiryId !== undefined) patch.relatedInquiryId = input.relatedInquiryId;
    if (input.relatedViewingId !== undefined) patch.relatedViewingId = input.relatedViewingId;
    if (input.relatedPropertyId !== undefined) patch.relatedPropertyId = input.relatedPropertyId;
    if (input.relatedContactId !== undefined) patch.relatedContactId = input.relatedContactId;
    if (input.status !== undefined) {
      patch.status = input.status;
      patch.completedAt = input.status === 'completed' ? new Date() : null;
    }

    const [row] = await this.#db.update(crmTasks).set(patch).where(eq(crmTasks.id, id)).returning();
    return row ?? null;
  }
}
