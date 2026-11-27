import type { Locale } from '@luxury-investment/shared';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';

import { PropertyViewBeacon } from '@/components/analytics/PropertyViewBeacon';
import { PlainTextBody } from '@/components/content/PlainTextBody';
import { AcquisitionCalculator } from '@/components/property/AcquisitionCalculator';
import { DepositCalculator } from '@/components/property/DepositCalculator';
import { InquiryForm } from '@/components/property/InquiryForm';
import { MobileAgentBar } from '@/components/property/MobileAgentBar';
import { MortgageCalculator } from '@/components/property/MortgageCalculator';
import { PrintButton } from '@/components/property/PrintButton';
import { PropertyGallery } from '@/components/property/PropertyGallery';
import { PropertyGrid } from '@/components/property/PropertyGrid';
import { PropertyKeyFacts } from '@/components/property/PropertyKeyFacts';
import { PropertyMapLink } from '@/components/property/PropertyMapLink';
import { PropertyQr } from '@/components/property/PropertyQr';
import { ShareActions } from '@/components/property/ShareActions';
import { JsonLd } from '@/components/seo/JsonLd';
import { RemoteImage } from '@/components/ui/RemoteImage';
import { Link } from '@/i18n/navigation';
import { fetchProperty, fetchSimilarProperties } from '@/lib/api/catalog';
import { ApiError } from '@/lib/api/client';
import { serverEnv } from '@/lib/config/env';
import { formatPrice, formatPricePerSqm, locationLabel } from '@/lib/format';
import { propertyJsonLd } from '@/lib/seo/json-ld';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { absoluteUrl } from '@/lib/seo/paths';

interface PropertyPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const { id } = await params;
  const locale: Locale = await getLocale();
  try {
    const property = await fetchProperty(locale, id);
    return buildPageMetadata({
      locale,
      path: `/properties/${id}`,
      title: property.title,
      description: property.excerpt,
      imageUrl: property.imageUrls[0] ?? null,
    });
  } catch {
    return {};
  }
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { id } = await params;
  const locale: Locale = await getLocale();
  const t = await getTranslations('Property');
  const search = await getTranslations('Search');

  const [propertyResult, similar] = await Promise.all([
    fetchProperty(locale, id).then(
      (data) => ({ ok: true as const, data }),
      (error: unknown) => ({ ok: false as const, error }),
    ),
    fetchSimilarProperties(locale, id).catch(
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
  const pageUrl = absoluteUrl(serverEnv().SITE_URL, locale, `/properties/${id}`);
  const jsonLd = propertyJsonLd(property, pageUrl);
  const pricePerSqm = formatPricePerSqm(locale, property);

  return (
    <main
      className="mx-auto w-full max-w-6xl px-6 py-10 pb-28 md:pb-10"
      data-testid="property-page"
    >
      <JsonLd data={jsonLd} />
      <PropertyViewBeacon propertyId={property.id} />
      <Link href="/properties" className="text-sm text-brass-dark transition hover:text-brass">
        {t('back')}
      </Link>

      <div className="mt-6">
        <PropertyGallery images={property.imageUrls} title={property.title} />
        <PropertyKeyFacts property={property} locale={locale} />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-brass">
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
            <PlainTextBody
              text={property.description}
              className="mt-3 space-y-4 leading-relaxed text-ink-soft"
              testId="property-description"
            />
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
          <div className="mt-8 border-t border-line pt-6">
            <p className="text-xs tracking-[0.2em] uppercase text-brass">{t('agent')}</p>
            <div className="mt-3 flex items-center gap-4">
              {property.agentPhotoUrl !== null ? (
                property.agentId !== null ? (
                  <Link
                    href={`/team/${property.agentId}`}
                    className="relative h-16 w-16 shrink-0 overflow-hidden bg-void/5"
                    data-testid="agent-photo"
                  >
                    <RemoteImage
                      src={property.agentPhotoUrl}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </Link>
                ) : (
                  <div
                    className="relative h-16 w-16 shrink-0 overflow-hidden bg-void/5"
                    data-testid="agent-photo"
                  >
                    <RemoteImage
                      src={property.agentPhotoUrl}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                )
              ) : null}
              <div>
                {property.agentId !== null ? (
                  <Link
                    href={`/team/${property.agentId}`}
                    className="font-serif text-xl transition hover:text-brass-dark"
                    data-testid="agent-profile-link"
                  >
                    {property.agentName}
                  </Link>
                ) : (
                  <p className="font-serif text-xl" data-testid="agent-name">
                    {property.agentName}
                  </p>
                )}
                <p className="mt-1 text-sm text-ink-soft">{property.agentPhone}</p>
              </div>
            </div>
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
      <MobileAgentBar
        phoneDigits={phoneDigits}
        agentName={property.agentName}
        agentId={property.agentId}
      />
    </main>
  );
}
