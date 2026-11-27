'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState, useSyncExternalStore } from 'react';

import { LegalLink } from '@/components/legal/LegalLink';
import {
  CONSENT_OPEN_EVENT,
  readConsent,
  subscribeConsent,
  writeConsent,
} from '@/lib/consent/storage';

export function CookieConsentBanner() {
  const t = useTranslations('CookieConsent');
  const consent = useSyncExternalStore(subscribeConsent, readConsent, () => null);
  const [forcedOpen, setForcedOpen] = useState(false);

  useEffect(() => {
    function onOpen() {
      setForcedOpen(true);
    }
    window.addEventListener(CONSENT_OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener(CONSENT_OPEN_EVENT, onOpen);
    };
  }, []);

  if (consent !== null && !forcedOpen) return null;

  function choose(analytics: boolean) {
    writeConsent(analytics);
    setForcedOpen(false);
  }

  return (
    <div
      className="fixed inset-x-4 bottom-20 z-50 border border-line border-t-2 border-t-brass bg-paper px-6 py-6 shadow-[0_30px_50px_-30px_rgba(20,22,28,0.45)] md:right-auto md:bottom-6 md:left-6 md:max-w-md"
      role="dialog"
      aria-label={t('title')}
      data-testid="cookie-consent-banner"
    >
      <div className="flex flex-col gap-5">
        <div>
          <p className="font-serif text-xl">{t('title')}</p>
          <p className="mt-2 text-sm text-ink-soft">
            {t('body')}{' '}
            <LegalLink
              page="privacy"
              className="underline underline-offset-2 hover:text-brass-dark"
            >
              {t('privacyLink')}
            </LegalLink>
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="border border-line px-4 py-2 text-sm tracking-wide uppercase transition hover:border-brass"
            onClick={() => {
              choose(false);
            }}
            data-testid="cookie-necessary-only"
          >
            {t('necessaryOnly')}
          </button>
          <button
            type="button"
            className="bg-brass px-4 py-2 text-sm tracking-wide text-void uppercase transition hover:bg-brass-dark"
            onClick={() => {
              choose(true);
            }}
            data-testid="cookie-accept-all"
          >
            {t('acceptAll')}
          </button>
        </div>
      </div>
    </div>
  );
}
