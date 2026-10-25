'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

export function ShareActions({ url, title }: { url: string; title: string }) {
  const t = useTranslations('Property');
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2" data-testid="property-share">
      <button
        type="button"
        className="border border-line px-3 py-2 text-xs tracking-wide uppercase transition hover:border-brass"
        data-testid="share-copy"
        onClick={() => {
          void copyLink();
        }}
      >
        {copied ? t('copied') : t('copyLink')}
      </button>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="border border-line px-3 py-2 text-xs tracking-wide uppercase transition hover:border-brass"
        data-testid="share-facebook"
      >
        {t('shareFacebook')}
      </a>
      <a
        href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="border border-line px-3 py-2 text-xs tracking-wide uppercase transition hover:border-brass"
        data-testid="share-whatsapp"
      >
        {t('shareWhatsapp')}
      </a>
      <a
        href={`viber://forward?text=${encodedTitle}%20${encodedUrl}`}
        className="border border-line px-3 py-2 text-xs tracking-wide uppercase transition hover:border-brass"
        data-testid="share-viber"
      >
        {t('shareViber')}
      </a>
    </div>
  );
}
