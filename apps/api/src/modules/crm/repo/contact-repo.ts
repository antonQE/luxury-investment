import type {
  CreateContactInput,
  ListContactsQuery,
  UpdateContactInput,
} from '@luxury-investment/shared';
import { and, asc, eq, inArray, isNull, ne, or, type SQL, sql } from 'drizzle-orm';

import type { Database } from '../../../infrastructure/db/client.ts';
import { contactRoles, contacts } from '../../../infrastructure/db/schema.ts';

export type ContactRow = typeof contacts.$inferSelect;

export interface ContactWithRoles extends ContactRow {
  roles: string[];
}

export interface DuplicateLookup {
  email?: string | null;
  phone?: string | null;
  excludeId?: string;
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

export class ContactRepo {
  readonly #db: Database;

  constructor(db: Database) {
    this.#db = db;
  }

  async findDuplicateCandidates(lookup: DuplicateLookup): Promise<ContactWithRoles[]> {
    const clauses: SQL[] = [];
    const email = lookup.email?.trim().toLowerCase();
    if (email !== undefined && email !== '') {
      clauses.push(sql`lower(${contacts.email}) = ${email}`);
    }
    const phoneDigits =
      lookup.phone !== undefined && lookup.phone !== null ? digitsOnly(lookup.phone) : '';
    if (phoneDigits.length >= 6) {
      clauses.push(
        sql`regexp_replace(coalesce(${contacts.phone}, ''), '\\D', '', 'g') = ${phoneDigits}`,
      );
    }
    if (clauses.length === 0) return [];

    const match = or(...clauses);
    if (match === undefined) return [];

    const filters: SQL[] = [isNull(contacts.archivedAt), match];
    if (lookup.excludeId !== undefined) {
      filters.push(ne(contacts.id, lookup.excludeId));
    }

    const rows = await this.#db
      .select()
      .from(contacts)
      .where(and(...filters))
      .orderBy(asc(contacts.displayName))
      .limit(20);

    return this.#attachRoles(rows);
  }

  async list(query: ListContactsQuery = { includeArchived: false }): Promise<ContactWithRoles[]> {
    const rows = await this.#db
      .select()
      .from(contacts)
      .where(query.includeArchived ? undefined : isNull(contacts.archivedAt))
      .orderBy(asc(contacts.displayName));

    return this.#attachRoles(rows);
  }

  async getById(id: string): Promise<ContactWithRoles | null> {
    const [row] = await this.#db.select().from(contacts).where(eq(contacts.id, id)).limit(1);
    if (row === undefined) return null;
    const [withRoles] = await this.#attachRoles([row]);
    return withRoles ?? null;
  }

  async create(input: CreateContactInput): Promise<ContactWithRoles> {
    return this.#db.transaction(async (tx) => {
      const [row] = await tx
        .insert(contacts)
        .values({
          kind: input.kind,
          displayName: input.displayName,
          email: input.email ?? null,
          phone: input.phone ?? null,
          preferredLocale: input.preferredLocale,
          preferredChannel: input.preferredChannel ?? null,
          notes: input.notes,
          legalBasis: input.legalBasis ?? null,
        })
        .returning();
      if (row === undefined) throw new Error('insert contacts returned no row');

      if (input.roles.length > 0) {
        await tx.insert(contactRoles).values(
          input.roles.map((role) => ({
            contactId: row.id,
            role,
          })),
        );
      }

      return { ...row, roles: [...input.roles] };
    });
  }

  async update(id: string, input: UpdateContactInput): Promise<ContactWithRoles | null> {
    return this.#db.transaction(async (tx) => {
      const [existing] = await tx.select().from(contacts).where(eq(contacts.id, id)).limit(1);
      if (existing === undefined) return null;

      const patch: Partial<typeof contacts.$inferInsert> = { updatedAt: new Date() };
      if (input.kind !== undefined) patch.kind = input.kind;
      if (input.displayName !== undefined) patch.displayName = input.displayName;
      if (input.email !== undefined) patch.email = input.email;
      if (input.phone !== undefined) patch.phone = input.phone;
      if (input.preferredLocale !== undefined) patch.preferredLocale = input.preferredLocale;
      if (input.preferredChannel !== undefined) patch.preferredChannel = input.preferredChannel;
      if (input.notes !== undefined) patch.notes = input.notes;
      if (input.legalBasis !== undefined) patch.legalBasis = input.legalBasis;

      const [row] = await tx.update(contacts).set(patch).where(eq(contacts.id, id)).returning();
      if (row === undefined) return null;

      let roles: string[];
      if (input.roles !== undefined) {
        await tx.delete(contactRoles).where(eq(contactRoles.contactId, id));
        if (input.roles.length > 0) {
          await tx.insert(contactRoles).values(
            input.roles.map((role) => ({
              contactId: id,
              role,
            })),
          );
        }
        roles = [...input.roles];
      } else {
        const roleRows = await tx
          .select({ role: contactRoles.role })
          .from(contactRoles)
          .where(eq(contactRoles.contactId, id));
        roles = roleRows.map((r) => r.role);
      }

      return { ...row, roles };
    });
  }

  async archive(id: string): Promise<ContactWithRoles | null> {
    const [row] = await this.#db
      .update(contacts)
      .set({ archivedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(contacts.id, id), isNull(contacts.archivedAt)))
      .returning();
    if (row === undefined) {
      const current = await this.getById(id);
      return current;
    }
    const [withRoles] = await this.#attachRoles([row]);
    return withRoles ?? null;
  }

  async #attachRoles(rows: ContactRow[]): Promise<ContactWithRoles[]> {
    if (rows.length === 0) return [];
    const ids = rows.map((row) => row.id);
    const roleRows = await this.#db
      .select()
      .from(contactRoles)
      .where(inArray(contactRoles.contactId, ids));

    const byContact = new Map<string, string[]>();
    for (const roleRow of roleRows) {
      const list = byContact.get(roleRow.contactId) ?? [];
      list.push(roleRow.role);
      byContact.set(roleRow.contactId, list);
    }

    return rows.map((row) => ({
      ...row,
      roles: byContact.get(row.id) ?? [],
    }));
  }
}
