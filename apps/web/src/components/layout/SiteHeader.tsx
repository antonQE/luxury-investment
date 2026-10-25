import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';

import { LanguageSwitcher } from './LanguageSwitcher';
import { MobileNav } from './MobileNav';

const LINKS = [
  { href: '/', key: 'home' },
  { href: '/obiavi', key: 'properties' },
  { href: '/za-nas', key: 'about' },
  { href: '/uslugi', key: 'services' },
  { href: '/contact', key: 'contact' },
] as const;

export async function SiteHeader() {
  const t = await getTranslations('Nav');

  return (
    <header className="relative bg-ink text-cream" data-testid="site-header">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-5">
        <Link href="/" className="font-serif text-xl tracking-wide" data-testid="site-logo">
          Luxury Investment
        </Link>
        <nav className="hidden items-center gap-6 md:flex" aria-label={t('properties')}>
          {LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm tracking-wide text-cream/80 transition hover:text-gold"
              data-testid={`nav-${item.key}`}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-5">
          <a
            href="tel:+35920000000"
            className="hidden text-sm text-gold md:inline"
            data-testid="header-phone"
          >
            {t('phone')}
          </a>
          <LanguageSwitcher />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
