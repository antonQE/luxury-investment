'use client';

import Script from 'next/script';
import { useSyncExternalStore } from 'react';

import { CONSENT_CHANGE_EVENT, readConsent } from '@/lib/consent/storage';

function subscribeConsent(onStoreChange: () => void) {
  window.addEventListener(CONSENT_CHANGE_EVENT, onStoreChange);
  window.addEventListener('storage', onStoreChange);
  return () => {
    window.removeEventListener(CONSENT_CHANGE_EVENT, onStoreChange);
    window.removeEventListener('storage', onStoreChange);
  };
}

export function Analytics({ measurementId }: { measurementId: string }) {
  const consent = useSyncExternalStore(subscribeConsent, readConsent, () => null);

  if (measurementId.trim() === '' || consent?.analytics !== true) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){window.dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${measurementId}',{anonymize_ip:true});`}
      </Script>
    </>
  );
}
