import type { Locale, PublicLandingSection } from '@luxury-investment/shared';
import { landingListingFilterSchema } from '@luxury-investment/shared';

import { LandingCtaForm } from '@/components/content/LandingCtaForm';
import { PropertyGrid } from '@/components/property/PropertyGrid';
import { fetchProperties } from '@/lib/api/catalog';

function localized(locale: Locale, value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && 'bg' in value && 'en' in value) {
    const pair = value as { bg: string; en: string };
    return locale === 'en' ? pair.en || pair.bg : pair.bg || pair.en;
  }
  return '';
}

export async function LandingSections(props: {
  locale: Locale;
  landingSlug: string;
  campaignKey: string;
  sections: PublicLandingSection[];
}) {
  const rendered = await Promise.all(
    props.sections.map(async (section) => {
      const payload = section.payload;
      if (section.type === 'hero') {
        return (
          <section key={section.id} className="space-y-4" data-testid="landing-section-hero">
            <h1 className="font-serif text-4xl md:text-5xl">
              {localized(props.locale, payload.headline)}
            </h1>
            {payload.subheadline !== undefined ? (
              <p className="max-w-2xl text-lg text-ink-soft">
                {localized(props.locale, payload.subheadline)}
              </p>
            ) : null}
            {typeof payload.ctaHref === 'string' && payload.ctaHref.length > 0 ? (
              <a
                href={payload.ctaHref}
                className="inline-flex border border-brass bg-brass px-5 py-2 text-sm tracking-wide text-void uppercase transition hover:bg-brass-dark"
              >
                {localized(props.locale, payload.ctaLabel) || 'CTA'}
              </a>
            ) : null}
          </section>
        );
      }

      if (section.type === 'benefits' || section.type === 'services') {
        const items = Array.isArray(payload.items) ? payload.items : [];
        return (
          <section key={section.id} className="space-y-6">
            {payload.title !== undefined ? (
              <h2 className="font-serif text-3xl">{localized(props.locale, payload.title)}</h2>
            ) : null}
            <ul className="grid gap-4 sm:grid-cols-2">
              {items.map((item) => {
                const row = item as { title?: unknown; body?: unknown };
                const title = localized(props.locale, row.title);
                const body = localized(props.locale, row.body);
                return (
                  <li
                    key={`${section.id}:${title}:${body}`}
                    className="border border-line bg-paper p-5"
                  >
                    <h3 className="font-serif text-xl">{title}</h3>
                    {row.body !== undefined ? (
                      <p className="mt-2 text-sm text-ink-soft">{body}</p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      }

      if (section.type === 'process') {
        const steps = Array.isArray(payload.steps) ? payload.steps : [];
        return (
          <section key={section.id} className="space-y-6">
            {payload.title !== undefined ? (
              <h2 className="font-serif text-3xl">{localized(props.locale, payload.title)}</h2>
            ) : null}
            <ol className="grid gap-4 sm:grid-cols-2">
              {steps.map((step, index) => {
                const row = step as { title?: unknown; body?: unknown };
                const title = localized(props.locale, row.title);
                const body = localized(props.locale, row.body);
                return (
                  <li
                    key={`${section.id}:${title}:${body}`}
                    className="border border-line bg-paper p-5"
                  >
                    <p className="text-xs tracking-[0.2em] uppercase text-brass">
                      {String(index + 1).padStart(2, '0')}
                    </p>
                    <h3 className="mt-2 font-serif text-xl">{title}</h3>
                    {row.body !== undefined ? (
                      <p className="mt-2 text-sm text-ink-soft">{body}</p>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </section>
        );
      }

      if (section.type === 'faq') {
        const items = Array.isArray(payload.items) ? payload.items : [];
        return (
          <section key={section.id} className="space-y-4">
            {payload.title !== undefined ? (
              <h2 className="font-serif text-3xl">{localized(props.locale, payload.title)}</h2>
            ) : null}
            <dl className="space-y-4">
              {items.map((item) => {
                const row = item as { question?: unknown; answer?: unknown };
                const question = localized(props.locale, row.question);
                const answer = localized(props.locale, row.answer);
                return (
                  <div
                    key={`${section.id}:${question}:${answer}`}
                    className="border border-line bg-paper p-4"
                  >
                    <dt className="font-medium">{question}</dt>
                    <dd className="mt-2 text-sm text-ink-soft whitespace-pre-line">{answer}</dd>
                  </div>
                );
              })}
            </dl>
          </section>
        );
      }

      if (section.type === 'testimonials') {
        const items = Array.isArray(payload.items) ? payload.items : [];
        return (
          <section key={section.id} className="space-y-4">
            {payload.title !== undefined ? (
              <h2 className="font-serif text-3xl">{localized(props.locale, payload.title)}</h2>
            ) : null}
            <ul className="grid gap-4">
              {items.map((item) => {
                const row = item as {
                  quote?: unknown;
                  authorName?: string;
                  source?: string;
                };
                const quote = localized(props.locale, row.quote);
                const author = row.authorName ?? '';
                return (
                  <li
                    key={`${section.id}:${quote}:${author}`}
                    className="border border-line bg-paper p-5"
                  >
                    <p className="font-serif text-lg">“{quote}”</p>
                    <p className="mt-3 text-sm text-ink-soft">
                      {author}
                      {row.source !== undefined && row.source !== '' ? ` — ${row.source}` : ''}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      }

      if (section.type === 'related_listings') {
        const parsedFilter = landingListingFilterSchema.safeParse(payload.filter);
        let items: Awaited<ReturnType<typeof fetchProperties>>['data'] = [];
        if (parsedFilter.success) {
          const filter = parsedFilter.data;
          try {
            const page = await fetchProperties(props.locale, {
              transactionType: filter.transactionType,
              propertyType: filter.propertyType,
              market: filter.market,
              city: filter.city,
              district: filter.district,
              bedroomsMin:
                filter.bedroomsMin !== undefined ? String(filter.bedroomsMin) : undefined,
              priceMin: filter.priceMin !== undefined ? String(filter.priceMin) : undefined,
              priceMax: filter.priceMax !== undefined ? String(filter.priceMax) : undefined,
              areaMin: filter.areaMin !== undefined ? String(filter.areaMin) : undefined,
              areaMax: filter.areaMax !== undefined ? String(filter.areaMax) : undefined,
              limit: String(filter.limit),
            });
            items = page.data;
          } catch {
            items = [];
          }
        }
        return (
          <section
            key={section.id}
            className="space-y-6"
            data-testid="landing-section-related-listings"
          >
            {payload.title !== undefined ? (
              <h2 className="font-serif text-3xl">{localized(props.locale, payload.title)}</h2>
            ) : null}
            {items.length === 0 ? (
              <p className="text-sm text-ink-soft">—</p>
            ) : (
              <PropertyGrid items={items} />
            )}
          </section>
        );
      }

      if (section.type === 'cta_form') {
        const inquirySource =
          typeof payload.inquirySource === 'string' ? payload.inquirySource : 'landing';
        return (
          <section
            key={section.id}
            id="cta"
            className="max-w-xl space-y-4"
            data-testid="landing-section-cta"
          >
            {payload.title !== undefined ? (
              <h2 className="font-serif text-3xl">{localized(props.locale, payload.title)}</h2>
            ) : null}
            {payload.body !== undefined ? (
              <p className="text-ink-soft">{localized(props.locale, payload.body)}</p>
            ) : null}
            <LandingCtaForm
              landingSlug={props.landingSlug}
              campaignKey={props.campaignKey}
              inquirySource={inquirySource}
              submitLabel={localized(props.locale, payload.submitLabel)}
            />
          </section>
        );
      }

      return (
        <section
          key={section.id}
          className="border border-dashed border-line p-4 text-sm text-ink-soft"
        >
          {section.type}
        </section>
      );
    }),
  );

  return (
    <div className="space-y-16" data-testid="landing-sections">
      {rendered}
    </div>
  );
}
