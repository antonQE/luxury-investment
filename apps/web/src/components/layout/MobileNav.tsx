'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Link } from '@/i18n/navigation';

const LINKS = [
  { href: '/', key: 'home' },
  { href: '/obiavi', key: 'properties' },
  { href: '/za-nas', key: 'about' },
  { href: '/uslugi', key: 'services' },
  { href: '/contact', key: 'contact' },
] as const;

export function MobileNav() {
  const t = useTranslations('Nav');
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        className="border border-cream/30 px-3 py-1 text-xs tracking-[0.2em] uppercase text-cream"
        aria-expanded={open}
        data-testid="mobile-nav-toggle"
        onClick={() => {
          setOpen((value) => !value);
        }}
      >
        {open ? t('closeMenu') : t('openMenu')}
      </button>
      {open ? (
        <nav
          className="absolute inset-x-0 top-full z-20 border-t border-cream/10 bg-ink px-6 py-4"
          data-testid="mobile-nav"
        >
          <ul className="flex flex-col gap-3">
            {LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm tracking-wide text-cream"
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
