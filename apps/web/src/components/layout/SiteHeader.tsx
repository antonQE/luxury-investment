import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';

import { LanguageSwitcher } from './LanguageSwitcher';
import { MobileNav } from './MobileNav';
import { PRIMARY_NAV } from './nav';

export async function SiteHeader() {
  const t = await getTranslations('Nav');

  return (
    <header
      className="relative z-40 animate-fade-in border-b border-white/10 bg-void/95 text-stone backdrop-blur-md"
      data-testid="site-header"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4 md:py-5">
        <Link
          href="/"
          className="font-serif text-lg tracking-[0.04em] text-stone md:text-xl"
          data-testid="site-logo"
        >
          Luxury Investment
        </Link>
        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label={t('mainNav')}
          data-testid="desktop-nav"
        >
          {PRIMARY_NAV.map((item) =>
            'children' in item ? (
              <div key={item.href} className="group relative">
                <Link
                  href={item.href}
                  className="text-[13px] tracking-[0.04em] text-stone/70 transition hover:text-brass"
                  data-testid={`nav-${item.key}`}
                >
                  {t(item.key)}
                </Link>
                <div
                  className="invisible absolute left-0 top-full z-30 min-w-[12rem] pt-3 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
                  data-testid={`nav-${item.key}-submenu`}
                >
                  <ul className="border border-white/10 bg-void/95 py-2 backdrop-blur-md">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className="block px-4 py-2.5 text-[13px] text-stone/70 transition hover:text-brass"
                          data-testid={`nav-${child.key}`}
                        >
                          {t(child.key)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="text-[13px] tracking-[0.04em] text-stone/70 transition hover:text-brass"
                data-testid={`nav-${item.key}`}
              >
                {t(item.key)}
              </Link>
            ),
          )}
        </nav>
        <div className="flex items-center gap-5">
          <a
            href="tel:+35920000000"
            className="hidden text-[13px] tracking-wide text-brass md:inline"
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
