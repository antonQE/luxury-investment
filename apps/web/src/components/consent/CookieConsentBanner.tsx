'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState, useSyncExternalStore } from 'react';

import { Link } from '@/i18n/navigation';
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
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-paper/92 px-6 py-6 backdrop-blur-md"
      role="dialog"
      aria-label={t('title')}
      data-testid="cookie-consent-banner"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="font-serif text-xl">{t('title')}</p>
          <p className="mt-2 text-sm text-ink-soft">
            {t('body')}{' '}
            <Link
              href="/stranici/privacy"
              className="underline underline-offset-2 hover:text-brass-dark"
            >
              {t('privacyLink')}
            </Link>
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
