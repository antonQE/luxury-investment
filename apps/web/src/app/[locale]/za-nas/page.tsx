import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('About');
  return { title: t('title'), description: t('lead') };
}

export default async function AboutPage() {
  const t = await getTranslations('About');

  return (
    <main className="mx-auto max-w-3xl px-6 py-16" data-testid="about-page">
      <h1 className="font-serif text-4xl">{t('title')}</h1>
      <p className="mt-4 text-lg text-ink-soft">{t('lead')}</p>
      <p className="mt-6 leading-relaxed">{t('body')}</p>
    </main>
  );
}
