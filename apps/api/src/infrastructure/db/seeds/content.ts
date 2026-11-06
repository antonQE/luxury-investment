import { DEMO_SELLERS_LANDING_SLUG } from '@luxury-investment/shared';
import { eq } from 'drizzle-orm';

import { articles, landingPages, landingSections, pages, translations } from '../schema.ts';
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

const ARTICLES = [
  {
    slug: 'demo-sofia-market-overview',
    status: 'published' as const,
    coverUrl:
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
    authorName: 'Demo Редактор',
    sortOrder: 1,
    publishedAt: new Date('2026-01-15T10:00:00.000Z'),
    titleBg: 'Demo: Пазарът в София — кратък обзор',
    titleEn: 'Demo: Sofia market — brief overview',
    excerptBg: 'Демо статия. Измислени данни за локална разработка.',
    excerptEn: 'Demo article. Fictional data for local development.',
    bodyBg:
      'Това е демо съдържание за Luxury Investment. Не е реален пазарен анализ.\n\nИзползва се само в development и test среди.',
    bodyEn:
      'This is demo content for Luxury Investment. Not a real market analysis.\n\nUsed only in development and test environments.',
  },
  {
    slug: 'demo-black-sea-homes',
    status: 'published' as const,
    coverUrl:
      'https://images.unsplash.com/photo-1499793983690-e29dafd473d5?auto=format&fit=crop&w=1200&q=80',
    authorName: 'Demo Editor',
    sortOrder: 2,
    publishedAt: new Date('2026-02-01T10:00:00.000Z'),
    titleBg: 'Demo: Домове по Черноморието',
    titleEn: 'Demo: Homes on the Black Sea',
    excerptBg: 'Демо материал за крайбрежни имоти.',
    excerptEn: 'Demo piece about coastal homes.',
    bodyBg: 'Демо текст. Всички адреси и цени са измислени.',
    bodyEn: 'Demo text. All addresses and prices are fictional.',
  },
  {
    slug: 'demo-draft-article',
    status: 'draft' as const,
    coverUrl: null,
    authorName: 'Demo Редактор',
    sortOrder: 99,
    publishedAt: null,
    titleBg: 'Demo чернова (непубликувана)',
    titleEn: 'Demo draft (unpublished)',
    excerptBg: 'Не трябва да се вижда публично.',
    excerptEn: 'Must not appear publicly.',
    bodyBg: 'Чернова.',
    bodyEn: 'Draft.',
  },
];

const PAGES = [
  {
    slug: 'privacy',
    kind: 'static' as const,
    status: 'published' as const,
    heroUrl: null,
    sortOrder: 1,
    publishedAt: new Date('2026-01-01T10:00:00.000Z'),
    titleBg: 'Поверителност (демо)',
    titleEn: 'Privacy (demo)',
    bodyBg: 'Демо страница за поверителност. Не е правен текст.',
    bodyEn: 'Demo privacy page. Not legal advice.',
  },
  {
    slug: 'terms',
    kind: 'static' as const,
    status: 'published' as const,
    heroUrl: null,
    sortOrder: 2,
    publishedAt: new Date('2026-01-01T10:00:00.000Z'),
    titleBg: 'Общи условия (демо)',
    titleEn: 'Terms (demo)',
    bodyBg: 'Демо общи условия.',
    bodyEn: 'Demo terms of use.',
  },
  {
    slug: 'prodai-s-nas',
    kind: 'sell_with_us' as const,
    status: 'published' as const,
    heroUrl:
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1600&q=80',
    sortOrder: 3,
    publishedAt: new Date('2026-01-01T10:00:00.000Z'),
    titleBg: 'Продай с нас (демо)',
    titleEn: 'Sell with us (demo)',
    bodyBg:
      'Демо структура: подготовка → маркетинг → огледи и преговори → сделка.\n\nПълният наръчник идва в EPIC-13.',
    bodyEn:
      'Demo outline: preparation → marketing → viewings and negotiation → sale.\n\nThe full handbook ships in EPIC-13.',
  },
];

