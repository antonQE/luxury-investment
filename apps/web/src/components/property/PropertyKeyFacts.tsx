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
      className="grid grid-cols-2 gap-x-8 gap-y-8 border border-line bg-paper px-7 py-7 shadow-[0_30px_50px_-34px_rgba(20,22,28,0.4)] sm:grid-cols-4 md:px-12 md:py-10"
      data-testid="property-key-facts"
    >
      {items.map((item) => (
        <div
          key={item.testId}
          className="sm:border-l sm:border-line sm:pl-7 sm:first:border-l-0 sm:first:pl-0"
          data-testid={item.testId}
        >
          <dt className="text-[11px] tracking-[0.2em] uppercase text-brass">{item.label}</dt>
          <dd className="mt-3 font-serif text-[1.65rem] leading-none md:text-[1.9rem]">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
