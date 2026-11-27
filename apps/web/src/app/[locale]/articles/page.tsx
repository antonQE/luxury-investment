import type { PublicArticleListItem } from '@luxury-investment/shared';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';

import { EmptyState } from '@/components/ui/EmptyState';
import { PageHero } from '@/components/ui/PageHero';
import { Reveal } from '@/components/ui/Reveal';
import { Link } from '@/i18n/navigation';
import { fetchArticles } from '@/lib/api/content';
import { buildPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Articles');
  const locale = await getLocale();
  return buildPageMetadata({
    locale,
    path: '/articles',
    title: t('title'),
    description: t('lead'),
  });
}

export default async function ArticlesPage() {
  const t = await getTranslations('Articles');
  const meta = await getTranslations('Meta');
  const locale = await getLocale();

  let articles: PublicArticleListItem[] = [];
  let loadError = false;
  try {
    articles = await fetchArticles(locale);
  } catch {
    loadError = true;
  }

  return (
    <main data-testid="articles-page">
      <PageHero eyebrow={meta('siteName')} title={t('title')} lead={t('lead')} />
      <div className="mx-auto max-w-4xl px-6 py-20 md:py-28">
        {loadError ? (
          <p className="text-ink-soft" data-testid="articles-error">
            {t('error')}
          </p>
        ) : articles.length === 0 ? (
          <EmptyState title={t('empty')} />
        ) : (
          <ul className="border-t border-line">
            {articles.map((article, index) => (
              <Reveal as="li" key={article.id} delay={(index % 4) * 70}>
                <Link
                  href={`/articles/${article.id}`}
                  className="ruled-row group block border-b border-line py-9 transition-[padding] duration-500 hover:pl-3"
                  data-testid={`article-card-${article.slug}`}
                >
                  {article.publishedAt !== null ? (
                    <p className="text-[11px] tracking-[0.2em] uppercase text-brass">
                      {new Date(article.publishedAt).toLocaleDateString(locale)}
                    </p>
                  ) : null}
                  <h2 className="mt-3 font-serif text-2xl leading-snug transition-colors duration-500 group-hover:text-brass-dark md:text-[2rem]">
                    {article.title}
                  </h2>
                  <p className="mt-3 max-w-2xl text-ink-soft">{article.excerpt}</p>
                </Link>
              </Reveal>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
