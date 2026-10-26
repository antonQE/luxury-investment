import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';

import { ApiError } from '@/lib/api/client';
import { fetchPage } from '@/lib/api/content';
import { buildPageMetadata } from '@/lib/seo/metadata';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  try {
    const page = await fetchPage(locale, slug);
    return buildPageMetadata({
      locale,
      path: `/stranici/${slug}`,
      title: page.title,
      description: page.body.slice(0, 160),
    });
  } catch {
    const t = await getTranslations('CmsPage');
    return buildPageMetadata({
      locale,
      path: `/stranici/${slug}`,
      title: t('notFound'),
      description: t('lead'),
    });
  }
}

export default async function CmsPage({ params }: PageProps) {
  const { slug } = await params;
  const locale = await getLocale();

  let page;
  try {
    page = await fetchPage(locale, slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16" data-testid="cms-page">
      {page.heroUrl !== null ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote demo URLs
        <img src={page.heroUrl} alt="" className="mb-10 aspect-[21/9] w-full object-cover" />
      ) : null}
      <h1 className="font-serif text-4xl">{page.title}</h1>
      <div className="mt-8 space-y-4 leading-relaxed whitespace-pre-line">{page.body}</div>
    </main>
  );
}