export const contentSeed: SeedModule = {
  name: 'content',
  async run(db) {
    for (const row of ARTICLES) {
      const [existing] = await db
        .select({ id: articles.id })
        .from(articles)
        .where(eq(articles.slug, row.slug))
        .limit(1);

      let id = existing?.id;
      if (id === undefined) {
        const [inserted] = await db
          .insert(articles)
          .values({
            slug: row.slug,
            status: row.status,
            coverUrl: row.coverUrl,
            authorName: row.authorName,
            publishedAt: row.publishedAt,
            sortOrder: row.sortOrder,
          })
          .returning({ id: articles.id });
        id = inserted?.id;
      } else {
        await db
          .update(articles)
          .set({
            status: row.status,
            coverUrl: row.coverUrl,
            authorName: row.authorName,
            publishedAt: row.publishedAt,
            sortOrder: row.sortOrder,
            updatedAt: new Date(),
          })
          .where(eq(articles.id, id));
      }
      if (id === undefined) continue;

      await writeTranslation(db, 'article', id, 'title', 'bg', row.titleBg);
      await writeTranslation(db, 'article', id, 'title', 'en', row.titleEn);
      await writeTranslation(db, 'article', id, 'excerpt', 'bg', row.excerptBg);
      await writeTranslation(db, 'article', id, 'excerpt', 'en', row.excerptEn);
      await writeTranslation(db, 'article', id, 'body', 'bg', row.bodyBg);
      await writeTranslation(db, 'article', id, 'body', 'en', row.bodyEn);
    }

    for (const row of PAGES) {
      const [existing] = await db
        .select({ id: pages.id })
        .from(pages)
        .where(eq(pages.slug, row.slug))
        .limit(1);

      let id = existing?.id;
      if (id === undefined) {
        const [inserted] = await db
          .insert(pages)
          .values({
            slug: row.slug,
            kind: row.kind,
            status: row.status,
            heroUrl: row.heroUrl,
            publishedAt: row.publishedAt,
            sortOrder: row.sortOrder,
          })
          .returning({ id: pages.id });
        id = inserted?.id;
      } else {
        await db
          .update(pages)
          .set({
            kind: row.kind,
            status: row.status,
            heroUrl: row.heroUrl,
            publishedAt: row.publishedAt,
            sortOrder: row.sortOrder,
            updatedAt: new Date(),
          })
          .where(eq(pages.id, id));
      }
      if (id === undefined) continue;

      await writeTranslation(db, 'page', id, 'title', 'bg', row.titleBg);
      await writeTranslation(db, 'page', id, 'title', 'en', row.titleEn);
      await writeTranslation(db, 'page', id, 'body', 'bg', row.bodyBg);
      await writeTranslation(db, 'page', id, 'body', 'en', row.bodyEn);
    }

    const [existingLanding] = await db
      .select({ id: landingPages.id })
      .from(landingPages)
      .where(eq(landingPages.key, 'demo-sellers'))
      .limit(1);

    let landingId = existingLanding?.id;
    if (landingId === undefined) {
      const [inserted] = await db
        .insert(landingPages)
        .values({
          key: 'demo-sellers',
          slug: DEMO_SELLERS_LANDING_SLUG,
          status: 'published',
          titleBg: 'Демо: За продавачи',
          titleEn: 'Demo: For sellers',
          seoTitleBg: 'Продайте имота си с Luxury Investment',
          seoTitleEn: 'Sell your property with Luxury Investment',
          seoDescriptionBg: 'Демо лендинг за продавачи. Не е в главното меню.',
          seoDescriptionEn: 'Demo sellers landing. Not in the main nav.',
          robots: 'index,follow',
          showInNav: false,
          campaignKey: 'sellers_demo',
          publishedAt: new Date('2026-03-01T10:00:00.000Z'),
          sortOrder: 1,
        })
        .returning({ id: landingPages.id });
      landingId = inserted?.id;
    } else {
      await db
        .update(landingPages)
        .set({
          slug: DEMO_SELLERS_LANDING_SLUG,
          status: 'published',
          titleBg: 'Демо: За продавачи',
          titleEn: 'Demo: For sellers',
          seoTitleBg: 'Продайте имота си с Luxury Investment',
          seoTitleEn: 'Sell your property with Luxury Investment',
          seoDescriptionBg: 'Демо лендинг за продавачи. Не е в главното меню.',
          seoDescriptionEn: 'Demo sellers landing. Not in the main nav.',
          robots: 'index,follow',
          showInNav: false,
          campaignKey: 'sellers_demo',
          publishedAt: new Date('2026-03-01T10:00:00.000Z'),
          sortOrder: 1,
          archivedAt: null,
          updatedAt: new Date(),
        })
        .where(eq(landingPages.id, landingId));
    }

    if (landingId !== undefined) {
      await db.delete(landingSections).where(eq(landingSections.landingPageId, landingId));
      await db.insert(landingSections).values([
        {
          landingPageId: landingId,
          type: 'hero',
          sortOrder: 0,
          payload: {
            headline: { bg: 'Продайте спокойно', en: 'Sell with confidence' },
            subheadline: {
              bg: 'Демо лендинг за продавачи — измислено съдържание.',
              en: 'Demo sellers landing — fictional content.',
            },
            ctaLabel: { bg: 'Заявете консултация', en: 'Request a consultation' },
            ctaHref: '#cta',
          },
        },
        {
          landingPageId: landingId,
          type: 'benefits',
          sortOrder: 1,
          payload: {
            title: { bg: 'Защо с нас', en: 'Why work with us' },
            items: [
              {
                title: { bg: 'Локален опит', en: 'Local expertise' },
                body: { bg: 'Демо предимство.', en: 'Demo benefit.' },
              },
              {
                title: { bg: 'Прозрачен процес', en: 'Transparent process' },
                body: { bg: 'Демо предимство.', en: 'Demo benefit.' },
              },
            ],
          },
        },
        {
          landingPageId: landingId,
          type: 'cta_form',
          sortOrder: 2,
          payload: {
            title: { bg: 'Свържете се с нас', en: 'Get in touch' },
            body: {
              bg: 'Формата записва запитване с source=landing и UTM от кампанията.',
              en: 'The form records an inquiry with source=landing and campaign UTMs.',
            },
            inquirySource: 'landing_sellers',
            submitLabel: { bg: 'Изпрати', en: 'Send' },
          },
        },
      ]);
    }

    const [existingSeo] = await db
      .select({ id: landingPages.id })
      .from(landingPages)
      .where(eq(landingPages.key, 'demo-seo-sofia-apartments'))
      .limit(1);

    let seoId = existingSeo?.id;
    if (seoId === undefined) {
      const [inserted] = await db
        .insert(landingPages)
        .values({
          key: 'demo-seo-sofia-apartments',
          slug: 'apartamenti-sofia',
          status: 'published',
          titleBg: 'Демо: Апартаменти в София',
          titleEn: 'Demo: Apartments in Sofia',
          seoTitleBg: 'Апартаменти за продажба в София | Luxury Investment',
          seoTitleEn: 'Apartments for sale in Sofia | Luxury Investment',
          seoDescriptionBg: 'Подбрани апартаменти в София. Демо SEO категория.',
          seoDescriptionEn: 'Curated Sofia apartments. Demo SEO category landing.',
          robots: 'index,follow',
          showInNav: false,
          campaignKey: 'seo_sofia_apartments',
          publishedAt: new Date('2026-03-01T10:00:00.000Z'),
          sortOrder: 2,
        })
        .returning({ id: landingPages.id });
      seoId = inserted?.id;
    } else {
      await db
        .update(landingPages)
        .set({
          slug: 'apartamenti-sofia',
          status: 'published',
          titleBg: 'Демо: Апартаменти в София',
          titleEn: 'Demo: Apartments in Sofia',
          seoTitleBg: 'Апартаменти за продажба в София | Luxury Investment',
          seoTitleEn: 'Apartments for sale in Sofia | Luxury Investment',
          seoDescriptionBg: 'Подбрани апартаменти в София. Демо SEO категория.',
          seoDescriptionEn: 'Curated Sofia apartments. Demo SEO category landing.',
          robots: 'index,follow',
          showInNav: false,
          campaignKey: 'seo_sofia_apartments',
          publishedAt: new Date('2026-03-01T10:00:00.000Z'),
          sortOrder: 2,
          archivedAt: null,
          updatedAt: new Date(),
        })
        .where(eq(landingPages.id, seoId));
    }

    if (seoId !== undefined) {
      await db.delete(landingSections).where(eq(landingSections.landingPageId, seoId));
      await db.insert(landingSections).values([
        {
          landingPageId: seoId,
          type: 'hero',
          sortOrder: 0,
          payload: {
            headline: {
              bg: 'Апартаменти в София',
              en: 'Apartments in Sofia',
            },
            subheadline: {
              bg: 'Редакционен SEO лендинг с филтрирани обяви от каталога.',
              en: 'Editorial SEO landing with filtered catalogue listings.',
            },
          },
        },
        {
          landingPageId: seoId,
          type: 'related_listings',
          sortOrder: 1,
          payload: {
            title: { bg: 'Подбрани обяви', en: 'Featured listings' },
            propertyIds: [],
            filter: {
              market: 'sofia',
              propertyType: 'apartment',
              transactionType: 'sale',
              limit: 12,
            },
          },
        },
      ]);
    }
  },
};
