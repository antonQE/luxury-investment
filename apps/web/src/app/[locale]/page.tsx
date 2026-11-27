import { MARKETS, type PublicPartner } from '@luxury-investment/shared';
import type { Metadata } from 'next';
import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';

import { emptySiteSettings, HomeContactStrip } from '@/components/home/HomeContactStrip';
import {
  HOME_NEWEST_PAGE_SIZE,
  HomeNewestProperties,
} from '@/components/home/HomeNewestProperties';
import { SearchForm } from '@/components/search/SearchForm';
import { RemoteImage } from '@/components/ui/RemoteImage';
import { Link } from '@/i18n/navigation';
import { fetchProperties } from '@/lib/api/catalog';
import { fetchArticles } from '@/lib/api/content';
import { fetchSiteSettings } from '@/lib/api/site-settings';
import { fetchPartners, fetchTeam } from '@/lib/api/team';
import { buildPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Meta');
  const locale = await getLocale();
  return buildPageMetadata({
    locale,
    path: '/',
    title: t('defaultTitle'),
    description: t('defaultDescription'),
  });
}

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=75';

const HOME_ARTICLES_LIMIT = 3;
const HOME_TEAM_LIMIT = 3;

export default async function HomePage() {
  const t = await getTranslations('Home');
  const markets = await getTranslations('Markets');
  const locale = await getLocale();

  const [newestResult, partnersResult, articlesResult, teamResult, settings] = await Promise.all([
    fetchProperties(locale, { limit: String(HOME_NEWEST_PAGE_SIZE) }).then(
      (data) => ({ ok: true as const, data }),
      () => ({ ok: false as const }),
    ),
    fetchPartners(locale).then(
      (data) => data,
      (): PublicPartner[] => [],
    ),
    fetchArticles(locale).then(
      (data) => data.slice(0, HOME_ARTICLES_LIMIT),
      () => [],
    ),
    fetchTeam(locale).then(
      (data) => data.slice(0, HOME_TEAM_LIMIT),
      () => [],
    ),
    fetchSiteSettings().catch(() => emptySiteSettings()),
  ]);

  const newest = newestResult.ok
    ? newestResult.data
    : { data: [], total: 0, offset: 0, limit: HOME_NEWEST_PAGE_SIZE };
  const loadError = !newestResult.ok;
  const partners = partnersResult;
  const articles = articlesResult;
  const team = teamResult;

  return (
    <main>
      <section
        className="relative isolate min-h-[88vh] overflow-hidden text-stone"
        data-testid="home-hero"
      >
        <RemoteImage src={HERO_IMAGE} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-void/75 via-void/70 to-void/90" />
        <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-6 pb-16 pt-28 md:pb-24 md:pt-32">
          <div className="animate-fade-up" data-testid="home-brand-logo">
            <Image
              src="/brand/logo-luxury-investment.png"
              alt="Luxury Investment — Boutique Real Estate Agency"
              width={1024}
              height={237}
              priority
              className="h-auto w-full max-w-xl md:max-w-2xl"
            />
          </div>
          <h1
            className="animate-fade-up mt-8 max-w-2xl font-serif text-2xl leading-snug text-stone/90 md:text-3xl md:leading-snug"
            style={{ animationDelay: '80ms' }}
          >
            {t('title')}
          </h1>
          <p
            className="animate-fade-up mt-4 max-w-xl text-base text-stone/65 md:text-lg"
            style={{ animationDelay: '140ms' }}
          >
            {t('lead')}
          </p>
          <div className="animate-fade-up mt-12 max-w-4xl" style={{ animationDelay: '220ms' }}>
            <SearchForm variant="hero" testId="home-search" />
          </div>
        </div>
      </section>

      <section
        className="mx-auto max-w-6xl px-6 py-20 animate-fade-up"
        style={{ animationDelay: '60ms' }}
        data-testid="home-markets"
      >
        <p className="text-[11px] tracking-[0.22em] uppercase text-brass">{t('marketsTitle')}</p>
        <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-12">
          {MARKETS.map((market, index) => (
            <Link
              key={market}
              href={`/properties?market=${market}`}
              className="group block border-t border-line pt-6 transition hover:border-brass"
              style={{ animationDelay: `${String(100 + index * 60)}ms` }}
              data-testid={`market-${market}`}
            >
              <h2 className="font-serif text-3xl transition group-hover:text-brass-dark">
                {markets(market)}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                {markets(`${market}Lead`)}
              </p>
              <span className="mt-5 inline-block text-xs tracking-[0.18em] uppercase text-brass opacity-0 transition group-hover:opacity-100">
                {t('viewAll')} →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {loadError ? (
        <section className="mx-auto max-w-6xl px-6 pb-24" data-testid="home-newest">
          <p className="text-ink-soft" data-testid="home-error">
            {t('error')}
          </p>
        </section>
      ) : (
        <HomeNewestProperties initialItems={newest.data} total={newest.total} />
      )}

      {articles.length > 0 ? (
        <section className="mx-auto max-w-6xl px-6 pb-24" data-testid="home-articles">
          <div className="mb-10 flex items-end justify-between gap-4 border-b border-line pb-6">
            <div>
              <p className="text-[11px] tracking-[0.22em] uppercase text-brass">
                {t('articlesTitle')}
              </p>
              <h2 className="mt-2 font-serif text-3xl md:text-4xl">{t('articlesLead')}</h2>
            </div>
            <Link
              href="/articles"
              className="shrink-0 text-xs tracking-[0.18em] uppercase text-brass-dark transition hover:text-brass"
              data-testid="home-articles-view-all"
            >
              {t('articlesViewAll')}
            </Link>
          </div>
          <ul className="grid gap-10 md:grid-cols-3 md:gap-12">
            {articles.map((article) => (
              <li key={article.id} className="border-t border-line pt-6">
                <Link
                  href={`/articles/${article.id}`}
                  className="group block"
                  data-testid={`home-article-${article.slug}`}
                >
                  <h3 className="font-serif text-2xl transition group-hover:text-brass-dark">
                    {article.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">{article.excerpt}</p>
                  {article.publishedAt !== null ? (
                    <p className="mt-4 text-[11px] tracking-[0.18em] uppercase text-brass">
                      {new Date(article.publishedAt).toLocaleDateString(locale)}
                    </p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {team.length > 0 ? (
        <section className="mx-auto max-w-6xl px-6 pb-24" data-testid="home-team">
          <div className="mb-10 flex items-end justify-between gap-4 border-b border-line pb-6">
            <div>
              <p className="text-[11px] tracking-[0.22em] uppercase text-brass">{t('teamTitle')}</p>
              <h2 className="mt-2 font-serif text-3xl md:text-4xl">{t('teamLead')}</h2>
            </div>
            <Link
              href="/team"
              className="shrink-0 text-xs tracking-[0.18em] uppercase text-brass-dark transition hover:text-brass"
              data-testid="home-team-view-all"
            >
              {t('teamViewAll')}
            </Link>
          </div>
          <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member) => (
              <li key={member.id}>
                <Link
                  href={`/team/${member.id}`}
                  className="group block"
                  data-testid={`home-team-${member.slug}`}
                >
                  {member.photoUrl !== null ? (
                    <div className="relative aspect-[4/3] overflow-hidden bg-void/5">
                      <RemoteImage
                        src={member.photoUrl}
                        alt=""
                        fill
                        sizes="(max-width: 1024px) 50vw, 33vw"
                        className="object-cover object-top transition duration-500 group-hover:scale-[1.02]"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[4/3] w-full bg-void/5" />
                  )}
                  <h3 className="mt-5 font-serif text-xl transition group-hover:text-brass-dark md:text-[1.35rem]">
                    {member.name}
                  </h3>
                  <p className="mt-1 text-sm text-ink-soft">{member.role}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {partners.length > 0 ? (
        <section
          className="border-t border-line bg-paper/60 px-6 py-20 backdrop-blur-sm"
          data-testid="home-partners"
        >
          <div className="mx-auto max-w-6xl">
            <p className="text-[11px] tracking-[0.22em] uppercase text-brass">
              {t('partnersTitle')}
            </p>
            <h2 className="mt-2 font-serif text-3xl">{t('partnersLead')}</h2>
            <ul className="mt-12 flex flex-wrap items-center gap-x-12 gap-y-8">
              {partners.map((partner) => (
                <li key={partner.id}>
                  <a
                    href={partner.websiteUrl ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative block h-10 w-[140px] opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0"
                    data-testid={`partner-${partner.slug}`}
                  >
                    <RemoteImage
                      src={partner.logoUrl}
                      alt={partner.name}
                      fill
                      sizes="140px"
                      className="object-contain"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <HomeContactStrip settings={settings} />
    </main>
  );
}
