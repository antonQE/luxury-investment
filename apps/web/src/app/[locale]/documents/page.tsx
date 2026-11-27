import { getLocale, getTranslations } from 'next-intl/server';

import { EmptyState } from '@/components/ui/EmptyState';
import { PageHero } from '@/components/ui/PageHero';
import { Reveal } from '@/components/ui/Reveal';
import { ApiError } from '@/lib/api/client';
import { documentDownloadUrl, fetchPublicDocuments } from '@/lib/api/documents';

const CATEGORY_ORDER = [
  'seller_handbook',
  'power_of_attorney',
  'declaration',
  'contract_template',
  'guide_other',
] as const;

export default async function DocumentsPage() {
  const locale = await getLocale();
  const t = await getTranslations('Documents');
  const meta = await getTranslations('Meta');

  let items: Awaited<ReturnType<typeof fetchPublicDocuments>> = [];
  let loadError = false;
  try {
    items = await fetchPublicDocuments(locale);
  } catch (error) {
    if (error instanceof ApiError) loadError = true;
    else throw error;
  }

  const grouped = CATEGORY_ORDER.map((kind) => ({
    kind,
    items: items.filter((item) => item.kind === kind),
  })).filter((group) => group.items.length > 0);

  return (
    <main data-testid="documents-page">
      <PageHero eyebrow={meta('siteName')} title={t('title')} lead={t('lead')} />
      <div className="mx-auto max-w-4xl px-6 py-20 md:py-28">
        {loadError ? (
          <p className="text-ink-soft" data-testid="documents-error">
            {t('error')}
          </p>
        ) : grouped.length === 0 ? (
          <EmptyState title={t('empty')} testId="documents-empty" />
        ) : (
          <div className="space-y-20">
            {grouped.map((group) => (
              <section key={group.kind} data-testid={`documents-group-${group.kind}`}>
                <Reveal>
                  <h2 className="flex items-center gap-3 font-serif text-2xl text-ink md:text-3xl">
                    <span className="h-px w-8 bg-brass" aria-hidden />
                    {t(`categories.${group.kind}`)}
                  </h2>
                </Reveal>
                <ul className="mt-8 border-t border-line">
                  {group.items.map((item, index) => (
                    <Reveal
                      as="li"
                      key={item.id}
                      delay={(index % 4) * 70}
                      data-testid={`document-item-${item.slug}`}
                    >
                      <div className="ruled-row border-b border-line py-8">
                        <h3 className="font-serif text-xl text-ink">{item.title}</h3>
                        {item.description !== '' ? (
                          <p className="mt-2 text-sm text-ink-soft">{item.description}</p>
                        ) : null}
                        {item.legalSample ? (
                          <p
                            className="mt-2 text-xs text-ink-soft"
                            data-testid={`document-legal-${item.slug}`}
                          >
                            {t('legalDisclaimer')}
                          </p>
                        ) : null}
                        <a
                          className="mt-4 inline-block text-xs tracking-[0.18em] uppercase text-brass-dark transition hover:text-brass"
                          href={documentDownloadUrl(item.slug)}
                          data-testid={`document-download-${item.slug}`}
                        >
                          {t('download')} ↓
                        </a>
                      </div>
                    </Reveal>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
