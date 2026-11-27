import { toMailtoHref, toTelHref } from '@luxury-investment/shared';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

import { CookieSettingsButton } from '@/components/consent/CookieSettingsButton';
import { LegalLink } from '@/components/legal/LegalLink';
import { Reveal } from '@/components/ui/Reveal';
import { Link } from '@/i18n/navigation';
import { fetchSiteSettings } from '@/lib/api/site-settings';

import { PRIMARY_NAV } from './nav';

export async function SiteFooter() {
  const t = await getTranslations('Footer');
  const nav = await getTranslations('Nav');
  const settings = await fetchSiteSettings().catch(() => ({
    publicPhone: null as string | null,
    publicEmail: null as string | null,
    facebookUrl: null as string | null,
    instagramUrl: null as string | null,
    tiktokUrl: null as string | null,
  }));
  const phoneLabel = settings.publicPhone;
  const phoneHref = toTelHref(phoneLabel);
  const emailLabel = settings.publicEmail;
  const emailHref = toMailtoHref(emailLabel);

  return (
    <footer className="bg-void text-stone" data-testid="site-footer">
      <span className="brass-rule mx-auto max-w-6xl opacity-60" aria-hidden />
      <Reveal className="mx-auto grid max-w-6xl gap-14 px-6 py-20 md:grid-cols-3 md:gap-12 md:py-24">
        <div>
          <div className="aspect-[1024/181] w-60 overflow-hidden" data-testid="footer-logo">
            <Image
              src="/brand/logo-luxury-investment.png"
              alt="Luxury Investment"
              width={1024}
              height={237}
              className="-mt-[4.5%] -ml-[8%] h-auto w-[116%] max-w-none"
            />
          </div>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-stone/60">{t('tagline')}</p>
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
          <LegalLink
            page="privacy"
            className="mt-2 text-xs tracking-[0.15em] uppercase text-stone/50 transition hover:text-brass"
            data-testid="footer-privacy"
          >
            {t('privacy')}
          </LegalLink>
          <CookieSettingsButton />
        </nav>
      </Reveal>
      <div className="border-t border-stone/10 px-6 py-5 text-center text-xs tracking-[0.08em] text-stone/45">
        {t('rights', { year: new Date().getFullYear() })}
      </div>
    </footer>
  );
}
