'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { normalizeAnalyticsPath } from '@/lib/analytics/session';
import { trackSiteEvent, trackSiteSessionPing } from '@/lib/analytics/track';

const HEARTBEAT_MS = 15_000;

function clickLabel(el: HTMLElement): string {
  const analytics = el.getAttribute('data-analytics');
  if (analytics !== null && analytics.trim() !== '') return analytics.trim().slice(0, 200);
  const aria = el.getAttribute('aria-label');
  if (aria !== null && aria.trim() !== '') return aria.trim().slice(0, 200);
  // DOM typings say `string`; some hosts still return null at runtime.
  const raw = el.textContent as unknown as string | null;
  const text = (raw ?? '').replace(/\s+/g, ' ').trim();
  return text.slice(0, 200);
}

/**
 * Invisible first-party site analytics: page views, clicks, engaged-time pings.
 * Counts are admin-only; nothing is rendered for visitors.
 */
export function SiteAnalytics() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);
  const engagedStartedAt = useRef<number>(0);
  const visible = useRef(true);

  useEffect(() => {
    const path = normalizeAnalyticsPath(pathname);
    if (lastPath.current === path) return;
    lastPath.current = path;
    trackSiteEvent({ path, eventType: 'page_view' });
  }, [pathname]);

  useEffect(() => {
    engagedStartedAt.current = Date.now();

    function flushEngaged(): void {
      if (!visible.current) return;
      const now = Date.now();
      const started = engagedStartedAt.current;
      if (started <= 0) {
        engagedStartedAt.current = now;
        return;
      }
      const delta = now - started;
      engagedStartedAt.current = now;
      if (delta >= 1000) trackSiteSessionPing(delta);
    }

    function onVisibility(): void {
      if (document.visibilityState === 'hidden') {
        flushEngaged();
        visible.current = false;
        return;
      }
      visible.current = true;
      engagedStartedAt.current = Date.now();
    }

    function onPageHide(): void {
      flushEngaged();
    }

    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') flushEngaged();
    }, HEARTBEAT_MS);

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
      flushEngaged();
    };
  }, []);

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
