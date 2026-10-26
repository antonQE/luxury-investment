import type { Locale } from '@luxury-investment/shared';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';

import { AcquisitionCalculator } from '@/components/property/AcquisitionCalculator';
import { DepositCalculator } from '@/components/property/DepositCalculator';
import { InquiryForm } from '@/components/property/InquiryForm';
import { MobileAgentBar } from '@/components/property/MobileAgentBar';
import { MortgageCalculator } from '@/components/property/MortgageCalculator';
import { PrintButton } from '@/components/property/PrintButton';
import { PropertyGallery } from '@/components/property/PropertyGallery';
import { PropertyGrid } from '@/components/property/PropertyGrid';
import { PropertyMapLink } from '@/components/property/PropertyMapLink';
import { PropertyQr } from '@/components/property/PropertyQr';
import { ShareActions } from '@/components/property/ShareActions';
import { JsonLd } from '@/components/seo/JsonLd';
import { Link } from '@/i18n/navigation';
import { fetchProperty, fetchSimilarProperties } from '@/lib/api/catalog';
import { ApiError } from '@/lib/api/client';
import { serverEnv } from '@/lib/config/env';
import { formatArea, formatPrice, formatPricePerSqm, locationLabel } from '@/lib/format';
import { stageMessageKey } from '@/lib/labels';
import { propertyJsonLd } from '@/lib/seo/json-ld';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { absoluteUrl } from '@/lib/seo/paths';

