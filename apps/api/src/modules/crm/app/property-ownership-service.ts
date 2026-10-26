import type { UpsertPropertyOwnershipInput } from '@luxury-investment/shared';
import { eq } from 'drizzle-orm';

import { AppError } from '../../../errors/app-error.ts';
import type { Database } from '../../../infrastructure/db/client.ts';
import { contacts, properties } from '../../../infrastructure/db/schema.ts';
import {
  PropertyOwnershipRepo,
  type PropertyOwnershipRow,
} from '../repo/property-ownership-repo.ts';

export class PropertyOwnershipService {
  readonly #db: Database;
  readonly #repo: PropertyOwnershipRepo;

  constructor(db: Database) {
    this.#db = db;
    this.#repo = new PropertyOwnershipRepo(db);
  }

  list(propertyId: string): Promise<PropertyOwnershipRow[]> {
    return this.#repo.listForProperty(propertyId);
  }

  async upsert(
    propertyId: string,
    input: UpsertPropertyOwnershipInput,
  ): Promise<PropertyOwnershipRow> {
    await this.#assertProperty(propertyId);
    await this.#assertContact(input.contactId);
    return this.#repo.upsert({
      propertyId,
      contactId: input.contactId,
      role: input.role,
      agreementStartsOn: input.agreementStartsOn ?? null,
      agreementEndsOn: input.agreementEndsOn ?? null,
      notes: input.notes ?? '',
    });
  }

  async remove(propertyId: string, ownershipId: string): Promise<void> {
    await this.#assertProperty(propertyId);
    const ok = await this.#repo.remove(propertyId, ownershipId);
    if (!ok) {
      throw new AppError('NOT_FOUND', 'Ownership link not found.');
    }
  }

  async #assertProperty(propertyId: string): Promise<void> {
    const [row] = await this.#db
      .select({ id: properties.id })
      .from(properties)
      .where(eq(properties.id, propertyId))
      .limit(1);
    if (row === undefined) {
      throw new AppError('NOT_FOUND', 'Property not found.');
    }
  }

  async #assertContact(contactId: string): Promise<void> {
    const [row] = await this.#db
      .select({ id: contacts.id })
      .from(contacts)
      .where(eq(contacts.id, contactId))
      .limit(1);
    if (row === undefined) {
      throw new AppError('NOT_FOUND', 'Contact not found.');
    }
  }
}
