import type { PublicProperty } from '@luxury-investment/shared';
import { getTranslations } from 'next-intl/server';

import { formatArea } from '@/lib/format';
import { stageMessageKey } from '@/lib/labels';

export async function PropertyKeyFacts({
  property,
  locale,
}: {
  property: PublicProperty;
  locale: string;
}) {
  const t = await getTranslations('Property');
  const stageKey =
    property.constructionStage === null ? undefined : stageMessageKey(property.constructionStage);

  const items: { label: string; value: string; testId: string }[] = [];

  if (property.bedrooms !== null) {
    items.push({
      label: t('factBedrooms'),
      value: String(property.bedrooms),
      testId: 'fact-bedrooms',
    });
  }
  if (property.bathrooms !== null) {
    items.push({
      label: t('factBathrooms'),
      value: String(property.bathrooms),
      testId: 'fact-bathrooms',
    });
  }
  items.push({
    label: property.primaryAreaLabel,
    value: formatArea(locale, property.area),
    testId: 'fact-area',
  });
  if (stageKey !== undefined) {
    items.push({
      label: t('factStage'),
      value: t(stageKey),
      testId: 'fact-stage',
    });
  }

  if (items.length === 0) return null;

  return (
    <dl
      className="mt-6 grid grid-cols-2 gap-4 border-y border-line py-5 sm:grid-cols-4"
      data-testid="property-key-facts"
    >
      {items.map((item) => (
        <div key={item.testId} data-testid={item.testId}>
          <dt className="text-[11px] tracking-[0.18em] uppercase text-brass">{item.label}</dt>
          <dd className="mt-1 font-serif text-2xl">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
