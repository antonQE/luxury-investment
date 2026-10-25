import { PERMISSION_KEYS, ROLE_KEYS, ROLE_PERMISSIONS } from '@luxury-investment/shared';
import { hash } from '@node-rs/argon2';
import { eq } from 'drizzle-orm';

import { permissions, rolePermissions, roles, users } from '../schema.ts';
import type { SeedModule } from './index.ts';

const ROLE_LABELS: Record<(typeof ROLE_KEYS)[number], { nameBg: string; nameEn: string }> = {
  main_admin: { nameBg: 'Главен администратор', nameEn: 'Main administrator' },
  manager: { nameBg: 'Управител', nameEn: 'Manager' },
  agent: { nameBg: 'Брокер', nameEn: 'Agent' },
  marketing_editor: { nameBg: 'Маркетинг / редактор', nameEn: 'Marketing / editor' },
  external_partner: { nameBg: 'Външен партньор', nameEn: 'External partner' },
  viewer: { nameBg: 'Наблюдател', nameEn: 'Viewer' },
};

/** Local demo only — never use in production. Documented in apps/api/README.md. */
export const DEMO_ADMIN_EMAIL = 'admin@example.com';
export const DEMO_ADMIN_PASSWORD = 'DemoAdmin!234';

export const usersSeed: SeedModule = {
  name: 'users',
  run: async (db) => {
    for (const key of PERMISSION_KEYS) {
      await db
        .insert(permissions)
        .values({ key, description: key })
        .onConflictDoNothing({ target: permissions.key });
    }

    for (const key of ROLE_KEYS) {
      const labels = ROLE_LABELS[key];
      await db
        .insert(roles)
        .values({ key, nameBg: labels.nameBg, nameEn: labels.nameEn })
        .onConflictDoNothing({ target: roles.key });
    }

    const allRoles = await db.select().from(roles);
    const allPermissions = await db.select().from(permissions);
    const roleByKey = new Map(allRoles.map((row) => [row.key, row]));
    const permissionByKey = new Map(allPermissions.map((row) => [row.key, row]));

    for (const roleKey of ROLE_KEYS) {
      const role = roleByKey.get(roleKey);
      if (!role) continue;
      for (const permissionKey of ROLE_PERMISSIONS[roleKey]) {
        const permission = permissionByKey.get(permissionKey);
        if (!permission) continue;
        await db
          .insert(rolePermissions)
          .values({ roleId: role.id, permissionId: permission.id })
          .onConflictDoNothing();
      }
    }

    const mainAdmin = roleByKey.get('main_admin');
    if (!mainAdmin) {
      throw new Error('main_admin role missing after seed');
    }

    const passwordHash = await hash(DEMO_ADMIN_PASSWORD);
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, DEMO_ADMIN_EMAIL))
      .limit(1);
    if (existing.length === 0) {
      await db.insert(users).values({
        email: DEMO_ADMIN_EMAIL,
        passwordHash,
        displayName: 'Demo Admin',
        roleId: mainAdmin.id,
        isActive: true,
      });
    }
  },
};
