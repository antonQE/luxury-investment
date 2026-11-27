import {
  deviceClass,
  getAnalyticsSessionKey,
  getAnalyticsVisitorKey,
  touchAnalyticsSessionActivity,
} from './session';

function apiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
}

function postBeacon(path: string, body: Record<string, unknown>): void {
  const url = `${apiBase()}${path}`;
  const payload = JSON.stringify(body);
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([payload], { type: 'application/json' });
      if (navigator.sendBeacon(url, blob)) return;
    }
  } catch {
    // fall through to fetch
  }
  void fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: payload,
    keepalive: true,
    credentials: 'omit',
  }).catch(() => undefined);
}

export function trackPropertyEvent(input: {
  propertyId: string;
  eventType: 'page_view' | 'gallery_open' | 'contact_click' | 'phone_click' | 'email_click';
  source?: string;
}): void {
  postBeacon('/v1/public/analytics/events', {
    propertyId: input.propertyId,
    eventType: input.eventType,
    sessionKey: getAnalyticsSessionKey(),
    source: input.source ?? 'web',
    deviceClass: deviceClass(),
    website: '',
  });
}

export function trackSiteEvent(input: {
  path: string;
  eventType: 'page_view' | 'click';
  label?: string;
  href?: string;
}): void {
  postBeacon('/v1/public/analytics/site-events', {
    path: input.path,
    eventType: input.eventType,
    label: input.label ?? '',
    href: input.href ?? '',
    sessionKey: getAnalyticsSessionKey(),
    visitorKey: getAnalyticsVisitorKey(),
    deviceClass: deviceClass(),
    website: '',
  });
}

export function trackSiteSessionPing(engagedMsDelta: number): void {
  const delta = Math.max(0, Math.min(Math.round(engagedMsDelta), 120_000));
  if (delta <= 0) return;
  touchAnalyticsSessionActivity();
  postBeacon('/v1/public/analytics/site-session-ping', {
    sessionKey: getAnalyticsSessionKey(),
    visitorKey: getAnalyticsVisitorKey(),
    engagedMsDelta: delta,
    website: '',
  });
}
