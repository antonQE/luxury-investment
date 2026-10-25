import { desc } from 'drizzle-orm';

import type { Database } from '../../../infrastructure/db/client.ts';
import { auditEntries } from '../../../infrastructure/db/schema.ts';

export interface AuditWriteInput {
  actorUserId?: string | null;
  actorEmail?: string | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  metadata?: Record<string, unknown>;
}

/** Append-only audit writer. Call inside the same DB work as the mutating action when possible. */
export class AuditService {
  readonly #db: Database;

  constructor(db: Database) {
    this.#db = db;
  }

  async record(input: AuditWriteInput): Promise<void> {
    await this.#db.insert(auditEntries).values({
      actorUserId: input.actorUserId ?? null,
      actorEmail: input.actorEmail ?? null,
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId ?? null,
      metadata: input.metadata ?? {},
    });
  }

  async listRecent(limit = 50) {
    return this.#db.select().from(auditEntries).orderBy(desc(auditEntries.createdAt)).limit(limit);
  }
}
