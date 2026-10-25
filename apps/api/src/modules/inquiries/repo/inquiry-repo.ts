import type { CreateInquiryInput } from '@luxury-investment/shared';

import type { Database } from '../../../infrastructure/db/client.ts';
import { inquiries } from '../../../infrastructure/db/schema.ts';

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
      })
      .returning({ id: inquiries.id });
    if (row === undefined) throw new Error('insert inquiries returned no row');
    return row;
  }
}
