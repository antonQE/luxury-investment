import type { PublicArticleListItem } from '@luxury-investment/shared';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { fetchArticles } from '@/lib/api/content';
import { buildPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Articles');
  const locale = await getLocale();
  return buildPageMetadata({
    locale,
    path: '/stati',
    title: t('title'),
    description: t('lead'),
  });
}

export default async function ArticlesPage() {
  const t = await getTranslations('Articles');
  const locale = await getLocale();

  let articles: PublicArticleListItem[] = [];
  let loadError = false;
  try {
    articles = await fetchArticles(locale);
  } catch {
    loadError = true;
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-16" data-testid="articles-page">
      <h1 className="font-serif text-4xl">{t('title')}</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink-soft">{t('lead')}</p>

      {loadError ? (
        <p className="mt-10 text-ink-soft" data-testid="articles-error">
          {t('error')}
        </p>
      ) : articles.length === 0 ? (
        <p className="mt-10 text-ink-soft">{t('empty')}</p>
      ) : (
        <ul className="mt-12 space-y-8">
          {articles.map((article) => (
            <li key={article.id} className="border-b border-line pb-8">
              <Link
                href={`/stati/${article.slug}`}
                className="group block"
                data-testid={`article-card-${article.slug}`}
              >
                <h2 className="font-serif text-2xl group-hover:text-brass-dark">{article.title}</h2>
                <p className="mt-2 text-ink-soft">{article.excerpt}</p>
                {article.publishedAt !== null ? (
                  <p className="mt-3 text-xs tracking-wide uppercase text-brass">
                    {new Date(article.publishedAt).toLocaleDateString(locale)}
                  </p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