interface PropertyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale: Locale = await getLocale();
  try {
    const property = await fetchProperty(locale, slug);
    return buildPageMetadata({
      locale,
      path: `/obiavi/${slug}`,
      title: property.title,
      description: property.excerpt,
      imageUrl: property.imageUrls[0] ?? null,
    });
  } catch {
    return {};
  }
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { slug } = await params;
  const locale: Locale = await getLocale();
  const t = await getTranslations('Property');
  const search = await getTranslations('Search');

  const [propertyResult, similar] = await Promise.all([
    fetchProperty(locale, slug).then(
      (data) => ({ ok: true as const, data }),
      (error: unknown) => ({ ok: false as const, error }),
    ),
    fetchSimilarProperties(locale, slug).catch(
      (): Awaited<ReturnType<typeof fetchSimilarProperties>> => [],
    ),
  ]);

  if (!propertyResult.ok) {
    if (propertyResult.error instanceof ApiError && propertyResult.error.status === 404) {
      notFound();
    }
    throw propertyResult.error;
  }
  const property = propertyResult.data;

  const phoneDigits = property.agentPhone.replace(/\D/g, '');
  const stageKey =
    property.constructionStage === null ? undefined : stageMessageKey(property.constructionStage);
  const pageUrl = absoluteUrl(serverEnv().SITE_URL, locale, `/obiavi/${slug}`);
  const jsonLd = propertyJsonLd(property, pageUrl);
  const pricePerSqm = formatPricePerSqm(locale, property);

  return (
    <main
      className="mx-auto w-full max-w-6xl px-6 py-10 pb-28 md:pb-10"
      data-testid="property-page"
    >
      <JsonLd data={jsonLd} />
      <Link href="/obiavi" className="text-sm text-brass-dark transition hover:text-brass">
        {t('back')}
      </Link>
      <div className="mt-6 grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
        <div>
          <PropertyGallery images={property.imageUrls} title={property.title} />
          <p className="mt-6 text-xs tracking-[0.2em] uppercase text-brass">
            {search(property.transactionType)} · {search(property.propertyType)}
          </p>
          <h1 className="mt-2 font-serif text-4xl">{property.title}</h1>
          <p className="mt-2 text-ink-soft">{locationLabel(property)}</p>
          <p className="mt-2 text-sm text-ink-soft">
            {t('reference', { id: property.referenceNumber })}
          </p>
          <PropertyMapLink
            mapQuery={property.mapQuery}
            locationPrecision={property.locationPrecision}
          />
          <div className="mt-6 no-print">
            <p className="mb-2 text-xs tracking-[0.2em] uppercase text-brass">{t('share')}</p>
            <div className="flex flex-wrap items-center gap-2">
              <ShareActions url={pageUrl} title={property.title} />
              <PrintButton />
            </div>
          </div>
          <PropertyQr url={pageUrl} />
          <section className="mt-8">
            <h2 className="font-serif text-2xl">{t('description')}</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-ink-soft">
              {property.description}
            </p>
          </section>
        </div>
        <aside className="h-fit border border-line bg-paper p-6" data-testid="property-facts">
          <p className="font-serif text-4xl">
            {formatPrice(locale, property)}
            {property.transactionType === 'rent' ? (
              <span className="ml-1 font-sans text-base text-ink-soft">{t('perMonth')}</span>
            ) : null}
          </p>
          {pricePerSqm !== null ? (
            <p className="mt-1 text-sm text-ink-soft" data-testid="price-per-sqm">
              {t('pricePerSqm', { price: pricePerSqm })}
            </p>
          ) : null}
          {property.vatLabel !== null ? (
            <p className="mt-1 text-sm text-ink-soft">{t('vat', { label: property.vatLabel })}</p>
          ) : null}
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between gap-4 border-b border-line pb-2">
              <dt className="text-ink-soft">{property.primaryAreaLabel}</dt>
              <dd>{formatArea(locale, property.area)}</dd>
            </div>
            {property.bedrooms !== null ? (
              <div className="flex justify-between gap-4 border-b border-line pb-2">
                <dt className="text-ink-soft">{t('bedrooms', { count: property.bedrooms })}</dt>
              </div>
            ) : null}
            {property.bathrooms !== null ? (
              <div className="flex justify-between gap-4 border-b border-line pb-2">
                <dt className="text-ink-soft">{t('bathrooms', { count: property.bathrooms })}</dt>
              </div>
            ) : null}
            {stageKey !== undefined ? (
              <div className="flex justify-between gap-4 border-b border-line pb-2">
                <dt className="text-ink-soft">{t(stageKey)}</dt>
              </div>
            ) : null}
          </dl>
          <div className="mt-8 border-t border-line pt-6">
            <p className="text-xs tracking-[0.2em] uppercase text-brass">{t('agent')}</p>
            <p className="mt-2 font-serif text-xl">{property.agentName}</p>
            <p className="mt-1 text-sm text-ink-soft">{property.agentPhone}</p>
            <div className="mt-4 hidden flex-wrap gap-2 md:flex">
              <a
                href={`tel:${phoneDigits}`}
                className="bg-ink px-3 py-2 text-xs tracking-wide uppercase text-stone transition hover:bg-brass-dark"
                data-testid="agent-call"
              >
                {t('call')}
              </a>
              <a
                href={`viber://chat?number=%2B${phoneDigits}`}
                className="border border-ink px-3 py-2 text-xs tracking-wide uppercase transition hover:border-brass"
                data-testid="agent-viber"
              >
                {t('viber')}
              </a>
              <a
                href={`https://wa.me/${phoneDigits}`}
                className="border border-ink px-3 py-2 text-xs tracking-wide uppercase transition hover:border-brass"
                data-testid="agent-whatsapp"
              >
                {t('whatsapp')}
              </a>
            </div>
          </div>
          <div className="mt-8 no-print">
            <InquiryForm propertySlug={property.slug} />
          </div>
          {property.transactionType === 'sale' ? (
            <>
              <AcquisitionCalculator
                slug={property.slug}
                price={property.price}
                currency={property.currency}
              />
              <DepositCalculator
                slug={property.slug}
                price={property.price}
                currency={property.currency}
              />
              <MortgageCalculator
                slug={property.slug}
                price={property.price}
                currency={property.currency}
              />
            </>
          ) : null}
        </aside>
      </div>
      <section className="mt-16 no-print" data-testid="similar-properties">
        <h2 className="font-serif text-3xl">{t('similarTitle')}</h2>
        {similar.length === 0 ? (
          <p className="mt-4 text-ink-soft" data-testid="similar-empty">
            {t('similarEmpty')}
          </p>
        ) : (
          <div className="mt-6">
            <PropertyGrid items={similar} />
          </div>
        )}
      </section>
      <MobileAgentBar phoneDigits={phoneDigits} agentName={property.agentName} />
    </main>
  );
}
