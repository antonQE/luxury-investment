import { getTranslations } from 'next-intl/server';

import { CookieSettingsButton } from '@/components/consent/CookieSettingsButton';
import { Link } from '@/i18n/navigation';

import { PRIMARY_NAV } from './nav';

export async function SiteFooter() {
  const t = await getTranslations('Footer');
  const nav = await getTranslations('Nav');

  return (
    <footer className="mt-auto bg-void text-stone" data-testid="site-footer">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-3">
        <div>
          <p className="font-serif text-2xl">Luxury Investment</p>
          <p className="mt-3 max-w-sm text-sm text-stone/70">{t('tagline')}</p>
        </div>
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-brass">{t('office')}</p>
          <p className="mt-3 text-sm text-stone/80">{t('address')}</p>
          <p className="mt-2 text-sm">
            <a
              href="tel:+35920000000"
              className="transition hover:text-brass"
              data-testid="footer-phone"
            >
              {nav('phone')}
            </a>
          </p>
          <p className="mt-1 text-sm">
            <a
              href="mailto:hello@example.com"
              className="transition hover:text-brass"
              data-testid="footer-email"
            >
              {t('email')}
            </a>
          </p>
        </div>
        <nav className="flex flex-col gap-2 text-sm" aria-label={nav('mainNav')}>
          {PRIMARY_NAV.filter((item) => item.href !== '/').map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-brass"
              data-testid={`footer-nav-${item.key}`}
            >
              {nav(item.key)}
            </Link>
          ))}
          <Link
            href="/stranici/privacy"
            className="mt-2 text-xs tracking-[0.15em] uppercase text-stone/50 transition hover:text-brass"
            data-testid="footer-privacy"
          >
            {t('privacy')}
          </Link>
          <CookieSettingsButton />
        </nav>
      </div>
      <div className="border-t border-brass/15 px-6 py-4 text-center text-xs text-stone/50">
        {t('rights', { year: new Date().getFullYear() })}
      </div>
    </footer>
  );
}
