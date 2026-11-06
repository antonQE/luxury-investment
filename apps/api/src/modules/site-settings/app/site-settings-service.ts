import {
  PUBLIC_EMAIL_SETTING_KEY,
  PUBLIC_PHONE_SETTING_KEY,
  type PublicSiteSettings,
  type UpdateSiteSettingsInput,
} from '@luxury-investment/shared';
import { inArray } from 'drizzle-orm';

import type { Database } from '../../../infrastructure/db/client.ts';
import { siteSettings } from '../../../infrastructure/db/schema.ts';

async function upsertSetting(db: Database, key: string, value: string) {
  await db
    .insert(siteSettings)
    .values({ key, value, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: { value, updatedAt: new Date() },
    });
}

export class SiteSettingsService {
  readonly #db: Database;

  constructor(db: Database) {
    this.#db = db;
  }

  async getPublic(): Promise<PublicSiteSettings> {
    const rows = await this.#db
      .select()
      .from(siteSettings)
      .where(inArray(siteSettings.key, [PUBLIC_PHONE_SETTING_KEY, PUBLIC_EMAIL_SETTING_KEY]));

    const map = new Map(rows.map((row) => [row.key, row.value.trim()] as const));
    const phone = map.get(PUBLIC_PHONE_SETTING_KEY) ?? '';
    const email = map.get(PUBLIC_EMAIL_SETTING_KEY) ?? '';
    return {
      publicPhone: phone === '' ? null : phone,
      publicEmail: email === '' ? null : email,
    };
  }

  async update(input: UpdateSiteSettingsInput): Promise<PublicSiteSettings> {
    if (input.publicPhone !== undefined) {
      await upsertSetting(this.#db, PUBLIC_PHONE_SETTING_KEY, input.publicPhone ?? '');
    }
    if (input.publicEmail !== undefined) {
      await upsertSetting(this.#db, PUBLIC_EMAIL_SETTING_KEY, input.publicEmail ?? '');
    }
    return this.getPublic();
  }
}
