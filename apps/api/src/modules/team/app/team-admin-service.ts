import { and, asc, eq, inArray, isNull } from 'drizzle-orm';

import { AppError } from '../../../errors/app-error.ts';
import type { Database } from '../../../infrastructure/db/client.ts';
import { offices, partners, teamMembers, translations } from '../../../infrastructure/db/schema.ts';

async function writeNamePair(
  db: Database,
  entityType: string,
  entityId: string,
  field: string,
  bg: string,
  en: string,
) {
  for (const [locale, value] of [
    ['bg', bg],
    ['en', en],
  ] as const) {
    await db
      .insert(translations)
      .values({ entityType, entityId, locale, field, value })
      .onConflictDoUpdate({
        target: [
          translations.entityType,
          translations.entityId,
          translations.locale,
          translations.field,
        ],
        set: { value },
      });
  }
}

async function loadNames(
  db: Database,
  entityType: string,
  ids: string[],
): Promise<Map<string, { bg: string; en: string }>> {
  const map = new Map<string, { bg: string; en: string }>();
  for (const id of ids) map.set(id, { bg: '', en: '' });
  if (ids.length === 0) return map;
  const rows = await db
    .select()
    .from(translations)
    .where(
      and(
        eq(translations.entityType, entityType),
        inArray(translations.entityId, ids),
        eq(translations.field, 'name'),
      ),
    );
  for (const row of rows) {
    const current = map.get(row.entityId) ?? { bg: '', en: '' };
    if (row.locale === 'bg') current.bg = row.value;
    if (row.locale === 'en') current.en = row.value;
    map.set(row.entityId, current);
  }
  return map;
}

export class TeamAdminService {
  readonly #db: Database;

  constructor(db: Database) {
    this.#db = db;
  }

  async listTeam() {
    const rows = await this.#db
      .select()
      .from(teamMembers)
      .where(isNull(teamMembers.archivedAt))
      .orderBy(asc(teamMembers.sortOrder));
    const names = await loadNames(
      this.#db,
      'team_member',
      rows.map((row) => row.id),
    );
    return rows.map((row) => ({
      ...row,
      name: names.get(row.id) ?? { bg: '', en: '' },
    }));
  }

  async createTeamMember(input: {
    slug: string;
    kind: string;
    nameBg: string;
    nameEn: string;
    roleBg: string;
    roleEn: string;
    bioBg?: string;
    bioEn?: string;
    email?: string | null;
    phone?: string | null;
    photoUrl?: string | null;
    sortOrder?: number;
    isPublic?: boolean;
  }) {
    const [inserted] = await this.#db
      .insert(teamMembers)
      .values({
        slug: input.slug,
        kind: input.kind,
        email: input.email ?? null,
        phone: input.phone ?? null,
        photoUrl: input.photoUrl ?? null,
        sortOrder: input.sortOrder ?? 0,
        isPublic: input.isPublic ?? true,
      })
      .returning();
    if (inserted === undefined) throw new AppError('INTERNAL');
    await writeNamePair(this.#db, 'team_member', inserted.id, 'name', input.nameBg, input.nameEn);
    await writeNamePair(this.#db, 'team_member', inserted.id, 'role', input.roleBg, input.roleEn);
    await writeNamePair(
      this.#db,
      'team_member',
      inserted.id,
      'bio',
      input.bioBg ?? '',
      input.bioEn ?? '',
    );
    return inserted;
  }

  async archiveTeamMember(id: string) {
    const [updated] = await this.#db
      .update(teamMembers)
      .set({ archivedAt: new Date(), updatedAt: new Date() })
      .where(eq(teamMembers.id, id))
      .returning();
    if (updated === undefined) throw new AppError('NOT_FOUND');
    return updated;
  }

  async listOffices() {
    const rows = await this.#db
      .select()
      .from(offices)
      .where(isNull(offices.archivedAt))
      .orderBy(asc(offices.sortOrder));
    const names = await loadNames(
      this.#db,
      'office',
      rows.map((row) => row.id),
    );
    return rows.map((row) => ({
      ...row,
      name: names.get(row.id) ?? { bg: '', en: '' },
    }));
  }

  async createOffice(input: {
    slug: string;
    nameBg: string;
    nameEn: string;
    addressBg: string;
    addressEn: string;
    mapQuery: string;
    phone?: string | null;
    email?: string | null;
    sortOrder?: number;
  }) {
    const [inserted] = await this.#db
      .insert(offices)
      .values({
        slug: input.slug,
        mapQuery: input.mapQuery,
        phone: input.phone ?? null,
        email: input.email ?? null,
        sortOrder: input.sortOrder ?? 0,
        isPublic: true,
      })
      .returning();
    if (inserted === undefined) throw new AppError('INTERNAL');
    await writeNamePair(this.#db, 'office', inserted.id, 'name', input.nameBg, input.nameEn);
    await writeNamePair(
      this.#db,
      'office',
      inserted.id,
      'address',
      input.addressBg,
      input.addressEn,
    );
    return inserted;
  }

  async archiveOffice(id: string) {
    const [updated] = await this.#db
      .update(offices)
      .set({ archivedAt: new Date(), updatedAt: new Date() })
      .where(eq(offices.id, id))
      .returning();
    if (updated === undefined) throw new AppError('NOT_FOUND');
    return updated;
  }

  async listPartners() {
    const rows = await this.#db
      .select()
      .from(partners)
      .where(isNull(partners.archivedAt))
      .orderBy(asc(partners.sortOrder));
    const names = await loadNames(
      this.#db,
      'partner',
      rows.map((row) => row.id),
    );
    return rows.map((row) => ({
      ...row,
      name: names.get(row.id) ?? { bg: '', en: '' },
    }));
  }

  async createPartner(input: {
    slug: string;
    nameBg: string;
    nameEn: string;
    logoUrl: string;
    websiteUrl?: string | null;
    sortOrder?: number;
  }) {
    const [inserted] = await this.#db
      .insert(partners)
      .values({
        slug: input.slug,
        logoUrl: input.logoUrl,
        websiteUrl: input.websiteUrl ?? null,
        sortOrder: input.sortOrder ?? 0,
        isActive: true,
      })
      .returning();
    if (inserted === undefined) throw new AppError('INTERNAL');
    await writeNamePair(this.#db, 'partner', inserted.id, 'name', input.nameBg, input.nameEn);
    return inserted;
  }

  async archivePartner(id: string) {
    const [updated] = await this.#db
      .update(partners)
      .set({ archivedAt: new Date(), isActive: false, updatedAt: new Date() })
      .where(eq(partners.id, id))
      .returning();
    if (updated === undefined) throw new AppError('NOT_FOUND');
    return updated;
  }
}
