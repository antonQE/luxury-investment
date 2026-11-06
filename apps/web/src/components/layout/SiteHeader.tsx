import { toTelHref } from '@luxury-investment/shared';

import { Link } from '@/i18n/navigation';
import { fetchSiteSettings } from '@/lib/api/site-settings';

import { DesktopNav } from './DesktopNav';
import { LanguageSwitcher } from './LanguageSwitcher';
import { MobileNav } from './MobileNav';

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={className}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.528-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
      />
    </svg>
  );
}

export async function SiteHeader() {
  const settings = await fetchSiteSettings().catch(() => ({
    publicPhone: null as string | null,
    publicEmail: null as string | null,
  }));
  const phoneLabel = settings.publicPhone;
  const phoneHref = toTelHref(phoneLabel);

  return (
    <header
      className="relative z-40 animate-fade-in border-b border-white/10 bg-void/95 text-stone backdrop-blur-md"
      data-testid="site-header"
    >
      <div className="mx-auto flex max-w-7xl flex-nowrap items-center gap-3 px-4 py-3 lg:gap-5 lg:px-6 lg:py-4">
        <Link
          href="/"
          className="shrink-0 whitespace-nowrap font-serif text-base tracking-[0.04em] text-stone lg:text-lg"
          data-testid="site-logo"
        >
          Luxury Investment
        </Link>

        <DesktopNav />

        <div className="ml-auto flex shrink-0 flex-nowrap items-center gap-3 lg:gap-4">
          {phoneHref !== null && phoneLabel !== null ? (
            <a
              href={phoneHref}
              className="inline-flex size-9 items-center justify-center text-brass transition hover:text-brass-dark"
              aria-label={phoneLabel}
              title={phoneLabel}
              data-testid="header-phone"
            >
              <PhoneIcon className="size-5" />
            </a>
          ) : null}
          <LanguageSwitcher />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
