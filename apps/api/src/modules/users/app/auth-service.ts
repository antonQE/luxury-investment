import { randomBytes } from 'node:crypto';

import type { PermissionKey } from '@luxury-investment/shared';
import { verify } from '@node-rs/argon2';

import { AppError } from '../../../errors/app-error.ts';
import type { UserRepo } from '../repo/user-repo.ts';
import { hashSessionToken } from './session-token.ts';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  roleKey: string;
  permissions: PermissionKey[];
}

export class AuthService {
  readonly #repo: UserRepo;
  readonly #sessionTtlHours: number;
  readonly #sessionSecret: string;

  constructor(repo: UserRepo, sessionTtlHours: number, sessionSecret: string) {
    this.#repo = repo;
    this.#sessionTtlHours = sessionTtlHours;
    this.#sessionSecret = sessionSecret;
  }

  async login(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
    const row = await this.#repo.findActiveByEmail(email.trim().toLowerCase());
    if (!row?.isActive) {
      throw new AppError('UNAUTHENTICATED', 'Invalid email or password.');
    }
    const ok = await verify(row.passwordHash, password);
    if (!ok) {
      throw new AppError('UNAUTHENTICATED', 'Invalid email or password.');
    }

    const permissions = (await this.#repo.permissionKeysForRole(row.roleId)) as PermissionKey[];
    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + this.#sessionTtlHours * 60 * 60 * 1000);
    await this.#repo.createSession(hashSessionToken(this.#sessionSecret, token), row.id, expiresAt);

    return {
      token,
      user: {
        id: row.id,
        email: row.email,
        displayName: row.displayName,
        roleKey: row.roleKey,
        permissions,
      },
    };
  }

  async logout(token: string | undefined): Promise<void> {
    if (token === undefined || token === '') return;
    await this.#repo.deleteSession(hashSessionToken(this.#sessionSecret, token));
  }

  async resolveSession(token: string | undefined): Promise<AuthUser | null> {
    if (token === undefined || token === '') return null;
    const userId = await this.#repo.findSessionUserId(
      hashSessionToken(this.#sessionSecret, token),
      new Date(),
    );
    if (userId === null) return null;
    const row = await this.#repo.findActiveById(userId);
    if (row === null) return null;
    const permissions = (await this.#repo.permissionKeysForRole(row.roleId)) as PermissionKey[];
    return {
      id: row.id,
      email: row.email,
      displayName: row.displayName,
      roleKey: row.roleKey,
      permissions,
    };
  }
}
