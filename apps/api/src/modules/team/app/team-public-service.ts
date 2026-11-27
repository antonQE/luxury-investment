import type {
  Locale,
  PublicOffice,
  PublicPartner,
  PublicTeamMember,
} from '@luxury-investment/shared';
import { isRecordId, teamMemberKindSchema } from '@luxury-investment/shared';
import { and, asc, eq, inArray, isNull, type SQL } from 'drizzle-orm';

import { AppError } from '../../../errors/app-error.ts';
import type { Database } from '../../../infrastructure/db/client.ts';
import { offices, partners, teamMembers, translations } from '../../../infrastructure/db/schema.ts';

async function loadFields(
  db: Database,
  entityType: string,
  ids: string[],
  fields: string[],
  locale: Locale,
): Promise<Map<string, Record<string, string>>> {
  const map = new Map<string, Record<string, string>>();
  for (const id of ids) map.set(id, {});
  if (ids.length === 0) return map;
  const rows = await db
    .select()
    .from(translations)
    .where(
      and(
        eq(translations.entityType, entityType),
        inArray(translations.entityId, ids),
        eq(translations.locale, locale),
        inArray(translations.field, fields),
      ),
    );
  for (const row of rows) {
    const current = map.get(row.entityId) ?? {};
    current[row.field] = row.value;
    map.set(row.entityId, current);
  }
  return map;
}

export class TeamPublicService {
  readonly #db: Database;

  constructor(db: Database) {
    this.#db = db;
  }

  async listMembers(locale: Locale): Promise<PublicTeamMember[]> {
    const rows = await this.#db
      .select()
      .from(teamMembers)
      .where(and(eq(teamMembers.isPublic, true), isNull(teamMembers.archivedAt)))
      .orderBy(asc(teamMembers.sortOrder), asc(teamMembers.slug));
    const labels = await loadFields(
      this.#db,
      'team_member',
      rows.map((row) => row.id),
      ['name', 'role', 'bio'],
      locale,
    );
    return rows.map((row) => {
      const t = labels.get(row.id) ?? {};
      return {
        id: row.id,
        slug: row.slug,
        kind: teamMemberKindSchema.parse(row.kind),
        name: t.name ?? '',
        role: t.role ?? '',
        bio: t.bio ?? '',
        photoUrl: row.photoUrl,
        email: row.email,
        phone: row.phone,
        markets: row.markets,
        languages: row.languages,
        qualifications: row.qualifications,
      };
    });
  }

  async getMember(locale: Locale, slug: string): Promise<PublicTeamMember> {
    return this.#getPublicMember(locale, eq(teamMembers.slug, slug));
  }

  /** Public detail by record id (`/team/{id}/`). Malformed ids are "not found". */
  async getMemberById(locale: Locale, id: string): Promise<PublicTeamMember> {
    if (!isRecordId(id)) throw new AppError('NOT_FOUND');
    return this.#getPublicMember(locale, eq(teamMembers.id, id));
  }

  async #getPublicMember(locale: Locale, match: SQL | undefined): Promise<PublicTeamMember> {
    const [row] = await this.#db
      .select()
      .from(teamMembers)
      .where(and(match, eq(teamMembers.isPublic, true), isNull(teamMembers.archivedAt)))
      .limit(1);
    if (row === undefined) throw new AppError('NOT_FOUND');
    const labels = await loadFields(
      this.#db,
      'team_member',
      [row.id],
      ['name', 'role', 'bio'],
      locale,
    );
    const t = labels.get(row.id) ?? {};
    return {
      id: row.id,
      slug: row.slug,
      kind: teamMemberKindSchema.parse(row.kind),
      name: t.name ?? '',
      role: t.role ?? '',
      bio: t.bio ?? '',
      photoUrl: row.photoUrl,
      email: row.email,
      phone: row.phone,
      markets: row.markets,
      languages: row.languages,
      qualifications: row.qualifications,
    };
  }

  /**
   * Match a listing agent phone to a public team member.
   * Compares digit suffixes so "(+359) 897…" and "+359 897…" still match.
   */
  async findPublicByPhone(
    phone: string,
  ): Promise<{ id: string; slug: string; photoUrl: string | null } | null> {
    const needle = phone.replace(/\D/g, '');
    if (needle.length < 6) return null;
    const rows = await this.#db
      .select({
        id: teamMembers.id,
        slug: teamMembers.slug,
        phone: teamMembers.phone,
        photoUrl: teamMembers.photoUrl,
      })
      .from(teamMembers)
      .where(and(eq(teamMembers.isPublic, true), isNull(teamMembers.archivedAt)));
    for (const row of rows) {
      if (row.phone === null) continue;
      const candidate = row.phone.replace(/\D/g, '');
      if (candidate.length < 6) continue;
      const a = needle.length >= 9 ? needle.slice(-9) : needle;
      const b = candidate.length >= 9 ? candidate.slice(-9) : candidate;
      if (a === b) {
        const photoUrl = row.photoUrl === null || row.photoUrl === '' ? null : row.photoUrl;
        return { id: row.id, slug: row.slug, photoUrl };
      }
    }
    return null;
  }

  async findPhotoByPhone(phone: string): Promise<string | null> {
    const match = await this.findPublicByPhone(phone);
    return match?.photoUrl ?? null;
  }

  async listOffices(locale: Locale): Promise<PublicOffice[]> {
    const rows = await this.#db
      .select()
      .from(offices)
      .where(and(eq(offices.isPublic, true), isNull(offices.archivedAt)))
      .orderBy(asc(offices.sortOrder), asc(offices.slug));
    const labels = await loadFields(
      this.#db,
      'office',
      rows.map((row) => row.id),
      ['name', 'address', 'hours'],
      locale,
    );
    return rows.map((row) => {
      const t = labels.get(row.id) ?? {};
      return {
        id: row.id,
        slug: row.slug,
        name: t.name ?? '',
        address: t.address ?? '',
        phone: row.phone,
        email: row.email,
        mapQuery: row.mapQuery,
        hours: t.hours ?? null,
      };
    });
  }

  async listPartners(locale: Locale): Promise<PublicPartner[]> {
    const rows = await this.#db
      .select()
      .from(partners)
      .where(and(eq(partners.isActive, true), isNull(partners.archivedAt)))
      .orderBy(asc(partners.sortOrder), asc(partners.slug));
    const labels = await loadFields(
      this.#db,
      'partner',
      rows.map((row) => row.id),
      ['name'],
      locale,
    );
    return rows.map((row) => {
      const t = labels.get(row.id) ?? {};
      return {
        id: row.id,
        slug: row.slug,
        name: t.name ?? '',
        logoUrl: row.logoUrl,
        websiteUrl: row.websiteUrl,
      };
    });
  }
}
