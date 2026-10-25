import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';

export async function SiteFooter() {
  const t = await getTranslations('Footer');
  const nav = await getTranslations('Nav');

  return (
    <footer className="mt-auto bg-ink text-cream" data-testid="site-footer">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-3">
        <div>
          <p className="font-serif text-2xl">Luxury Investment</p>
          <p className="mt-3 max-w-sm text-sm text-cream/70">{t('tagline')}</p>
        </div>
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-gold">{t('office')}</p>
          <p className="mt-3 text-sm text-cream/80">{t('address')}</p>
          <p className="mt-2 text-sm">
            <a href="tel:+35920000000" className="hover:text-gold">
              {nav('phone')}
            </a>
          </p>
          <p className="mt-1 text-sm">
            <a href="mailto:hello@example.com" className="hover:text-gold">
              {t('email')}
            </a>
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <Link href="/obiavi" className="hover:text-gold">
            {nav('properties')}
          </Link>
          <Link href="/za-nas" className="hover:text-gold">
            {nav('about')}
          </Link>
          <Link href="/contact" className="hover:text-gold">
            {nav('contact')}
          </Link>
        </div>
      </div>
      <div className="border-t border-cream/10 px-6 py-4 text-center text-xs text-cream/50">
        {t('rights', { year: new Date().getFullYear() })}
      </div>
    </footer>
  );
}
