'use client';

import { useTranslations } from 'next-intl';

export function MobileAgentBar({
  phoneDigits,
  agentName,
}: {
  phoneDigits: string;
  agentName: string;
}) {
  const t = useTranslations('Property');

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 border-t border-brass/20 bg-void/95 px-4 py-3 text-stone backdrop-blur md:hidden"
      data-testid="mobile-agent-bar"
    >
      <p className="truncate text-xs text-stone/70">{agentName}</p>
      <div className="mt-2 flex gap-2">
        <a
          href={`tel:${phoneDigits}`}
          className="flex-1 bg-brass px-3 py-2 text-center text-xs tracking-wide uppercase text-void"
          data-testid="mobile-agent-call"
        >
          {t('call')}
        </a>
        <a
          href={`viber://chat?number=%2B${phoneDigits}`}
          className="flex-1 border border-stone/40 px-3 py-2 text-center text-xs tracking-wide uppercase"
          data-testid="mobile-agent-viber"
        >
          {t('viber')}
        </a>
        <a
          href={`https://wa.me/${phoneDigits}`}
          className="flex-1 border border-stone/40 px-3 py-2 text-center text-xs tracking-wide uppercase"
          data-testid="mobile-agent-whatsapp"
        >
          {t('whatsapp')}
        </a>
      </div>
    </div>
  );
}
