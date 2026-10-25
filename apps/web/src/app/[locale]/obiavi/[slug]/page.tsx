import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';

import { PropertyGallery } from '@/components/property/PropertyGallery';
import { Link } from '@/i18n/navigation';
import { fetchProperty } from '@/lib/api/catalog';
import { ApiError } from '@/lib/api/client';
import { formatArea, formatPrice, locationLabel } from '@/lib/format';
import { stageMessageKey } from '@/lib/labels';

interface PropertyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  try {
    const property = await fetchProperty(locale, slug);
    return { title: property.title, description: property.excerpt };
  } catch {
    return {};
  }
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { slug } = await params;
  const locale = await getLocale();
  const t = await getTranslations('Property');
  const search = await getTranslations('Search');

  let property;
  try {
    property = await fetchProperty(locale, slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const phoneDigits = property.agentPhone.replace(/\D/g, '');
  const stageKey =
    property.constructionStage === null ? undefined : stageMessageKey(property.constructionStage);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10" data-testid="property-page">
      <Link href="/obiavi" className="text-sm text-gold-dark hover:text-gold">
        {t('back')}
      </Link>
      <div className="mt-6 grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
        <div>
          <PropertyGallery images={property.imageUrls} title={property.title} />
          <p className="mt-6 text-xs tracking-[0.2em] uppercase text-gold">
            {search(property.transactionType)} · {search(property.propertyType)}
          </p>
          <h1 className="mt-2 font-serif text-4xl">{property.title}</h1>
          <p className="mt-2 text-ink-soft">{locationLabel(property)}</p>
          <p className="mt-2 text-sm text-ink-soft">
            {t('reference', { id: property.referenceNumber })}
          </p>
          <section className="mt-8">
            <h2 className="font-serif text-2xl">{t('description')}</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-ink-soft">
              {property.description}
            </p>
          </section>
        </div>
        <aside className="h-fit bg-paper p-6 shadow-sm" data-testid="property-facts">
          <p className="font-serif text-4xl">
            {formatPrice(locale, property)}
            {property.transactionType === 'rent' ? (
              <span className="ml-1 text-base font-sans text-ink-soft">{t('perMonth')}</span>
            ) : null}
          </p>
          {property.vatLabel !== null ? (
            <p className="mt-1 text-sm text-ink-soft">{t('vat', { label: property.vatLabel })}</p>
          ) : null}
          <dl className="mt-6 space-y-2 text-sm">
            <div>
              <dt className="text-ink-soft">{property.primaryAreaLabel}</dt>
              <dd>{formatArea(locale, property.area)}</dd>
            </div>
            {property.bedrooms !== null ? (
              <div>
                <dt className="text-ink-soft">{t('bedrooms', { count: property.bedrooms })}</dt>
              </div>
            ) : null}
            {property.bathrooms !== null ? (
              <div>
                <dt className="text-ink-soft">{t('bathrooms', { count: property.bathrooms })}</dt>
              </div>
            ) : null}
            {stageKey !== undefined ? (
              <div>
                <dt className="text-ink-soft">{t(stageKey)}</dt>
              </div>
            ) : null}
          </dl>
          <div className="mt-8 border-t border-cream-dark pt-6">
            <p className="text-xs tracking-[0.2em] uppercase text-gold">{t('agent')}</p>
            <p className="mt-2 font-serif text-xl">{property.agentName}</p>
            <p className="mt-1 text-sm text-ink-soft">{property.agentPhone}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={`tel:${phoneDigits}`}
                className="bg-ink px-3 py-2 text-xs tracking-wide uppercase text-cream"
                data-testid="agent-call"
              >
                {t('call')}
              </a>
              <a
                href={`viber://chat?number=%2B${phoneDigits}`}
                className="border border-ink px-3 py-2 text-xs tracking-wide uppercase"
                data-testid="agent-viber"
              >
                {t('viber')}
              </a>
              <a
                href={`https://wa.me/${phoneDigits}`}
                className="border border-ink px-3 py-2 text-xs tracking-wide uppercase"
                data-testid="agent-whatsapp"
              >
                {t('whatsapp')}
              </a>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
