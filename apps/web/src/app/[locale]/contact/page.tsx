import type { PublicOffice } from '@luxury-investment/shared';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';

import { fetchOffices } from '@/lib/api/team';
import { mapsSearchUrl } from '@/lib/maps';
import { buildPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Contact');
  const locale = await getLocale();
  return buildPageMetadata({
    locale,
    path: '/contact',
    title: t('title'),
    description: t('lead'),
  });
}

export default async function ContactPage() {
  const t = await getTranslations('Contact');
  const locale = await getLocale();

  const offices: PublicOffice[] = await fetchOffices(locale).catch(() => []);

  return (
    <main className="mx-auto max-w-4xl px-6 py-16" data-testid="contact-page">
      <h1 className="font-serif text-4xl">{t('title')}</h1>
      <p className="mt-4 text-lg text-ink-soft">{t('lead')}</p>

      {offices.length === 0 ? (
        <p className="mt-10 text-ink-soft">{t('empty')}</p>
      ) : (
        <ul className="mt-12 space-y-10">
          {offices.map((office) => (
            <li
              key={office.id}
              className="border border-line bg-paper p-6"
              data-testid={`office-${office.slug}`}
            >
              <h2 className="font-serif text-2xl">{office.name}</h2>
              <p className="mt-3">{office.address}</p>
              {office.hours !== null ? (
                <p className="mt-2 text-sm text-ink-soft">
                  {t('hours')}: {office.hours}
                </p>
              ) : null}
              <dl className="mt-4 space-y-2 text-sm">
                {office.phone !== null ? (
                  <div>
                    <dt className="inline text-ink-soft">{t('phone')}: </dt>
                    <dd className="inline">
                      <a href={`tel:${office.phone.replace(/\s/g, '')}`}>{office.phone}</a>
                    </dd>
                  </div>
                ) : null}
                {office.email !== null ? (
                  <div>
                    <dt className="inline text-ink-soft">{t('email')}: </dt>
                    <dd className="inline">
                      <a href={`mailto:${office.email}`}>{office.email}</a>
                    </dd>
                  </div>
                ) : null}
              </dl>
              <a
                href={mapsSearchUrl(office.mapQuery)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-sm tracking-wide uppercase text-brass-dark transition hover:text-brass"
                data-testid={`office-map-${office.slug}`}
              >
                {t('map')}
              </a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
