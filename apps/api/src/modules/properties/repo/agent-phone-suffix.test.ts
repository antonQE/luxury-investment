import { describe, expect, it } from 'vitest';

import { agentPhoneSuffix } from './property-repo.ts';

describe('agentPhoneSuffix', () => {
  it('returns the last 9 digits when long enough', () => {
    expect(agentPhoneSuffix('+359 000 000 001')).toBe('000000001');
    expect(agentPhoneSuffix('00359000000001')).toBe('000000001');
  });

  it('returns null for short or empty phones', () => {
    expect(agentPhoneSuffix('123')).toBeNull();
    expect(agentPhoneSuffix('')).toBeNull();
  });
});
