import { PUBLIC_EMAIL_SETTING_KEY, PUBLIC_PHONE_SETTING_KEY } from '@luxury-investment/shared';
import { eq } from 'drizzle-orm';

import { siteSettings } from '../schema.ts';
import type { SeedModule } from './index.ts';

const DEFAULTS = [
  { key: PUBLIC_PHONE_SETTING_KEY, value: '+359 2 000 00 00' },
  { key: PUBLIC_EMAIL_SETTING_KEY, value: 'hello@example.com' },
] as const;

export const siteSettingsSeed: SeedModule = {
  name: 'site-settings',
  run: async (db) => {
    for (const row of DEFAULTS) {
      const [existing] = await db
        .select({ key: siteSettings.key })
        .from(siteSettings)
        .where(eq(siteSettings.key, row.key))
        .limit(1);
      if (existing === undefined) {
        await db.insert(siteSettings).values({ key: row.key, value: row.value });
      }
    }
  },
};
