const VISITOR_KEY = 'li_analytics_visitor';
/** Legacy key — treated as visitor id when migrating. */
const LEGACY_SESSION_KEY = 'li_analytics_session';
const SESSION_KEY = 'li_analytics_session_id';
const SESSION_LAST_ACTIVITY_KEY = 'li_analytics_session_at';
const SESSION_IDLE_MS = 30 * 60 * 1000;

function randomKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `li-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function readStorage(storage: Storage, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(storage: Storage, key: string, value: string): void {
  try {
    storage.setItem(key, value);
  } catch {
    // private mode / quota — ignore
  }
}

/** Opaque persistent visitor id (not PII). */
export function getAnalyticsVisitorKey(): string {
  if (typeof window === 'undefined') return randomKey();
  try {
    const existing = window.localStorage.getItem(VISITOR_KEY);
    if (existing !== null && existing.length >= 8) return existing;

    const legacy = window.localStorage.getItem(LEGACY_SESSION_KEY);
    const next = legacy !== null && legacy.length >= 8 ? legacy : randomKey();
    window.localStorage.setItem(VISITOR_KEY, next);
    return next;
  } catch {
    return randomKey();
  }
}

/**
 * Short-lived session id (sessionStorage + 30 min idle refresh).
 * Also exposed as getAnalyticsSessionKey for existing call sites.
 */
export function getAnalyticsSessionKey(): string {
  if (typeof window === 'undefined') return randomKey();

  const now = Date.now();
  try {
    const existing = readStorage(window.sessionStorage, SESSION_KEY);
    const lastRaw = readStorage(window.sessionStorage, SESSION_LAST_ACTIVITY_KEY);
    const last = lastRaw !== null ? Number(lastRaw) : NaN;
    const expired = !Number.isFinite(last) || now - last > SESSION_IDLE_MS;

    if (existing !== null && existing.length >= 8 && !expired) {
      writeStorage(window.sessionStorage, SESSION_LAST_ACTIVITY_KEY, String(now));
      return existing;
    }

    const next = randomKey();
    writeStorage(window.sessionStorage, SESSION_KEY, next);
    writeStorage(window.sessionStorage, SESSION_LAST_ACTIVITY_KEY, String(now));
    return next;
  } catch {
    return randomKey();
  }
}

/** Mark session activity (call on engaged pings). */
export function touchAnalyticsSessionActivity(): void {
  if (typeof window === 'undefined') return;
  writeStorage(window.sessionStorage, SESSION_LAST_ACTIVITY_KEY, String(Date.now()));
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

export const ANALYTICS_SESSION_IDLE_MS = SESSION_IDLE_MS;
