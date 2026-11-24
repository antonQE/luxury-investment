'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { normalizeAnalyticsPath } from '@/lib/analytics/session';
import { trackSiteEvent } from '@/lib/analytics/track';

function clickLabel(el: HTMLElement): string {
  const analytics = el.getAttribute('data-analytics');
  if (analytics !== null && analytics.trim() !== '') return analytics.trim().slice(0, 200);
  const aria = el.getAttribute('aria-label');
  if (aria !== null && aria.trim() !== '') return aria.trim().slice(0, 200);
  const text = el.textContent.replace(/\s+/g, ' ').trim();
  return text.slice(0, 200);
}

/**
 * Invisible first-party site analytics: page views + link clicks.
 * Counts are admin-only; nothing is rendered for visitors.
 */
export function SiteAnalytics() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    const path = normalizeAnalyticsPath(pathname);
    if (lastPath.current === path) return;
    lastPath.current = path;
    trackSiteEvent({ path, eventType: 'page_view' });
  }, [pathname]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest('a,button,[data-analytics]');
      if (!(anchor instanceof HTMLElement)) return;
      if (anchor.getAttribute('data-analytics-ignore') === 'true') return;

      const path = normalizeAnalyticsPath(window.location.pathname);
      const href =
        anchor instanceof HTMLAnchorElement
          ? (anchor.getAttribute('href') ?? '')
          : (anchor.getAttribute('href') ?? '');
      const label = clickLabel(anchor);
      if (label === '' && href === '') return;

      trackSiteEvent({
        path,
        eventType: 'click',
        label: label || href,
        href,
      });
    }

    document.addEventListener('click', onClick, { capture: true, passive: true });
    return () => {
      document.removeEventListener('click', onClick, true);
    };
  }, []);

  return null;
}
