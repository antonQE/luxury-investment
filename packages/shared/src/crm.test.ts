import { describe, expect, it } from 'vitest';

import { CONTACT_KINDS, CONTACT_ROLES, contactKindSchema, contactRoleSchema } from './crm.ts';

describe('crm contact enums', () => {
  it('accepts person and company kinds', () => {
    expect(contactKindSchema.parse('person')).toBe('person');
    expect(CONTACT_KINDS).toContain('company');
  });

  it('allows CRM-001 role set', () => {
    expect(CONTACT_ROLES).toEqual(['seller', 'buyer', 'investor', 'landlord', 'tenant', 'partner']);
    expect(contactRoleSchema.parse('buyer')).toBe('buyer');
  });
});
