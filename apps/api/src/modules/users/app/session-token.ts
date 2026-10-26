import { createHmac, timingSafeEqual } from 'node:crypto';

/** Opaque cookie value → DB primary key (HMAC-SHA256, base64url). */
export function hashSessionToken(secret: string, token: string): string {
  return createHmac('sha256', secret).update(token).digest('base64url');
}

/** Constant-time compare of two HMAC digests (defensive helper for tests/tools). */
export function sessionTokenHashesEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
