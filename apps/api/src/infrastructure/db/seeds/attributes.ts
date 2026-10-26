import { and, eq } from 'drizzle-orm';

import type { Database } from '../client.ts';
import { attributeDefinitions, attributeOptions, translations } from '../schema.ts';
import type { SeedModule } from './index.ts';

interface OptionSeed {
  key: string;
  sortOrder: number;
  nameBg: string;
  nameEn: string;
}

interface DefinitionSeed {
  key: string;
  dataType: string;
  unit?: string;
  validation?: Record<string, unknown>;
  appliesToPropertyTypes?: string[];
  appliesToMarkets?: string[];
  required?: boolean;
  isPublic?: boolean;
  filterable?: boolean;
  sortOrder: number;
  nameBg: string;
  nameEn: string;
  helpBg?: string;
  helpEn?: string;
  options?: OptionSeed[];
}

const DEFINITIONS: DefinitionSeed[] = [
  {
    key: 'heating',
    dataType: 'select',
    sortOrder: 1,
    filterable: true,
    nameBg: 'Отопление',
    nameEn: 'Heating',
    helpBg: 'Основен начин на отопление.',
    helpEn: 'Primary heating type.',
    options: [
      { key: 'central', sortOrder: 1, nameBg: 'Централно', nameEn: 'Central' },
      { key: 'gas', sortOrder: 2, nameBg: 'Газ', nameEn: 'Gas' },
      { key: 'electric', sortOrder: 3, nameBg: 'Електричество', nameEn: 'Electric' },
      { key: 'none', sortOrder: 4, nameBg: 'Няма', nameEn: 'None' },
    ],
  },
  {
    key: 'parking',
    dataType: 'select',
    sortOrder: 2,
    filterable: true,
    nameBg: 'Паркинг',
    nameEn: 'Parking',
    options: [
      { key: 'garage', sortOrder: 1, nameBg: 'Гараж', nameEn: 'Garage' },
      { key: 'outdoor', sortOrder: 2, nameBg: 'Открито място', nameEn: 'Outdoor space' },
      { key: 'none', sortOrder: 3, nameBg: 'Няма', nameEn: 'None' },
    ],
  },
  {
    key: 'furnished',
    dataType: 'boolean',
    sortOrder: 3,
    filterable: true,
    nameBg: 'Обзаведен',
    nameEn: 'Furnished',
  },
  {
    key: 'floor',
    dataType: 'number',
    validation: { min: -2, max: 100 },
    sortOrder: 4,
    filterable: true,
    nameBg: 'Етаж',
    nameEn: 'Floor',
  },
  {
    key: 'dubai_community',
    dataType: 'text',
    appliesToMarkets: ['dubai_abroad'],
    sortOrder: 5,
    filterable: false,
    nameBg: 'Общност (Дубай)',
    nameEn: 'Dubai community',
    helpBg: 'Локална общност / комплекс в Дубай.',
    helpEn: 'Local community or compound in Dubai.',
  },
];

async function writeTranslation(
  db: Database,
  entityType: string,
  entityId: string,
  field: string,
  locale: string,
  value: string,
) {
  await db
    .insert(translations)
    .values({ entityType, entityId, locale, field, value })
    .onConflictDoUpdate({
      target: [
        translations.entityType,
        translations.entityId,
        translations.locale,
        translations.field,
      ],
      set: { value },
    });
}

async function upsertDefinition(db: Database, def: DefinitionSeed) {
  const existing = await db
    .select()
    .from(attributeDefinitions)
    .where(eq(attributeDefinitions.key, def.key))
    .limit(1);

  let id = existing[0]?.id;
  const values = {
    key: def.key,
    dataType: def.dataType,
    unit: def.unit ?? null,
    validation: def.validation ?? {},
    appliesToPropertyTypes: def.appliesToPropertyTypes ?? [],
    appliesToMarkets: def.appliesToMarkets ?? [],
    required: def.required ?? false,
    isPublic: def.isPublic ?? true,
    filterable: def.filterable ?? false,
    sortOrder: def.sortOrder,
  };

  if (id === undefined) {
    const [inserted] = await db
      .insert(attributeDefinitions)
      .values(values)
      .returning({ id: attributeDefinitions.id });
    id = inserted?.id;
  } else {
    await db
      .update(attributeDefinitions)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(attributeDefinitions.id, id));
  }
  if (id === undefined) throw new Error(`failed to upsert attribute ${def.key}`);

  await writeTranslation(db, 'attribute_definition', id, 'name', 'bg', def.nameBg);
  await writeTranslation(db, 'attribute_definition', id, 'name', 'en', def.nameEn);
  if (def.helpBg !== undefined) {
    await writeTranslation(db, 'attribute_definition', id, 'help', 'bg', def.helpBg);
  }
  if (def.helpEn !== undefined) {
    await writeTranslation(db, 'attribute_definition', id, 'help', 'en', def.helpEn);
  }

  for (const option of def.options ?? []) {
    const match = await db
      .select()
      .from(attributeOptions)
      .where(and(eq(attributeOptions.definitionId, id), eq(attributeOptions.key, option.key)))
      .limit(1);

    let optionId = match[0]?.id;
    if (optionId === undefined) {
      const [inserted] = await db
        .insert(attributeOptions)
        .values({
          definitionId: id,
          key: option.key,
          sortOrder: option.sortOrder,
        })
        .returning({ id: attributeOptions.id });
      optionId = inserted?.id;
    } else {
      await db
        .update(attributeOptions)
        .set({ sortOrder: option.sortOrder })
        .where(eq(attributeOptions.id, optionId));
    }
    if (optionId === undefined) continue;

    await writeTranslation(db, 'attribute_option', optionId, 'name', 'bg', option.nameBg);
    await writeTranslation(db, 'attribute_option', optionId, 'name', 'en', option.nameEn);
  }
}

export const attributesSeed: SeedModule = {
  name: 'attributes',
  run: async (db) => {
    for (const def of DEFINITIONS) {
      await upsertDefinition(db, def);
    }
  },
};
