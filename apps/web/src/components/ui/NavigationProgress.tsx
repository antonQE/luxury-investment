'use client';

import { useEffect, useRef, useState } from 'react';

import { usePathname } from '@/i18n/navigation';

/**
 * Thin brass progress bar for client navigations — CSS width transition only (no interval ticks).
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [done, setDone] = useState(false);
  const isFirstPath = useRef(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest('a');
      if (anchor === null) return;
      if (anchor.target === '_blank' || anchor.hasAttribute('download')) return;
      const href = anchor.getAttribute('href');
      if (
        href === null ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:')
      ) {
        return;
      }
      if (/^https?:\/\//i.test(href) && !href.startsWith(window.location.origin)) return;
      if (hideTimer.current !== null) clearTimeout(hideTimer.current);
      setDone(false);
      setActive(true);
    }

    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('click', onClick, true);
      if (hideTimer.current !== null) clearTimeout(hideTimer.current);
    };
  }, []);

  useEffect(() => {
    if (isFirstPath.current) {
      isFirstPath.current = false;
      return;
    }
    setDone(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    hideTimer.current = setTimeout(() => {
      setActive(false);
      setDone(false);
    }, 320);
  }, [pathname]);

  if (!active) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[2px]"
      role="progressbar"
      aria-hidden
      data-testid="nav-progress"
    >
      <div
        className="h-full origin-left bg-brass shadow-[0_0_12px_rgba(166,132,69,0.55)] transition-[width] duration-300 ease-out"
        style={{ width: done ? '100%' : '72%' }}
      />
    </div>
  );
}
