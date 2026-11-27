import { getTranslations } from 'next-intl/server';

import { PageHero } from '@/components/ui/PageHero';
import { Link } from '@/i18n/navigation';

export default async function NotFoundPage() {
  const t = await getTranslations('Errors');
  const nav = await getTranslations('Nav');

  return (
    <main data-testid="not-found">
      <PageHero title={t('notFoundTitle')} lead={t('notFoundBody')}>
        <Link
          href="/"
          className="inline-block text-xs tracking-[0.2em] uppercase text-brass transition hover:text-stone"
        >
          {nav('home')} →
        </Link>
      </PageHero>
      <div className="h-24 md:h-40" aria-hidden />
    </main>
  );
}
