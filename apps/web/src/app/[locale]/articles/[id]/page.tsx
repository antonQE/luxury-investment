import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';

import { PlainTextBody } from '@/components/content/PlainTextBody';
import { MediaPlaceholder } from '@/components/ui/MediaPlaceholder';
import { PageHero } from '@/components/ui/PageHero';
import { Reveal } from '@/components/ui/Reveal';
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

  const meta = await getTranslations('Meta');

  return (
    <main data-testid="article-page">
      <PageHero
        eyebrow={meta('siteName')}
        title={article.title}
        tall
        media={
          article.coverUrl !== null ? (
            // eslint-disable-next-line @next/next/no-img-element -- remote demo URLs
            <img
              src={article.coverUrl}
              alt=""
              className="hero-media size-full object-cover"
              data-testid="article-cover"
            />
          ) : (
            <div className="size-full" data-testid="article-cover-placeholder">
              <MediaPlaceholder />
            </div>
          )
        }
        lead={
          article.authorName !== null ? (
            <>
              {t('by')} {article.authorName}
            </>
          ) : undefined
        }
      />
      <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <Link
          href="/articles"
          className="text-xs tracking-[0.2em] uppercase text-brass-dark transition hover:text-brass"
        >
          {t('back')}
        </Link>
        <Reveal>
          <PlainTextBody
            text={article.body}
            className="mt-10 space-y-5 text-lg leading-relaxed text-ink-soft"
            testId="article-body"
          />
        </Reveal>
      </div>
    </main>
  );
}
