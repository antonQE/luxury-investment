'use client';

import { useEffect, useRef, useState } from 'react';

import { usePathname } from '@/i18n/navigation';

/**
 * Thin brass progress bar for client navigations — starts on internal link click,
 * completes when the pathname settles.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const isFirstPath = useRef(true);
  const tickTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function clearTimers() {
      if (tickTimer.current !== null) clearInterval(tickTimer.current);
      if (hideTimer.current !== null) clearTimeout(hideTimer.current);
    }

    function start() {
      clearTimers();
      setVisible(true);
      setWidth(12);
      tickTimer.current = setInterval(() => {
        setWidth((current) => {
          if (current >= 88) return current;
          return current + Math.max(1, (90 - current) * 0.08);
        });
      }, 180);
    }

    function onClick(event: MouseEvent) {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
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
      start();
    }

    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('click', onClick, true);
      clearTimers();
    };
  }, []);

  useEffect(() => {
    if (isFirstPath.current) {
      isFirstPath.current = false;
      return;
    }
    if (tickTimer.current !== null) clearInterval(tickTimer.current);
    setWidth(100);
    hideTimer.current = setTimeout(() => {
      setVisible(false);
      setWidth(0);
    }, 280);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  if (!visible && width === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[2px]"
      role="progressbar"
      aria-hidden={!visible}
      data-testid="nav-progress"
    >
      <div
        className="h-full origin-left bg-brass shadow-[0_0_12px_rgba(166,132,69,0.55)] transition-[width] duration-200 ease-out"
        style={{ width: `${String(width)}%`, opacity: visible ? 1 : 0 }}
      />
    </div>
  );
}
