import { eq } from 'drizzle-orm';

import { offices, partners, teamMembers, translations } from '../schema.ts';
import type { SeedModule } from './index.ts';

async function writeTranslation(
  db: Parameters<SeedModule['run']>[0],
  entityType: string,
  entityId: string,
  field: string,
  locale: string,
  value: string,
) {
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

const TEAM = [
  {
    slug: 'demo-ivanova',
    kind: 'agent',
    sortOrder: 1,
    email: 'ivanova@example.com',
    phone: '+359 000 000 001',
    markets: ['sofia'],
    languages: ['bg', 'en'],
    photoUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    nameBg: 'Demo Агент Иванова',
    nameEn: 'Demo Agent Ivanova',
    roleBg: 'Старши брокер',
    roleEn: 'Senior agent',
    bioBg: 'Демо профил. Специализация жилища в София. Измислени данни.',
    bioEn: 'Demo profile. Focus on Sofia homes. Fictional data.',
    qualifications: null as string | null,
  },
  {
    slug: 'demo-petrov',
    kind: 'agent',
    sortOrder: 2,
    email: 'petrov@example.com',
    phone: '+359 000 000 002',
    markets: ['sofia', 'black_sea'],
    languages: ['bg', 'en', 'de'],
    photoUrl:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80',
    nameBg: 'Demo Агент Петров',
    nameEn: 'Demo Agent Petrov',
    roleBg: 'Брокер',
    roleEn: 'Agent',
    bioBg: 'Демо профил. Къщи и инвестиционни имоти.',
    bioEn: 'Demo profile. Houses and investment listings.',
    qualifications: null,
  },
  {
    slug: 'demo-lawyer',
    kind: 'lawyer',
    sortOrder: 3,
    email: 'lawyer@example.com',
    phone: '+359 000 000 003',
    markets: ['sofia'],
    languages: ['bg', 'en'],
    photoUrl:
      'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=800&q=80',
    nameBg: 'Demo Адвокат Георгиева',
    nameEn: 'Demo Lawyer Georgieva',
    roleBg: 'Правен съветник',
    roleEn: 'Legal counsel',
    bioBg: 'Демо профил за адвокатски услуги. Не е реално лице.',
    bioEn: 'Demo profile for legal services. Not a real person.',
    qualifications: 'Demo: member of Sofia Bar (fictional)',
  },
];

const OFFICES = [
  {
    slug: 'sofia-centre',
    sortOrder: 1,
    phone: '+359 000 000 100',
    email: 'sofia@example.com',
    mapQuery: 'Sofia, Bulgaria',
    nameBg: 'Офис София',
    nameEn: 'Sofia office',
    addressBg: 'ул. Демо 1, София (измислен адрес)',
    addressEn: '1 Demo St, Sofia (fictional address)',
    hoursBg: 'Пон–Пет 10:00–18:00',
    hoursEn: 'Mon–Fri 10:00–18:00',
  },
  {
    slug: 'burgas-sea',
    sortOrder: 2,
    phone: '+359 000 000 200',
    email: 'burgas@example.com',
    mapQuery: 'Burgas, Bulgaria',
    nameBg: 'Офис Бургас',
    nameEn: 'Burgas office',
    addressBg: 'бул. Демо 2, Бургас (измислен адрес)',
    addressEn: '2 Demo Blvd, Burgas (fictional address)',
    hoursBg: 'Пон–Пет 10:00–17:00',
    hoursEn: 'Mon–Fri 10:00–17:00',
  },
];

const PARTNERS = [
  {
    slug: 'demo-bank',
    sortOrder: 1,
    logoUrl:
      'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=400&q=80',
    websiteUrl: 'https://example.com',
    nameBg: 'Demo Банка',
    nameEn: 'Demo Bank',
  },
  {
    slug: 'demo-notary',
    sortOrder: 2,
    logoUrl:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80',
    websiteUrl: 'https://example.com/notary',
    nameBg: 'Demo Нотариус',
    nameEn: 'Demo Notary',
  },
];

export const teamSeed: SeedModule = {
  name: 'team',
  run: async (db) => {
    for (const row of TEAM) {
      const existing = await db
        .select()
        .from(teamMembers)
        .where(eq(teamMembers.slug, row.slug))
        .limit(1);
      let id = existing[0]?.id;
      if (id === undefined) {
        const [inserted] = await db
          .insert(teamMembers)
          .values({
            slug: row.slug,
            kind: row.kind,
            email: row.email,
            phone: row.phone,
            markets: row.markets,
            languages: row.languages,
            photoUrl: row.photoUrl,
            qualifications: row.qualifications,
            sortOrder: row.sortOrder,
            isPublic: true,
          })
          .returning({ id: teamMembers.id });
        id = inserted?.id;
      } else {
        await db
          .update(teamMembers)
          .set({
            kind: row.kind,
            email: row.email,
            phone: row.phone,
            markets: row.markets,
            languages: row.languages,
            photoUrl: row.photoUrl,
            qualifications: row.qualifications,
            sortOrder: row.sortOrder,
            updatedAt: new Date(),
          })
          .where(eq(teamMembers.id, id));
      }
      if (id === undefined) continue;
      await writeTranslation(db, 'team_member', id, 'name', 'bg', row.nameBg);
      await writeTranslation(db, 'team_member', id, 'name', 'en', row.nameEn);
      await writeTranslation(db, 'team_member', id, 'role', 'bg', row.roleBg);
      await writeTranslation(db, 'team_member', id, 'role', 'en', row.roleEn);
      await writeTranslation(db, 'team_member', id, 'bio', 'bg', row.bioBg);
      await writeTranslation(db, 'team_member', id, 'bio', 'en', row.bioEn);
    }

    for (const row of OFFICES) {
      const existing = await db.select().from(offices).where(eq(offices.slug, row.slug)).limit(1);
      let id = existing[0]?.id;
      if (id === undefined) {
        const [inserted] = await db
          .insert(offices)
          .values({
            slug: row.slug,
            phone: row.phone,
            email: row.email,
            mapQuery: row.mapQuery,
            sortOrder: row.sortOrder,
            isPublic: true,
          })
          .returning({ id: offices.id });
        id = inserted?.id;
      } else {
        await db
          .update(offices)
          .set({
            phone: row.phone,
            email: row.email,
            mapQuery: row.mapQuery,
            sortOrder: row.sortOrder,
            updatedAt: new Date(),
          })
          .where(eq(offices.id, id));
      }
      if (id === undefined) continue;
      await writeTranslation(db, 'office', id, 'name', 'bg', row.nameBg);
      await writeTranslation(db, 'office', id, 'name', 'en', row.nameEn);
      await writeTranslation(db, 'office', id, 'address', 'bg', row.addressBg);
      await writeTranslation(db, 'office', id, 'address', 'en', row.addressEn);
      await writeTranslation(db, 'office', id, 'hours', 'bg', row.hoursBg);
      await writeTranslation(db, 'office', id, 'hours', 'en', row.hoursEn);
    }

    for (const row of PARTNERS) {
      const existing = await db.select().from(partners).where(eq(partners.slug, row.slug)).limit(1);
      let id = existing[0]?.id;
      if (id === undefined) {
        const [inserted] = await db
          .insert(partners)
          .values({
            slug: row.slug,
            logoUrl: row.logoUrl,
            websiteUrl: row.websiteUrl,
            sortOrder: row.sortOrder,
            isActive: true,
          })
          .returning({ id: partners.id });
        id = inserted?.id;
      } else {
        await db
          .update(partners)
          .set({
            logoUrl: row.logoUrl,
            websiteUrl: row.websiteUrl,
            sortOrder: row.sortOrder,
            updatedAt: new Date(),
          })
          .where(eq(partners.id, id));
      }
      if (id === undefined) continue;
      await writeTranslation(db, 'partner', id, 'name', 'bg', row.nameBg);
      await writeTranslation(db, 'partner', id, 'name', 'en', row.nameEn);
    }
  },
};
