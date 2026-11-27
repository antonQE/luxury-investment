import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';

import { PlainTextBody } from '@/components/content/PlainTextBody';
import { Link } from '@/i18n/navigation';
import { ApiError } from '@/lib/api/client';
import { fetchArticle } from '@/lib/api/content';
import { buildPageMetadata } from '@/lib/seo/metadata';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const locale = await getLocale();
  try {
    const article = await fetchArticle(locale, id);
    return buildPageMetadata({
      locale,
      path: `/articles/${id}`,
      title: article.title,
      description: article.excerpt,
    });
  } catch {
    const t = await getTranslations('Articles');
    return buildPageMetadata({
      locale,
      path: `/articles/${id}`,
      title: t('notFound'),
      description: t('lead'),
    });
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const { id } = await params;
  const t = await getTranslations('Articles');
  const locale = await getLocale();

  let article;
  try {
    article = await fetchArticle(locale, id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16" data-testid="article-page">
      <Link
        href="/articles"
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
      <PlainTextBody text={article.body} testId="article-body" />
    </main>
  );
}
