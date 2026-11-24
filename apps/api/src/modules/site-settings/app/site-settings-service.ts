import {
  PUBLIC_EMAIL_SETTING_KEY,
  PUBLIC_PHONE_SETTING_KEY,
  type PublicSiteSettings,
  SOCIAL_FACEBOOK_SETTING_KEY,
  SOCIAL_INSTAGRAM_SETTING_KEY,
  SOCIAL_TIKTOK_SETTING_KEY,
  type UpdateSiteSettingsInput,
} from '@luxury-investment/shared';
import { inArray } from 'drizzle-orm';

import type { Database } from '../../../infrastructure/db/client.ts';
import { siteSettings } from '../../../infrastructure/db/schema.ts';

const PUBLIC_KEYS = [
  PUBLIC_PHONE_SETTING_KEY,
  PUBLIC_EMAIL_SETTING_KEY,
  SOCIAL_FACEBOOK_SETTING_KEY,
  SOCIAL_INSTAGRAM_SETTING_KEY,
  SOCIAL_TIKTOK_SETTING_KEY,
] as const;

async function upsertSetting(db: Database, key: string, value: string) {
  await db
    .insert(siteSettings)
    .values({ key, value, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: { value, updatedAt: new Date() },
    });
}

function readOptional(map: Map<string, string>, key: string): string | null {
  const value = map.get(key) ?? '';
  return value === '' ? null : value;
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
      .where(inArray(siteSettings.key, [...PUBLIC_KEYS]));

    const map = new Map(rows.map((row) => [row.key, row.value.trim()] as const));
    return {
      publicPhone: readOptional(map, PUBLIC_PHONE_SETTING_KEY),
      publicEmail: readOptional(map, PUBLIC_EMAIL_SETTING_KEY),
      facebookUrl: readOptional(map, SOCIAL_FACEBOOK_SETTING_KEY),
      instagramUrl: readOptional(map, SOCIAL_INSTAGRAM_SETTING_KEY),
      tiktokUrl: readOptional(map, SOCIAL_TIKTOK_SETTING_KEY),
    };
  }

  async update(input: UpdateSiteSettingsInput): Promise<PublicSiteSettings> {
    if (input.publicPhone !== undefined) {
      await upsertSetting(this.#db, PUBLIC_PHONE_SETTING_KEY, input.publicPhone ?? '');
    }
    if (input.publicEmail !== undefined) {
      await upsertSetting(this.#db, PUBLIC_EMAIL_SETTING_KEY, input.publicEmail ?? '');
    }
    if (input.facebookUrl !== undefined) {
      await upsertSetting(this.#db, SOCIAL_FACEBOOK_SETTING_KEY, input.facebookUrl ?? '');
    }
    if (input.instagramUrl !== undefined) {
      await upsertSetting(this.#db, SOCIAL_INSTAGRAM_SETTING_KEY, input.instagramUrl ?? '');
    }
    if (input.tiktokUrl !== undefined) {
      await upsertSetting(this.#db, SOCIAL_TIKTOK_SETTING_KEY, input.tiktokUrl ?? '');
    }
    return this.getPublic();
  }
}
