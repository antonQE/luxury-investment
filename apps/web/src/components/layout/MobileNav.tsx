'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Link } from '@/i18n/navigation';

import { PRIMARY_NAV } from './nav';

export function MobileNav() {
  const t = useTranslations('Nav');
  const [open, setOpen] = useState(false);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  function closeAll() {
    setOpen(false);
    setExpandedKey(null);
  }

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className="border border-stone/30 px-3 py-1 text-xs tracking-[0.2em] uppercase text-stone"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        data-testid="mobile-nav-toggle"
        onClick={() => {
          setOpen((value) => {
            if (value) setExpandedKey(null);
            return !value;
          });
        }}
      >
        {open ? t('closeMenu') : t('openMenu')}
      </button>
      {open ? (
        <nav
          id="mobile-nav-panel"
          className="absolute inset-x-0 top-full z-20 border-t border-brass/20 bg-void px-6 py-4"
          aria-label={t('mainNav')}
          data-testid="mobile-nav"
        >
          <ul className="flex flex-col gap-3">
            {PRIMARY_NAV.map((item) =>
              'children' in item ? (
                <li key={item.key}>
                  <button
                    type="button"
                    className="text-left text-sm tracking-wide text-stone"
                    aria-expanded={expandedKey === item.key}
                    data-testid={`mobile-nav-${item.key}`}
                    onClick={() => {
                      setExpandedKey((current) => (current === item.key ? null : item.key));
                    }}
                  >
                    {t(item.key)}
                  </button>
                  {expandedKey === item.key ? (
                    <ul className="mt-2 flex flex-col gap-2 border-l border-brass/30 pl-3">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className="text-sm text-stone/70"
                            data-testid={`mobile-nav-${child.key}`}
                            onClick={closeAll}
                          >
                            {t(child.key)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ) : (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm tracking-wide text-stone"
                    data-testid={`mobile-nav-${item.key}`}
                    onClick={closeAll}
                  >
                    {t(item.key)}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
