import type { PublicSiteSettings } from '@luxury-investment/shared';
import { toMailtoHref, toTelHref } from '@luxury-investment/shared';
import { getTranslations } from 'next-intl/server';

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

function MailIcon({ className }: { className?: string }) {
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
        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
      />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M14 8.2h2.2V5h-2.2C11.7 5 10 6.8 10 9.2V11H8v3.2h2V19h3.2v-4.8h2.3l.5-3.2H13.2V9.2c0-.6.4-1 1-1Z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={className}
      aria-hidden
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M16.6 4c.5 1.8 1.8 3.2 3.6 3.7v2.5c-1.3-.1-2.5-.5-3.6-1.2v5.7c0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6c.3 0 .7 0 1 .1v2.7c-.3-.1-.7-.2-1-.2-1.8 0-3.3 1.5-3.3 3.4s1.5 3.4 3.3 3.4 3.2-1.4 3.3-3.2V4h2.7Z" />
    </svg>
  );
}

const EMPTY_SETTINGS: PublicSiteSettings = {
  publicPhone: null,
  publicEmail: null,
  facebookUrl: null,
  instagramUrl: null,
  tiktokUrl: null,
};

export async function HomeContactStrip({ settings }: { settings: PublicSiteSettings }) {
  const t = await getTranslations('Home');
  const phoneHref = toTelHref(settings.publicPhone);
  const emailHref = toMailtoHref(settings.publicEmail);

  const contacts: { key: string; href: string; label: string; icon: 'phone' | 'email' }[] = [];
  if (phoneHref !== null && settings.publicPhone) {
    contacts.push({
      key: 'phone',
      href: phoneHref,
      label: settings.publicPhone,
      icon: 'phone',
    });
  }
  if (emailHref !== null && settings.publicEmail) {
    contacts.push({
      key: 'email',
      href: emailHref,
      label: settings.publicEmail,
      icon: 'email',
    });
  }

  const socials: {
    key: string;
    href: string;
    label: string;
    icon: 'facebook' | 'instagram' | 'tiktok';
  }[] = [];
  if (settings.facebookUrl) {
    socials.push({
      key: 'facebook',
      href: settings.facebookUrl,
      label: t('socialFacebook'),
      icon: 'facebook',
    });
  }
  if (settings.instagramUrl) {
    socials.push({
      key: 'instagram',
      href: settings.instagramUrl,
      label: t('socialInstagram'),
      icon: 'instagram',
    });
  }
  if (settings.tiktokUrl) {
    socials.push({
      key: 'tiktok',
      href: settings.tiktokUrl,
      label: t('socialTiktok'),
      icon: 'tiktok',
    });
  }

  if (contacts.length === 0 && socials.length === 0) return null;

  return (
    <section
      className="border-y border-line bg-void text-stone"
      data-testid="home-contact-strip"
      aria-label={t('contactStripTitle')}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-14">
        <div>
          <p className="text-[11px] tracking-[0.22em] uppercase text-brass">
            {t('contactStripTitle')}
          </p>
          <p className="mt-2 max-w-xl font-serif text-2xl md:text-3xl">{t('contactStripLead')}</p>
        </div>

        {contacts.length > 0 ? (
          <ul className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-10 sm:gap-y-3">
            {contacts.map((item) => (
              <li key={item.key}>
                <a
                  href={item.href}
                  className="group inline-flex items-center gap-3 text-base text-stone/85 transition hover:text-brass"
                  data-testid={`home-contact-${item.key}`}
                >
                  <span className="inline-flex size-10 items-center justify-center border border-brass/40 text-brass transition group-hover:border-brass group-hover:text-brass-dark">
                    {item.icon === 'phone' ? <PhoneIcon className="size-5" /> : null}
                    {item.icon === 'email' ? <MailIcon className="size-5" /> : null}
                  </span>
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        ) : null}

        {socials.length > 0 ? (
          <div>
            <p className="text-[11px] tracking-[0.18em] uppercase text-stone/45">
              {t('socialFollow')}
            </p>
            <ul className="mt-4 flex flex-wrap gap-3">
              {socials.map((item) => (
                <li key={item.key}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2.5 border border-stone/25 px-4 py-2.5 text-sm tracking-wide text-stone/85 transition hover:border-brass hover:text-brass"
                    data-testid={`home-contact-${item.key}`}
                    aria-label={item.label}
                  >
                    <span className="text-brass transition group-hover:text-brass-dark">
                      {item.icon === 'facebook' ? <FacebookIcon className="size-5" /> : null}
                      {item.icon === 'instagram' ? <InstagramIcon className="size-5" /> : null}
                      {item.icon === 'tiktok' ? <TikTokIcon className="size-5" /> : null}
                    </span>
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function emptySiteSettings(): PublicSiteSettings {
  return EMPTY_SETTINGS;
}
