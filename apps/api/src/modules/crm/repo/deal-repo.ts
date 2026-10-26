import type { CreateDealInput, ListDealsQuery, UpdateDealInput } from '@luxury-investment/shared';
import { and, desc, eq, type SQL } from 'drizzle-orm';

import type { Database } from '../../../infrastructure/db/client.ts';
import { deals } from '../../../infrastructure/db/schema.ts';

export type DealRow = typeof deals.$inferSelect;

export class DealRepo {
  readonly #db: Database;

  constructor(db: Database) {
    this.#db = db;
  }

  async list(query: ListDealsQuery = {}): Promise<DealRow[]> {
    const clauses: SQL[] = [];
    if (query.stage !== undefined) clauses.push(eq(deals.stage, query.stage));
    if (query.propertyId !== undefined) clauses.push(eq(deals.propertyId, query.propertyId));
    const where = clauses.length > 0 ? and(...clauses) : undefined;
    return this.#db.select().from(deals).where(where).orderBy(desc(deals.updatedAt));
  }

  async getById(id: string): Promise<DealRow | null> {
    const [row] = await this.#db.select().from(deals).where(eq(deals.id, id)).limit(1);
    return row ?? null;
  }

  async create(input: CreateDealInput): Promise<DealRow> {
    const [row] = await this.#db
      .insert(deals)
      .values({
        propertyId: input.propertyId,
        buyerContactId: input.buyerContactId,
        sellerContactId: input.sellerContactId ?? null,
        offerId: input.offerId ?? null,
        stage: input.stage,
        agreedPrice: input.agreedPrice ?? null,
        currency: input.currency,
        commissionAmount: input.commissionAmount ?? null,
        notes: input.notes,
      })
      .returning();
    if (row === undefined) throw new Error('insert deals returned no row');
    return row;
  }

  async update(id: string, input: UpdateDealInput): Promise<DealRow | null> {
    const patch: Partial<typeof deals.$inferInsert> = { updatedAt: new Date() };
    if (input.buyerContactId !== undefined) patch.buyerContactId = input.buyerContactId;
    if (input.sellerContactId !== undefined) patch.sellerContactId = input.sellerContactId;
    if (input.offerId !== undefined) patch.offerId = input.offerId;
    if (input.stage !== undefined) patch.stage = input.stage;
    if (input.agreedPrice !== undefined) patch.agreedPrice = input.agreedPrice;
    if (input.currency !== undefined) patch.currency = input.currency;
    if (input.commissionAmount !== undefined) patch.commissionAmount = input.commissionAmount;
    if (input.notes !== undefined) patch.notes = input.notes;

    const [row] = await this.#db.update(deals).set(patch).where(eq(deals.id, id)).returning();
    return row ?? null;
  }
}
