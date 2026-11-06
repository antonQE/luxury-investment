import { toMailtoHref, toTelHref } from '@luxury-investment/shared';
import { getTranslations } from 'next-intl/server';

import { CookieSettingsButton } from '@/components/consent/CookieSettingsButton';
import { Link } from '@/i18n/navigation';
import { fetchSiteSettings } from '@/lib/api/site-settings';

import { PRIMARY_NAV } from './nav';

export async function SiteFooter() {
  const t = await getTranslations('Footer');
  const nav = await getTranslations('Nav');
  const settings = await fetchSiteSettings().catch(() => ({
    publicPhone: null as string | null,
    publicEmail: null as string | null,
  }));
  const phoneLabel = settings.publicPhone;
  const phoneHref = toTelHref(phoneLabel);
  const emailLabel = settings.publicEmail;
  const emailHref = toMailtoHref(emailLabel);

  return (
    <footer className="border-t border-white/10 bg-void text-stone" data-testid="site-footer">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-3">
        <div>
          <p className="font-serif text-2xl tracking-[0.03em]">Luxury Investment</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-stone/60">{t('tagline')}</p>
        </div>
        <div>
          <p className="text-[11px] tracking-[0.22em] uppercase text-brass">{t('office')}</p>
          <p className="mt-4 text-sm leading-relaxed text-stone/75">{t('address')}</p>
          {phoneHref !== null && phoneLabel !== null ? (
            <p className="mt-2 text-sm">
              <a
                href={phoneHref}
                className="transition hover:text-brass"
                data-testid="footer-phone"
              >
                {phoneLabel}
              </a>
            </p>
          ) : null}
          {emailHref !== null && emailLabel !== null ? (
            <p className="mt-1 text-sm">
              <a
                href={emailHref}
                className="transition hover:text-brass"
                data-testid="footer-email"
              >
                {emailLabel}
              </a>
            </p>
          ) : null}
        </div>
        <nav className="flex flex-col gap-2 text-sm" aria-label={nav('mainNav')}>
          {PRIMARY_NAV.flatMap((item) => {
            if ('children' in item) {
              return item.children.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className="transition hover:text-brass"
                  data-testid={`footer-nav-${child.key}`}
                >
                  {nav(child.key)}
                </Link>
              ));
            }
            if (item.href === '/') return [];
            return [
              <Link
                key={item.href}
                href={item.href}
                className="transition hover:text-brass"
                data-testid={`footer-nav-${item.key}`}
              >
                {nav(item.key)}
              </Link>,
            ];
          })}
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
