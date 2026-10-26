import type {
  CreateOfferInput,
  ListOffersQuery,
  UpdateOfferInput,
} from '@luxury-investment/shared';
import { and, desc, eq, type SQL } from 'drizzle-orm';

import type { Database } from '../../../infrastructure/db/client.ts';
import { offers } from '../../../infrastructure/db/schema.ts';

export type OfferRow = typeof offers.$inferSelect;

export class OfferRepo {
  readonly #db: Database;

  constructor(db: Database) {
    this.#db = db;
  }

  async list(query: ListOffersQuery = {}): Promise<OfferRow[]> {
    const clauses: SQL[] = [];
    if (query.propertyId !== undefined) clauses.push(eq(offers.propertyId, query.propertyId));
    if (query.contactId !== undefined) clauses.push(eq(offers.contactId, query.contactId));
    if (query.status !== undefined) clauses.push(eq(offers.status, query.status));
    const where = clauses.length > 0 ? and(...clauses) : undefined;
    return this.#db.select().from(offers).where(where).orderBy(desc(offers.createdAt));
  }

  async getById(id: string): Promise<OfferRow | null> {
    const [row] = await this.#db.select().from(offers).where(eq(offers.id, id)).limit(1);
    return row ?? null;
  }

  async create(input: CreateOfferInput): Promise<OfferRow> {
    const [row] = await this.#db
      .insert(offers)
      .values({
        propertyId: input.propertyId,
        contactId: input.contactId,
        type: input.type,
        amount: input.amount,
        currency: input.currency,
        validUntil: input.validUntil ?? null,
        terms: input.terms,
        status: input.status,
      })
      .returning();
    if (row === undefined) throw new Error('insert offers returned no row');
    return row;
  }

  async update(id: string, input: UpdateOfferInput): Promise<OfferRow | null> {
    const patch: Partial<typeof offers.$inferInsert> = { updatedAt: new Date() };
    if (input.type !== undefined) patch.type = input.type;
    if (input.amount !== undefined) patch.amount = input.amount;
    if (input.currency !== undefined) patch.currency = input.currency;
    if (input.validUntil !== undefined) patch.validUntil = input.validUntil;
    if (input.terms !== undefined) patch.terms = input.terms;
    if (input.status !== undefined) patch.status = input.status;

    const [row] = await this.#db.update(offers).set(patch).where(eq(offers.id, id)).returning();
    return row ?? null;
  }
}
