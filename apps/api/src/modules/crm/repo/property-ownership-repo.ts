import { and, eq } from 'drizzle-orm';

import type { Database } from '../../../infrastructure/db/client.ts';
import { contacts, propertyOwnerships } from '../../../infrastructure/db/schema.ts';

export interface PropertyOwnershipRow {
  id: string;
  propertyId: string;
  contactId: string;
  role: string;
  agreementStartsOn: string | null;
  agreementEndsOn: string | null;
  notes: string;
  contactDisplayName: string;
  contactEmail: string | null;
  contactPhone: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class PropertyOwnershipRepo {
  readonly #db: Database;

  constructor(db: Database) {
    this.#db = db;
  }

  async listForProperty(propertyId: string): Promise<PropertyOwnershipRow[]> {
    return this.#db
      .select({
        id: propertyOwnerships.id,
        propertyId: propertyOwnerships.propertyId,
        contactId: propertyOwnerships.contactId,
        role: propertyOwnerships.role,
        agreementStartsOn: propertyOwnerships.agreementStartsOn,
        agreementEndsOn: propertyOwnerships.agreementEndsOn,
        notes: propertyOwnerships.notes,
        contactDisplayName: contacts.displayName,
        contactEmail: contacts.email,
        contactPhone: contacts.phone,
        createdAt: propertyOwnerships.createdAt,
        updatedAt: propertyOwnerships.updatedAt,
      })
      .from(propertyOwnerships)
      .innerJoin(contacts, eq(propertyOwnerships.contactId, contacts.id))
      .where(eq(propertyOwnerships.propertyId, propertyId));
  }

  async upsert(input: {
    propertyId: string;
    contactId: string;
    role: string;
    agreementStartsOn: string | null;
    agreementEndsOn: string | null;
    notes: string;
  }): Promise<PropertyOwnershipRow> {
    const [row] = await this.#db
      .insert(propertyOwnerships)
      .values({
        propertyId: input.propertyId,
        contactId: input.contactId,
        role: input.role,
        agreementStartsOn: input.agreementStartsOn,
        agreementEndsOn: input.agreementEndsOn,
        notes: input.notes,
      })
      .onConflictDoUpdate({
        target: [propertyOwnerships.propertyId, propertyOwnerships.contactId],
        set: {
          role: input.role,
          agreementStartsOn: input.agreementStartsOn,
          agreementEndsOn: input.agreementEndsOn,
          notes: input.notes,
          updatedAt: new Date(),
        },
      })
      .returning({ id: propertyOwnerships.id });

    const id = row?.id;
    if (id === undefined) {
      throw new Error('Failed to upsert property ownership.');
    }
    const [full] = await this.#db
      .select({
        id: propertyOwnerships.id,
        propertyId: propertyOwnerships.propertyId,
        contactId: propertyOwnerships.contactId,
        role: propertyOwnerships.role,
        agreementStartsOn: propertyOwnerships.agreementStartsOn,
        agreementEndsOn: propertyOwnerships.agreementEndsOn,
        notes: propertyOwnerships.notes,
        contactDisplayName: contacts.displayName,
        contactEmail: contacts.email,
        contactPhone: contacts.phone,
        createdAt: propertyOwnerships.createdAt,
        updatedAt: propertyOwnerships.updatedAt,
      })
      .from(propertyOwnerships)
      .innerJoin(contacts, eq(propertyOwnerships.contactId, contacts.id))
      .where(eq(propertyOwnerships.id, id))
      .limit(1);
    if (full === undefined) {
      throw new Error('Ownership row missing after upsert.');
    }
    return full;
  }

  async remove(propertyId: string, ownershipId: string): Promise<boolean> {
    const deleted = await this.#db
      .delete(propertyOwnerships)
      .where(
        and(eq(propertyOwnerships.id, ownershipId), eq(propertyOwnerships.propertyId, propertyId)),
      )
      .returning({ id: propertyOwnerships.id });
    return deleted.length > 0;
  }
}
