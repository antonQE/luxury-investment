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
import { MediaPlaceholder } from '@/components/ui/MediaPlaceholder';
import { RemoteImage } from '@/components/ui/RemoteImage';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeader } from '@/components/ui/SectionHeader';
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
        className="relative isolate -mt-16 min-h-svh overflow-hidden text-stone xl:-mt-[4.5rem]"
        data-testid="home-hero"
      >
        <div className="hero-media absolute inset-0 -z-20">
          <RemoteImage
            src={HERO_IMAGE}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="hero-scrim absolute inset-0 -z-10" aria-hidden />
        <div className="relative mx-auto flex min-h-svh max-w-6xl flex-col justify-end px-6 pb-16 pt-32 md:pb-24 md:pt-40">
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
            className="animate-fade-up mt-8 max-w-2xl font-serif text-3xl leading-snug text-stone md:text-[2.5rem] md:leading-[1.2]"
            style={{ animationDelay: '120ms' }}
          >
            {t('title')}
          </h1>
          <p
            className="animate-fade-up mt-5 max-w-xl text-base text-stone/70 md:text-lg"
            style={{ animationDelay: '200ms' }}
          >
            {t('lead')}
          </p>
          <div
            className="animate-fade-up mt-12 max-w-4xl border-t border-stone/20 pt-8 md:mt-14"
            style={{ animationDelay: '300ms' }}
          >
            <SearchForm variant="hero" testId="home-search" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24 md:py-32" data-testid="home-markets">
        <SectionHeader eyebrow={t('marketsTitle')} />
        <div className="grid gap-12 md:grid-cols-3 md:gap-14">
          {MARKETS.map((market, index) => (
            <Reveal key={market} delay={index * 110}>
              <Link
                href={`/properties?market=${market}`}
                className="ruled-row group block border-b border-line pb-10"
                data-testid={`market-${market}`}
              >
                <span className="font-serif text-sm tracking-[0.2em] text-brass">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h2 className="mt-4 font-serif text-3xl transition-colors duration-500 group-hover:text-brass-dark md:text-4xl">
                  {markets(market)}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-ink-soft">
                  {markets(`${market}Lead`)}
                </p>
                <span className="mt-7 inline-flex items-center gap-2 text-xs tracking-[0.18em] uppercase text-brass opacity-60 transition-all duration-500 group-hover:gap-4 group-hover:opacity-100">
                  {t('viewAll')} <span aria-hidden>→</span>
                </span>
              </Link>
            </Reveal>
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
        <section className="mx-auto max-w-6xl px-6 pb-24 md:pb-32" data-testid="home-articles">
          <SectionHeader
            eyebrow={t('articlesTitle')}
            title={t('articlesLead')}
            action={
              <Link
                href="/articles"
                className="shrink-0 text-xs tracking-[0.18em] uppercase text-brass-dark transition hover:text-brass"
                data-testid="home-articles-view-all"
              >
                {t('articlesViewAll')}
              </Link>
            }
          />
          <ul className="grid gap-12 md:grid-cols-3 md:gap-14">
            {articles.map((article, index) => (
              <Reveal as="li" key={article.id} delay={index * 110}>
                <Link
                  href={`/articles/${article.id}`}
                  className="ruled-row group block border-b border-line pb-8"
                  data-testid={`home-article-${article.slug}`}
                >
                  {article.publishedAt !== null ? (
                    <p className="text-[11px] tracking-[0.18em] uppercase text-brass">
                      {new Date(article.publishedAt).toLocaleDateString(locale)}
                    </p>
                  ) : null}
                  <h3 className="mt-3 font-serif text-2xl leading-snug transition-colors duration-500 group-hover:text-brass-dark">
                    {article.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">{article.excerpt}</p>
                </Link>
              </Reveal>
            ))}
          </ul>
        </section>
      ) : null}

      {team.length > 0 ? (
        <section className="mx-auto max-w-6xl px-6 pb-24 md:pb-32" data-testid="home-team">
          <SectionHeader
            eyebrow={t('teamTitle')}
            title={t('teamLead')}
            action={
              <Link
                href="/team"
                className="shrink-0 text-xs tracking-[0.18em] uppercase text-brass-dark transition hover:text-brass"
                data-testid="home-team-view-all"
              >
                {t('teamViewAll')}
              </Link>
            }
          />
          <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
            {team.map((member, index) => (
              <Reveal as="li" key={member.id} delay={index * 110}>
                <Link
                  href={`/team/${member.id}`}
                  className="group block"
                  data-testid={`home-team-${member.slug}`}
                >
                  {member.photoUrl !== null ? (
                    <div className="relative aspect-[4/5] overflow-hidden bg-void/5">
                      <RemoteImage
                        src={member.photoUrl}
                        alt=""
                        fill
                        sizes="(max-width: 1024px) 50vw, 33vw"
                        className="object-cover object-top transition duration-[1400ms] ease-out group-hover:scale-[1.04]"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/30 via-transparent to-transparent" />
                    </div>
                  ) : (
                    <div className="aspect-[4/5] w-full overflow-hidden">
                      <MediaPlaceholder />
                    </div>
                  )}
                  <h3 className="mt-6 font-serif text-xl transition-colors duration-500 group-hover:text-brass-dark md:text-[1.4rem]">
                    {member.name}
                  </h3>
                  <p className="mt-1 text-sm text-ink-soft">{member.role}</p>
                </Link>
              </Reveal>
            ))}
          </ul>
        </section>
      ) : null}

      {partners.length > 0 ? (
        <section
          className="border-t border-line bg-paper/60 px-6 py-24 backdrop-blur-sm"
          data-testid="home-partners"
        >
          <Reveal className="mx-auto max-w-6xl">
            <p className="flex items-center gap-3 text-[11px] tracking-[0.24em] uppercase text-brass">
              <span className="h-px w-8 bg-brass" aria-hidden />
              {t('partnersTitle')}
            </p>
            <h2 className="mt-3 font-serif text-3xl md:text-[2.5rem]">{t('partnersLead')}</h2>
            <ul className="mt-14 flex flex-wrap items-center gap-x-14 gap-y-10">
              {partners.map((partner) => (
                <li key={partner.id}>
                  <a
                    href={partner.websiteUrl ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative block h-10 w-[140px] opacity-60 grayscale transition duration-500 hover:opacity-100 hover:grayscale-0"
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
          </Reveal>
        </section>
      ) : null}

      <HomeContactStrip settings={settings} />
    </main>
  );
}
