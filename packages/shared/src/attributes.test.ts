import { describe, expect, it } from 'vitest';

import {
  ATTRIBUTE_DATA_TYPES,
  attributeDataTypeSchema,
  SEEDED_ATTRIBUTE_KEYS,
} from './attributes.ts';

describe('attributes', () => {
  it('exposes seeded keys and data types', () => {
    expect(SEEDED_ATTRIBUTE_KEYS).toContain('heating');
    expect(ATTRIBUTE_DATA_TYPES).toContain('select');
    expect(attributeDataTypeSchema.parse('boolean')).toBe('boolean');
  });
});
