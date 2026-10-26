export const CONSENT_STORAGE_KEY = 'li_cookie_consent_v1';
export const CONSENT_CHANGE_EVENT = 'li-cookie-consent-change';
export const CONSENT_OPEN_EVENT = 'li-cookie-consent-open';

export interface CookieConsent {
  necessary: true;
  analytics: boolean;
  updatedAt: string;
}

/** Cached so `useSyncExternalStore` getSnapshot stays referentially stable. */
let cachedRaw: string | null | undefined;
let cachedValue: CookieConsent | null = null;

function parseConsent(raw: string): CookieConsent | null {
  try {
    const parsed = JSON.parse(raw) as Partial<CookieConsent>;
    if (parsed.necessary !== true || typeof parsed.analytics !== 'boolean') return null;
    return {
      necessary: true,
      analytics: parsed.analytics,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '',
    };
  } catch {
    return null;
  }
}

export function readConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
  if (raw === cachedRaw) return cachedValue;
  cachedRaw = raw;
  cachedValue = raw === null ? null : parseConsent(raw);
  return cachedValue;
}

export function writeConsent(analytics: boolean): CookieConsent {
  const value: CookieConsent = {
    necessary: true,
    analytics,
    updatedAt: new Date().toISOString(),
  };
  const raw = JSON.stringify(value);
  window.localStorage.setItem(CONSENT_STORAGE_KEY, raw);
  cachedRaw = raw;
  cachedValue = value;
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: value }));
  return value;
}

export function openConsentPreferences(): void {
  window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
}

export function subscribeConsent(onStoreChange: () => void): () => void {
  window.addEventListener(CONSENT_CHANGE_EVENT, onStoreChange);
  window.addEventListener('storage', onStoreChange);
  return () => {
    window.removeEventListener(CONSENT_CHANGE_EVENT, onStoreChange);
    window.removeEventListener('storage', onStoreChange);
  };
}
