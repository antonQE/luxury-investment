import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { ApiError } from '@/lib/api/client';
import { fetchArticle } from '@/lib/api/content';
import { buildPageMetadata } from '@/lib/seo/metadata';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  try {
    const article = await fetchArticle(locale, slug);
    return buildPageMetadata({
      locale,
      path: `/stati/${slug}`,
      title: article.title,
      description: article.excerpt,
    });
  } catch {
    const t = await getTranslations('Articles');
    return buildPageMetadata({
      locale,
      path: `/stati/${slug}`,
      title: t('notFound'),
      description: t('lead'),
    });
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const t = await getTranslations('Articles');
  const locale = await getLocale();

  let article;
  try {
    article = await fetchArticle(locale, slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16" data-testid="article-page">
      <Link
        href="/stati"
        className="text-sm tracking-wide uppercase text-brass-dark transition hover:text-brass"
      >
        {t('back')}
      </Link>
      {article.coverUrl !== null ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote demo URLs
        <img
          src={article.coverUrl}
          alt=""
          className="mt-8 aspect-[16/9] w-full object-cover"
          data-testid="article-cover"
        />
      ) : null}
      <h1 className="mt-8 font-serif text-4xl">{article.title}</h1>
      {article.authorName !== null ? (
        <p className="mt-3 text-sm text-ink-soft">
          {t('by')} {article.authorName}
        </p>
      ) : null}
      <div className="mt-8 space-y-4 leading-relaxed whitespace-pre-line">{article.body}</div>
    </main>
  );
}
