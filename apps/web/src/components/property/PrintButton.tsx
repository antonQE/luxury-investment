'use client';

import { useTranslations } from 'next-intl';

export function PrintButton() {
  const t = useTranslations('Property');

  return (
    <button
      type="button"
      onClick={() => {
        window.print();
      }}
      className="border border-ink px-3 py-2 text-xs tracking-wide uppercase transition hover:border-brass"
      data-testid="property-print"
    >
      {t('print')}
    </button>
  );
}
