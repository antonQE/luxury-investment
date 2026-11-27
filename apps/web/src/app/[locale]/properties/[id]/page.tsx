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
import { EmptyState } from '@/components/ui/EmptyState';
import { RemoteImage } from '@/components/ui/RemoteImage';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeader } from '@/components/ui/SectionHeader';
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
    <main className="w-full pb-28 md:pb-0" data-testid="property-page">
      <JsonLd data={jsonLd} />
      <PropertyViewBeacon propertyId={property.id} />
      <section className="property-stage" data-testid="property-stage">
        <div className="mx-auto max-w-6xl px-6 pt-8 pb-16 md:pb-20">
          <Link
            href="/properties"
            className="inline-block text-xs tracking-[0.2em] uppercase text-brass transition hover:text-stone"
          >
            {t('back')}
          </Link>
          <div className="animate-fade-up mt-6">
            <PropertyGallery images={property.imageUrls} title={property.title} />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 pb-10">
        <div className="relative z-10 -mt-10 md:-mt-14">
          <PropertyKeyFacts property={property} locale={locale} />
        </div>

        <div className="mt-16 grid gap-14 border-t border-line pt-14 lg:mt-20 lg:grid-cols-[1.35fr_0.85fr] lg:gap-20 lg:pt-16">
          <Reveal>
            <p className="text-[11px] tracking-[0.22em] uppercase text-brass">
              {search(property.transactionType)} · {search(property.propertyType)}
            </p>
            <h1 className="mt-5 font-serif text-[2.35rem] leading-[1.08] tracking-[-0.02em] md:text-[3.35rem] lg:text-[3.75rem]">
              {property.title}
            </h1>
            <div className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-line pb-6">
              <p className="text-base text-ink-soft md:text-lg">{locationLabel(property)}</p>
              <p className="text-sm text-ink-soft/80">
                {t('reference', { id: property.referenceNumber })}
              </p>
            </div>
            <PropertyMapLink
              mapQuery={property.mapQuery}
              locationPrecision={property.locationPrecision}
            />
            <div className="mt-8 no-print">
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
          </Reveal>
          <Reveal delay={120}>
            <aside
              className="h-fit border border-line border-t-2 border-t-brass bg-paper p-7 shadow-[0_30px_50px_-34px_rgba(20,22,28,0.35)] md:p-9"
              data-testid="property-facts"
            >
              <p className="text-[11px] tracking-[0.22em] uppercase text-brass">{t('price')}</p>
              <p className="mt-3 font-serif text-[2.5rem] leading-none tracking-[-0.02em] md:text-[2.85rem]">
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
                <p className="mt-1 text-sm text-ink-soft">
                  {t('vat', { label: property.vatLabel })}
                </p>
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
          </Reveal>
        </div>
        <section
          className="mt-24 border-t border-line pt-16 no-print"
          data-testid="similar-properties"
        >
          <SectionHeader eyebrow={t('similarTitle')} />
          {similar.length === 0 ? (
            <EmptyState title={t('similarEmpty')} testId="similar-empty" />
          ) : (
            <PropertyGrid items={similar} />
          )}
        </section>
      </div>
      <MobileAgentBar
        phoneDigits={phoneDigits}
        agentName={property.agentName}
        agentId={property.agentId}
      />
    </main>
  );
}
