'use client';

import Image from 'next/image';
import { useSyncExternalStore } from 'react';

import { Link, usePathname } from '@/i18n/navigation';

const REVEAL_AFTER = 240;

function subscribe(onChange: () => void) {
  window.addEventListener('scroll', onChange, { passive: true });
  return () => {
    window.removeEventListener('scroll', onChange);
  };
}

function getSnapshot() {
  return window.scrollY > REVEAL_AFTER;
}

function getServerSnapshot() {
  return false;
}

/**
 * Brand mark in the header. On the home page the hero already carries the large logo,
 * so the small one fades in only after the visitor has scrolled past it.
 */
export function HeaderLogo() {
  const pathname = usePathname();
  const scrolledPastHero = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const hidden = pathname === '/' && !scrolledPastHero;

  return (
    <Link
      href="/"
      className={`relative z-10 block aspect-[1024/109] w-[150px] shrink-0 overflow-hidden transition-opacity duration-500 sm:aspect-[1024/181] sm:w-[176px] xl:w-[200px] ${
        hidden ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
      aria-hidden={hidden}
      tabIndex={hidden ? -1 : undefined}
      data-testid="site-logo"
    >
      {/* The PNG has empty margins; crop them by aspect ratio. Narrow screens show the wordmark
          only, wider ones the wordmark plus the tagline, so the tagline is never cut mid-word. */}
      <Image
        src="/brand/logo-luxury-investment.png"
        alt="Luxury Investment"
        width={1024}
        height={237}
        className="-mt-[4.5%] -ml-[8%] h-auto w-[116%] max-w-none"
      />
    </Link>
  );
}
