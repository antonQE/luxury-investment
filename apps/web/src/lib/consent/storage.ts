export const CONSENT_STORAGE_KEY = 'li_cookie_consent_v1';
export const CONSENT_CHANGE_EVENT = 'li-cookie-consent-change';
export const CONSENT_OPEN_EVENT = 'li-cookie-consent-open';

export interface CookieConsent {
  necessary: true;
  analytics: boolean;
  updatedAt: string;
}

export function readConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (raw === null) return null;
    const parsed = JSON.parse(raw) as Partial<CookieConsent>;
    if (parsed.necessary !== true || typeof parsed.analytics !== 'boolean') return null;
    return {
      necessary: true,
      analytics: parsed.analytics,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function writeConsent(analytics: boolean): CookieConsent {
  const value: CookieConsent = {
    necessary: true,
    analytics,
    updatedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: value }));
  return value;
}

export function openConsentPreferences(): void {
  window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
}
