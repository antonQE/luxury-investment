import type { PublicOffice } from '@luxury-investment/shared';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';

import { EmptyState } from '@/components/ui/EmptyState';
import { PageHero } from '@/components/ui/PageHero';
import { Reveal } from '@/components/ui/Reveal';
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
  const meta = await getTranslations('Meta');
  const locale = await getLocale();

  const offices: PublicOffice[] = await fetchOffices(locale).catch(() => []);

  return (
    <main data-testid="contact-page">
      <PageHero eyebrow={meta('siteName')} title={t('title')} lead={t('lead')} />
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        {offices.length === 0 ? (
          <EmptyState title={t('empty')} />
        ) : (
          <ul className="grid gap-x-14 gap-y-16 md:grid-cols-2">
            {offices.map((office, index) => (
              <Reveal
                as="li"
                key={office.id}
                delay={index * 110}
                data-testid={`office-${office.slug}`}
              >
                <div className="border-t border-brass pt-8">
                  <h2 className="font-serif text-3xl">{office.name}</h2>
                  <p className="mt-4 text-lg">{office.address}</p>
                  {office.hours !== null ? (
                    <p className="mt-2 text-sm text-ink-soft">
                      {t('hours')}: {office.hours}
                    </p>
                  ) : null}
                  <dl className="mt-6 space-y-2 text-sm">
                    {office.phone !== null ? (
                      <div>
                        <dt className="inline text-ink-soft">{t('phone')}: </dt>
                        <dd className="inline">
                          <a
                            href={`tel:${office.phone.replace(/\s/g, '')}`}
                            className="transition hover:text-brass-dark"
                          >
                            {office.phone}
                          </a>
                        </dd>
                      </div>
                    ) : null}
                    {office.email !== null ? (
                      <div>
                        <dt className="inline text-ink-soft">{t('email')}: </dt>
                        <dd className="inline">
                          <a
                            href={`mailto:${office.email}`}
                            className="transition hover:text-brass-dark"
                          >
                            {office.email}
                          </a>
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                  <a
                    href={mapsSearchUrl(office.mapQuery)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-block text-xs tracking-[0.18em] uppercase text-brass-dark transition hover:text-brass"
                    data-testid={`office-map-${office.slug}`}
                  >
                    {t('map')} →
                  </a>
                </div>
              </Reveal>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
