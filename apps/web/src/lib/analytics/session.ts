const SESSION_KEY = 'li_analytics_session';

function randomKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `li-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Opaque first-party session id for unique-view estimates (not PII). */
export function getAnalyticsSessionKey(): string {
  try {
    const existing = window.localStorage.getItem(SESSION_KEY);
    if (existing !== null && existing.length >= 8) return existing;
    const next = randomKey();
    window.localStorage.setItem(SESSION_KEY, next);
    return next;
  } catch {
    return randomKey();
  }
}

export function deviceClass(): string {
  if (typeof window === 'undefined') return '';
  return window.matchMedia('(max-width: 768px)').matches ? 'mobile' : 'desktop';
}

/** Strip locale prefix (`/bg`, `/en`) for stable analytics paths. */
export function normalizeAnalyticsPath(pathname: string): string {
  const stripped = pathname.replace(/^\/(bg|en)(?=\/|$)/, '');
  return stripped === '' ? '/' : stripped;
}
