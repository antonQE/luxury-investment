import type {
  CreateInquiryInput,
  InquiryStatus,
  ListInquiriesQuery,
} from '@luxury-investment/shared';
import { and, desc, eq, isNull, type SQL, sql } from 'drizzle-orm';

import type { Database } from '../../../infrastructure/db/client.ts';
import { contacts, inquiries } from '../../../infrastructure/db/schema.ts';

export type InquiryRow = typeof inquiries.$inferSelect;

export class InquiryRepo {
  readonly #db: Database;

  constructor(db: Database) {
    this.#db = db;
  }

  async findActiveContactIdByEmail(email: string): Promise<string | null> {
    const normalized = email.trim().toLowerCase();
    const [row] = await this.#db
      .select({ id: contacts.id })
      .from(contacts)
      .where(and(sql`lower(${contacts.email}) = ${normalized}`, isNull(contacts.archivedAt)))
      .limit(1);
    return row?.id ?? null;
  }

  async create(input: CreateInquiryInput): Promise<{ id: string; contactId: string | null }> {
    const contactId = await this.findActiveContactIdByEmail(input.email);
    const source = input.source ?? 'property_form';

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
        contactId,
        source,
        utmSource: input.utmSource ?? null,
        utmMedium: input.utmMedium ?? null,
        utmCampaign: input.utmCampaign ?? null,
        utmTerm: input.utmTerm ?? null,
        utmContent: input.utmContent ?? null,
        funnelStage: 'new',
      })
      .returning({ id: inquiries.id, contactId: inquiries.contactId });
    if (row === undefined) throw new Error('insert inquiries returned no row');
    return row;
  }

  async list(query: ListInquiriesQuery = {}): Promise<InquiryRow[]> {
    const clauses: SQL[] = [];
    if (query.funnelStage !== undefined) {
      clauses.push(eq(inquiries.funnelStage, query.funnelStage));
    }
    if (query.source !== undefined) {
      clauses.push(eq(inquiries.source, query.source));
    }
    const where = clauses.length > 0 ? and(...clauses) : undefined;
    return this.#db.select().from(inquiries).where(where).orderBy(desc(inquiries.createdAt));
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
