import { describe, expect, it } from 'vitest';

import {
  hashSessionToken,
  sessionTokenHashesEqual,
} from '../../src/modules/users/app/session-token.ts';

describe('hashSessionToken', () => {
  it('is deterministic and secret-dependent', () => {
    const a = hashSessionToken('secret-one-sixteen', 'token-a');
    const b = hashSessionToken('secret-one-sixteen', 'token-a');
    const c = hashSessionToken('secret-one-sixteen', 'token-b');
    const d = hashSessionToken('secret-two-sixteen', 'token-a');
    expect(sessionTokenHashesEqual(a, b)).toBe(true);
    expect(sessionTokenHashesEqual(a, c)).toBe(false);
    expect(sessionTokenHashesEqual(a, d)).toBe(false);
  });
});
