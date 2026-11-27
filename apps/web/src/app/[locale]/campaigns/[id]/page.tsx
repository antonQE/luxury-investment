import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';

import { LandingSections } from '@/components/content/LandingSections';
import { fetchLanding } from '@/lib/api/content';
import { buildPageMetadata } from '@/lib/seo/metadata';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const locale = await getLocale();
  try {
    const landing = await fetchLanding(locale, id);
    const meta = buildPageMetadata({
      locale,
      path: `/campaigns/${id}`,
      title: landing.seoTitle || landing.title,
      description: landing.seoDescription || landing.title,
    });
    return {
      ...meta,
      robots: landing.robots,
    };
  } catch {
    return buildPageMetadata({
      locale,
      path: `/campaigns/${id}`,
      title: 'Not found',
      description: '',
    });
  }
}

export default async function CampaignLandingPage({ params }: PageProps) {
  const { id } = await params;
  const locale = await getLocale();
  let landing;
  try {
    landing = await fetchLanding(locale, id);
  } catch {
    notFound();
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-16" data-testid="landing-page">
      <LandingSections
        locale={locale}
        landingSlug={landing.slug}
        campaignKey={landing.campaignKey}
        sections={landing.sections}
      />
    </main>
  );
}
