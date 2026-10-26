import type {
  CreateViewingInput,
  ListViewingsQuery,
  UpdateViewingInput,
} from '@luxury-investment/shared';
import { and, asc, eq, gte, lte, type SQL } from 'drizzle-orm';

import type { Database } from '../../../infrastructure/db/client.ts';
import { viewings } from '../../../infrastructure/db/schema.ts';

export type ViewingRow = typeof viewings.$inferSelect;

export class ViewingRepo {
  readonly #db: Database;

  constructor(db: Database) {
    this.#db = db;
  }

  async list(query: ListViewingsQuery = {}): Promise<ViewingRow[]> {
    const clauses: SQL[] = [];
    if (query.from !== undefined) {
      clauses.push(gte(viewings.scheduledAt, new Date(query.from)));
    }
    if (query.to !== undefined) {
      clauses.push(lte(viewings.scheduledAt, new Date(query.to)));
    }
    if (query.propertyId !== undefined) {
      clauses.push(eq(viewings.propertyId, query.propertyId));
    }
    if (query.agentId !== undefined) {
      clauses.push(eq(viewings.agentId, query.agentId));
    }
    if (query.status !== undefined) {
      clauses.push(eq(viewings.status, query.status));
    }
    const where = clauses.length > 0 ? and(...clauses) : undefined;
    return this.#db.select().from(viewings).where(where).orderBy(asc(viewings.scheduledAt));
  }

  async getById(id: string): Promise<ViewingRow | null> {
    const [row] = await this.#db.select().from(viewings).where(eq(viewings.id, id)).limit(1);
    return row ?? null;
  }

  async create(input: CreateViewingInput): Promise<ViewingRow> {
    const [row] = await this.#db
      .insert(viewings)
      .values({
        propertyId: input.propertyId,
        contactId: input.contactId,
        agentId: input.agentId,
        inquiryId: input.inquiryId ?? null,
        scheduledAt: new Date(input.scheduledAt),
        endsAt: input.endsAt === undefined || input.endsAt === null ? null : new Date(input.endsAt),
        locationNote: input.locationNote,
        accessInstructions: input.accessInstructions,
        status: input.status,
        outcomeNote: input.outcomeNote,
        nextActionNote: input.nextActionNote,
      })
      .returning();
    if (row === undefined) throw new Error('insert viewings returned no row');
    return row;
  }

  async update(id: string, input: UpdateViewingInput): Promise<ViewingRow | null> {
    const patch: Partial<typeof viewings.$inferInsert> = { updatedAt: new Date() };
    if (input.propertyId !== undefined) patch.propertyId = input.propertyId;
    if (input.contactId !== undefined) patch.contactId = input.contactId;
    if (input.agentId !== undefined) patch.agentId = input.agentId;
    if (input.inquiryId !== undefined) patch.inquiryId = input.inquiryId;
    if (input.scheduledAt !== undefined) patch.scheduledAt = new Date(input.scheduledAt);
    if (input.endsAt !== undefined) {
      patch.endsAt = input.endsAt === null ? null : new Date(input.endsAt);
    }
    if (input.locationNote !== undefined) patch.locationNote = input.locationNote;
    if (input.accessInstructions !== undefined) {
      patch.accessInstructions = input.accessInstructions;
    }
    if (input.status !== undefined) patch.status = input.status;
    if (input.outcomeNote !== undefined) patch.outcomeNote = input.outcomeNote;
    if (input.nextActionNote !== undefined) patch.nextActionNote = input.nextActionNote;

    const [row] = await this.#db.update(viewings).set(patch).where(eq(viewings.id, id)).returning();
    return row ?? null;
  }
}
