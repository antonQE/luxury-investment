import type { CreateInquiryInput, InquiryStatus } from '@luxury-investment/shared';
import { desc, eq } from 'drizzle-orm';

import type { Database } from '../../../infrastructure/db/client.ts';
import { inquiries } from '../../../infrastructure/db/schema.ts';

export type InquiryRow = typeof inquiries.$inferSelect;

export class InquiryRepo {
  readonly #db: Database;

  constructor(db: Database) {
    this.#db = db;
  }

  async create(input: CreateInquiryInput): Promise<{ id: string }> {
    const [row] = await this.#db
      .insert(inquiries)
      .values({
        type: input.type,
        propertySlug: input.propertySlug,
        name: input.name,
        email: input.email,
        phone: input.phone,
        message: input.message,
        consent: input.consent,
        status: 'new',
      })
      .returning({ id: inquiries.id });
    if (row === undefined) throw new Error('insert inquiries returned no row');
    return row;
  }

  async list(): Promise<InquiryRow[]> {
    return this.#db.select().from(inquiries).orderBy(desc(inquiries.createdAt));
  }

  async getById(id: string): Promise<InquiryRow | null> {
    const [row] = await this.#db.select().from(inquiries).where(eq(inquiries.id, id)).limit(1);
    return row ?? null;
  }

  async updateStatus(id: string, status: InquiryStatus): Promise<InquiryRow | null> {
    const [row] = await this.#db
      .update(inquiries)
      .set({ status, updatedAt: new Date() })
      .where(eq(inquiries.id, id))
      .returning();
    return row ?? null;
  }
}
