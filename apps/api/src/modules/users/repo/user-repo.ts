import { and, eq, gt } from 'drizzle-orm';

import type { Database } from '../../../infrastructure/db/client.ts';
import {
  permissions,
  rolePermissions,
  roles,
  sessions,
  users,
} from '../../../infrastructure/db/schema.ts';

export interface StaffUserRow {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  roleId: string;
  roleKey: string;
  isActive: boolean;
}

export class UserRepo {
  readonly #db: Database;

  constructor(db: Database) {
    this.#db = db;
  }

  async findActiveByEmail(email: string): Promise<StaffUserRow | null> {
    const [row] = await this.#db
      .select({
        id: users.id,
        email: users.email,
        passwordHash: users.passwordHash,
        displayName: users.displayName,
        roleId: users.roleId,
        roleKey: roles.key,
        isActive: users.isActive,
      })
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);
    return row ?? null;
  }

  async findActiveById(id: string): Promise<StaffUserRow | null> {
    const [row] = await this.#db
      .select({
        id: users.id,
        email: users.email,
        passwordHash: users.passwordHash,
        displayName: users.displayName,
        roleId: users.roleId,
        roleKey: roles.key,
        isActive: users.isActive,
      })
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .where(and(eq(users.id, id), eq(users.isActive, true)))
      .limit(1);
    return row ?? null;
  }

  async permissionKeysForRole(roleId: string): Promise<string[]> {
    const rows = await this.#db
      .select({ key: permissions.key })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, roleId));
    return rows.map((row) => row.key);
  }

  async createSession(id: string, userId: string, expiresAt: Date): Promise<void> {
    await this.#db.insert(sessions).values({ id, userId, expiresAt });
  }

  async findSessionUserId(sessionId: string, now: Date): Promise<string | null> {
    const [row] = await this.#db
      .select({ userId: sessions.userId })
      .from(sessions)
      .where(and(eq(sessions.id, sessionId), gt(sessions.expiresAt, now)))
      .limit(1);
    return row?.userId ?? null;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.#db.delete(sessions).where(eq(sessions.id, sessionId));
  }
}
