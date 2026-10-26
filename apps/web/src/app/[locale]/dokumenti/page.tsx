import { getLocale, getTranslations } from 'next-intl/server';

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
    <main className="mx-auto max-w-3xl px-6 py-16" data-testid="documents-page">
      <h1 className="font-serif text-4xl text-ink">{t('title')}</h1>
      <p className="mt-3 text-ink-soft">{t('lead')}</p>

      {loadError ? (
        <p className="mt-8 text-ink-soft" data-testid="documents-error">
          {t('error')}
        </p>
      ) : grouped.length === 0 ? (
        <p className="mt-8 text-ink-soft" data-testid="documents-empty">
          {t('empty')}
        </p>
      ) : (
        <div className="mt-10 space-y-12">
          {grouped.map((group) => (
            <section key={group.kind} data-testid={`documents-group-${group.kind}`}>
              <h2 className="font-serif text-2xl text-ink">{t(`categories.${group.kind}`)}</h2>
              <ul className="mt-4 space-y-6">
                {group.items.map((item) => (
                  <li
                    key={item.id}
                    className="border-b border-line pb-6"
                    data-testid={`document-item-${item.slug}`}
                  >
                    <h3 className="text-lg text-ink">{item.title}</h3>
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
                      className="mt-3 inline-block text-sm underline underline-offset-2"
                      href={documentDownloadUrl(item.slug)}
                      data-testid={`document-download-${item.slug}`}
                    >
                      {t('download')}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
