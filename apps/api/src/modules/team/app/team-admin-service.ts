import { randomUUID } from 'node:crypto';

import { and, asc, eq, inArray, isNull } from 'drizzle-orm';

import { AppError } from '../../../errors/app-error.ts';
import type { Database } from '../../../infrastructure/db/client.ts';
import { offices, partners, teamMembers, translations } from '../../../infrastructure/db/schema.ts';
import type { StoragePort } from '../../media/storage/storage-port.ts';

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

async function loadLocalizedFields(
  db: Database,
  entityId: string,
  fields: string[],
): Promise<Record<string, { bg: string; en: string }>> {
  const out: Record<string, { bg: string; en: string }> = {};
  for (const field of fields) out[field] = { bg: '', en: '' };
  const rows = await db
    .select()
    .from(translations)
    .where(
      and(
        eq(translations.entityType, 'team_member'),
        eq(translations.entityId, entityId),
        inArray(translations.field, fields),
      ),
    );
  for (const row of rows) {
    const current = out[row.field] ?? { bg: '', en: '' };
    if (row.locale === 'bg') current.bg = row.value;
    if (row.locale === 'en') current.en = row.value;
    out[row.field] = current;
  }
  return out;
}

export interface TeamMemberWriteInput {
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
  markets?: string[];
  languages?: string[];
  qualifications?: string | null;
  sortOrder?: number;
  isPublic?: boolean;
}

export interface TeamMemberDetail {
  id: string;
  slug: string;
  kind: string;
  nameBg: string;
  nameEn: string;
  roleBg: string;
  roleEn: string;
  bioBg: string;
  bioEn: string;
  email: string | null;
  phone: string | null;
  photoUrl: string | null;
  markets: string[];
  languages: string[];
  qualifications: string | null;
  sortOrder: number;
  isPublic: boolean;
}

function extensionForMime(mime: string): string {
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  if (mime === 'image/gif') return 'gif';
  return 'jpg';
}

export class TeamAdminService {
  readonly #db: Database;
  readonly #storage: StoragePort | undefined;
  readonly #teamMediaPublicBaseUrl: string | undefined;

  constructor(db: Database, storage?: StoragePort, teamMediaPublicBaseUrl?: string) {
    this.#db = db;
    this.#storage = storage;
    this.#teamMediaPublicBaseUrl = teamMediaPublicBaseUrl?.replace(/\/$/, '');
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

  async getTeamMember(id: string): Promise<TeamMemberDetail> {
    const [row] = await this.#db
      .select()
      .from(teamMembers)
      .where(and(eq(teamMembers.id, id), isNull(teamMembers.archivedAt)))
      .limit(1);
    if (row === undefined) throw new AppError('NOT_FOUND');
    const labels = await loadLocalizedFields(this.#db, row.id, ['name', 'role', 'bio']);
    return {
      id: row.id,
      slug: row.slug,
      kind: row.kind,
      nameBg: labels.name?.bg ?? '',
      nameEn: labels.name?.en ?? '',
      roleBg: labels.role?.bg ?? '',
      roleEn: labels.role?.en ?? '',
      bioBg: labels.bio?.bg ?? '',
      bioEn: labels.bio?.en ?? '',
      email: row.email,
      phone: row.phone,
      photoUrl: row.photoUrl,
      markets: row.markets,
      languages: row.languages,
      qualifications: row.qualifications,
      sortOrder: row.sortOrder,
      isPublic: row.isPublic,
    };
  }

  async createTeamMember(input: TeamMemberWriteInput) {
    const [inserted] = await this.#db
      .insert(teamMembers)
      .values({
        slug: input.slug,
        kind: input.kind,
        email: input.email ?? null,
        phone: input.phone ?? null,
        photoUrl: input.photoUrl ?? null,
        markets: input.markets ?? [],
        languages: input.languages ?? [],
        qualifications: input.qualifications ?? null,
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

  async updateTeamMember(id: string, input: TeamMemberWriteInput) {
    const [existing] = await this.#db
      .select({ id: teamMembers.id })
      .from(teamMembers)
      .where(and(eq(teamMembers.id, id), isNull(teamMembers.archivedAt)))
      .limit(1);
    if (existing === undefined) throw new AppError('NOT_FOUND');

    const [updated] = await this.#db
      .update(teamMembers)
      .set({
        slug: input.slug,
        kind: input.kind,
        email: input.email ?? null,
        phone: input.phone ?? null,
        photoUrl: input.photoUrl ?? null,
        markets: input.markets ?? [],
        languages: input.languages ?? [],
        qualifications: input.qualifications ?? null,
        sortOrder: input.sortOrder ?? 0,
        isPublic: input.isPublic ?? true,
        updatedAt: new Date(),
      })
      .where(eq(teamMembers.id, id))
      .returning();
    if (updated === undefined) throw new AppError('INTERNAL');

    await writeNamePair(this.#db, 'team_member', id, 'name', input.nameBg, input.nameEn);
    await writeNamePair(this.#db, 'team_member', id, 'role', input.roleBg, input.roleEn);
    await writeNamePair(this.#db, 'team_member', id, 'bio', input.bioBg ?? '', input.bioEn ?? '');
    return this.getTeamMember(id);
  }

  async uploadTeamPhoto(
    id: string,
    file: { buffer: Buffer; mimetype: string },
  ): Promise<TeamMemberDetail> {
    if (this.#storage === undefined || this.#teamMediaPublicBaseUrl === undefined) {
      throw new AppError('INTERNAL', 'Team photo storage is not configured.');
    }
    const [existing] = await this.#db
      .select({ id: teamMembers.id })
      .from(teamMembers)
      .where(and(eq(teamMembers.id, id), isNull(teamMembers.archivedAt)))
      .limit(1);
    if (existing === undefined) throw new AppError('NOT_FOUND');

    const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
    if (!allowed.has(file.mimetype)) {
      throw new AppError('VALIDATION_FAILED', 'Unsupported image type.');
    }

    const ext = extensionForMime(file.mimetype);
    const fileName = `photo-${randomUUID()}.${ext}`;
    const key = `team/${id}/${fileName}`;
    await this.#storage.put({
      key,
      body: file.buffer,
      contentType: file.mimetype,
    });
    const photoUrl = `${this.#teamMediaPublicBaseUrl}/${id}/${fileName}`;
    await this.#db
      .update(teamMembers)
      .set({ photoUrl, updatedAt: new Date() })
      .where(eq(teamMembers.id, id));
    return this.getTeamMember(id);
  }

  async readTeamPhotoObject(
    memberId: string,
    fileName: string,
  ): Promise<{ body: Buffer; contentType: string }> {
    if (this.#storage === undefined) {
      throw new AppError('INTERNAL', 'Team photo storage is not configured.');
    }
    if (!/^[a-zA-Z0-9._-]+$/.test(fileName) || fileName.includes('..')) {
      throw new AppError('VALIDATION_FAILED', 'Invalid photo path.');
    }
    const key = `team/${memberId}/${fileName}`;
    const body = await this.#storage.get(key);
    const ext = fileName.split('.').pop()?.toLowerCase();
    const contentType =
      ext === 'png'
        ? 'image/png'
        : ext === 'webp'
          ? 'image/webp'
          : ext === 'gif'
            ? 'image/gif'
            : 'image/jpeg';
    return { body, contentType };
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
