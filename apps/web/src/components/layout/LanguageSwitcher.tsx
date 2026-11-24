'use client';

import { useLocale } from 'next-intl';

import { Link, usePathname } from '@/i18n/navigation';

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div
      className="flex items-center gap-2 text-sm tracking-[0.18em] uppercase"
      data-testid="language-switcher"
    >
      <Link
        href={pathname}
        locale="bg"
        className={locale === 'bg' ? 'text-brass' : 'text-stone/75 transition hover:text-stone'}
        data-testid="lang-bg"
      >
        BG
      </Link>
      <span className="text-stone/40" aria-hidden>
        /
      </span>
      <Link
        href={pathname}
        locale="en"
        className={locale === 'en' ? 'text-brass' : 'text-stone/75 transition hover:text-stone'}
        data-testid="lang-en"
      >
        EN
      </Link>
    </div>
  );
}
