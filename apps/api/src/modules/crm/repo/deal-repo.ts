import type { CreateDealInput, ListDealsQuery, UpdateDealInput } from '@luxury-investment/shared';
import { and, desc, eq, type SQL } from 'drizzle-orm';

import type { Database } from '../../../infrastructure/db/client.ts';
import { deals, users } from '../../../infrastructure/db/schema.ts';

export type DealRow = typeof deals.$inferSelect;

export type DealWithAgent = DealRow & { agentName: string };

export class DealRepo {
  readonly #db: Database;

  constructor(db: Database) {
    this.#db = db;
  }

  async list(query: ListDealsQuery = {}): Promise<DealWithAgent[]> {
    const clauses: SQL[] = [];
    if (query.stage !== undefined) clauses.push(eq(deals.stage, query.stage));
    if (query.propertyId !== undefined) clauses.push(eq(deals.propertyId, query.propertyId));
    if (query.agentId !== undefined) clauses.push(eq(deals.agentId, query.agentId));
    const where = clauses.length > 0 ? and(...clauses) : undefined;
    const rows = await this.#db
      .select({
        deal: deals,
        agentName: users.displayName,
      })
      .from(deals)
      .innerJoin(users, eq(deals.agentId, users.id))
      .where(where)
      .orderBy(desc(deals.updatedAt));
    return rows.map((row) => ({ ...row.deal, agentName: row.agentName }));
  }

  async getById(id: string): Promise<DealWithAgent | null> {
    const [row] = await this.#db
      .select({
        deal: deals,
        agentName: users.displayName,
      })
      .from(deals)
      .innerJoin(users, eq(deals.agentId, users.id))
      .where(eq(deals.id, id))
      .limit(1);
    if (row === undefined) return null;
    return { ...row.deal, agentName: row.agentName };
  }

  async create(input: CreateDealInput): Promise<DealWithAgent> {
    const [inserted] = await this.#db
      .insert(deals)
      .values({
        propertyId: input.propertyId,
        buyerContactId: input.buyerContactId,
        sellerContactId: input.sellerContactId ?? null,
        agentId: input.agentId,
        offerId: input.offerId ?? null,
        stage: input.stage,
        agreedPrice: input.agreedPrice ?? null,
        currency: input.currency,
        commissionAmount: input.commissionAmount ?? null,
        notes: input.notes,
      })
      .returning({ id: deals.id });
    if (inserted === undefined) throw new Error('insert deals returned no row');
    const row = await this.getById(inserted.id);
    if (row === null) throw new Error('deal missing after insert');
    return row;
  }

  async update(id: string, input: UpdateDealInput): Promise<DealWithAgent | null> {
    const patch: Partial<typeof deals.$inferInsert> = { updatedAt: new Date() };
    if (input.buyerContactId !== undefined) patch.buyerContactId = input.buyerContactId;
    if (input.sellerContactId !== undefined) patch.sellerContactId = input.sellerContactId;
    if (input.agentId !== undefined) patch.agentId = input.agentId;
    if (input.offerId !== undefined) patch.offerId = input.offerId;
    if (input.stage !== undefined) patch.stage = input.stage;
    if (input.agreedPrice !== undefined) patch.agreedPrice = input.agreedPrice;
    if (input.currency !== undefined) patch.currency = input.currency;
    if (input.commissionAmount !== undefined) patch.commissionAmount = input.commissionAmount;
    if (input.notes !== undefined) patch.notes = input.notes;

    const [updated] = await this.#db
      .update(deals)
      .set(patch)
      .where(eq(deals.id, id))
      .returning({ id: deals.id });
    if (updated === undefined) return null;
    return this.getById(updated.id);
  }
}
