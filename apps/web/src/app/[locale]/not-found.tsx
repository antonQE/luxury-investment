import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';

export default async function NotFoundPage() {
  const t = await getTranslations('Errors');
  const nav = await getTranslations('Nav');

  return (
    <main className="mx-auto max-w-xl px-6 py-24 text-center" data-testid="not-found">
      <h1 className="font-serif text-4xl">{t('notFoundTitle')}</h1>
      <p className="mt-4 text-ink-soft">{t('notFoundBody')}</p>
      <Link href="/" className="mt-8 inline-block text-gold-dark">
        {nav('home')}
      </Link>
    </main>
  );
}
