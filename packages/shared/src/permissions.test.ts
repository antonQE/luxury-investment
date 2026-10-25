import { describe, expect, it } from 'vitest';

import { PERMISSION_KEYS, ROLE_KEYS, ROLE_PERMISSIONS } from './permissions.ts';

describe('permissions', () => {
  it('gives main_admin every permission key', () => {
    expect(ROLE_PERMISSIONS.main_admin).toEqual(PERMISSION_KEYS);
  });

  it('defines a template for every role key', () => {
    for (const key of ROLE_KEYS) {
      expect(ROLE_PERMISSIONS[key].length).toBeGreaterThan(0);
    }
  });
});
