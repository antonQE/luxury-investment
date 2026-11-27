'use client';

import type { ReactNode } from 'react';
import { useSyncExternalStore } from 'react';

import { usePathname } from '@/i18n/navigation';

const SCROLL_THRESHOLD = 24;

function subscribe(onChange: () => void) {
  window.addEventListener('scroll', onChange, { passive: true });
  return () => {
    window.removeEventListener('scroll', onChange);
  };
}

function getSnapshot() {
  return window.scrollY > SCROLL_THRESHOLD;
}

function getServerSnapshot() {
  return false;
}

/**
 * Sticky header shell. At the top of the page it is flat (and see-through over the home
 * photograph); once the page scrolls it gains a soft blur and a brass hairline.
 */
export function HeaderChrome({ children }: { children: ReactNode }) {
  const scrolled = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const pathname = usePathname();
  const overHero = pathname === '/';

  // Two static layers instead of one animated background, so changing route (home <-> other)
  // swaps the header instantly; only the scroll blur fades.
  const solid = !overHero;

  return (
    <header
      className="sticky top-0 z-50 text-stone"
      data-testid="site-header"
      data-scrolled={scrolled}
      data-over-hero={overHero}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-void ${solid ? 'opacity-100' : 'opacity-0'}`}
        aria-hidden
      />
      <div
        className={`pointer-events-none absolute inset-0 border-b border-brass/25 bg-void/90 backdrop-blur-xl transition-opacity duration-300 ${
          scrolled ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden
      />
      <div className="relative">{children}</div>
    </header>
  );
}
