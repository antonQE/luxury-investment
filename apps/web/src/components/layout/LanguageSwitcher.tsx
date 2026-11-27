'use client';

import { useLocale } from 'next-intl';

import { Link, usePathname } from '@/i18n/navigation';

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  const linkClass = (active: boolean) =>
    [
      'relative px-0.5 pb-1 transition-colors duration-300',
      active ? 'text-brass' : 'text-stone/70 hover:text-stone',
      'after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:bg-brass after:transition-transform after:duration-300',
      active ? 'after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-100',
    ].join(' ');

  return (
    <div
      className="flex items-center gap-2.5 text-sm tracking-[0.18em] uppercase"
      data-testid="language-switcher"
    >
      <Link
        href={pathname}
        locale="bg"
        className={linkClass(locale === 'bg')}
        aria-current={locale === 'bg' ? 'page' : undefined}
        data-testid="lang-bg"
      >
        BG
      </Link>
      <span className="text-stone/35" aria-hidden>
        /
      </span>
      <Link
        href={pathname}
        locale="en"
        className={linkClass(locale === 'en')}
        aria-current={locale === 'en' ? 'page' : undefined}
        data-testid="lang-en"
      >
        EN
      </Link>
    </div>
  );
}
