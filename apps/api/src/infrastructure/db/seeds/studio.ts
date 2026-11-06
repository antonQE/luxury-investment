import {
  DEFAULT_BROCHURE_TOGGLES,
  DEFAULT_SOCIAL_TOGGLES,
  DEMO_BROCHURE_A4_KEY,
  DEMO_SOCIAL_FEED_KEY,
  DEMO_SOCIAL_SQUARE_KEY,
} from '@luxury-investment/shared';
import { eq } from 'drizzle-orm';

import { brochureTemplates } from '../schema.ts';
import type { SeedModule } from './index.ts';

async function upsertTemplate(
  db: Parameters<SeedModule['run']>[0],
  values: typeof brochureTemplates.$inferInsert,
): Promise<void> {
  const [existing] = await db
    .select({ id: brochureTemplates.id })
    .from(brochureTemplates)
    .where(eq(brochureTemplates.key, values.key))
    .limit(1);

  if (existing === undefined) {
    await db.insert(brochureTemplates).values(values);
    return;
  }

  await db
    .update(brochureTemplates)
    .set({
      kind: values.kind,
      format: values.format,
      locale: values.locale,
      nameBg: values.nameBg,
      nameEn: values.nameEn,
      defaultToggles: values.defaultToggles,
      badgePreset: values.badgePreset,
      isActive: values.isActive,
      updatedAt: new Date(),
    })
    .where(eq(brochureTemplates.id, existing.id));
}

export const studioSeed: SeedModule = {
  name: 'studio',
  async run(db) {
    await upsertTemplate(db, {
      key: DEMO_BROCHURE_A4_KEY,
      kind: 'brochure_pdf',
      format: 'a4_pdf',
      locale: 'bg',
      nameBg: 'Демо A4 брошура',
      nameEn: 'Demo A4 brochure',
      defaultToggles: { ...DEFAULT_BROCHURE_TOGGLES },
      badgePreset: '',
      isActive: true,
    });

    await upsertTemplate(db, {
      key: DEMO_SOCIAL_FEED_KEY,
      kind: 'social_image',
      format: 'feed_1080x1350',
      locale: 'bg',
      nameBg: 'Демо Instagram feed',
      nameEn: 'Demo Instagram feed',
      defaultToggles: { ...DEFAULT_SOCIAL_TOGGLES },
      badgePreset: 'new',
      isActive: true,
    });

    await upsertTemplate(db, {
      key: DEMO_SOCIAL_SQUARE_KEY,
      kind: 'social_image',
      format: 'square_1080',
      locale: 'bg',
      nameBg: 'Демо квадрат 1080',
      nameEn: 'Demo square 1080',
      defaultToggles: { ...DEFAULT_SOCIAL_TOGGLES },
      badgePreset: 'exclusive',
      isActive: true,
    });
  },
};
