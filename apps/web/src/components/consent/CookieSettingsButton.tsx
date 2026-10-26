'use client';

import { useTranslations } from 'next-intl';

import { openConsentPreferences } from '@/lib/consent/storage';

export function CookieSettingsButton() {
  const t = useTranslations('CookieConsent');

  return (
    <button
      type="button"
      className="mt-2 text-left text-xs tracking-[0.15em] uppercase text-stone/50 transition hover:text-brass"
      onClick={() => {
        openConsentPreferences();
      }}
      data-testid="footer-cookie-settings"
    >
      {t('settings')}
    </button>
  );
}
