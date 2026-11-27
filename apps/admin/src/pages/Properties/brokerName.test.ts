import { describe, expect, it } from 'vitest';

import { formatBrokerName } from './brokerName';

describe('formatBrokerName', () => {
  it('returns the trimmed broker name', () => {
    expect(formatBrokerName('  Ivan Petrov ')).toBe('Ivan Petrov');
  });

  it('returns a dash for empty, blank or missing names', () => {
    expect(formatBrokerName('')).toBe('—');
    expect(formatBrokerName('   ')).toBe('—');
    expect(formatBrokerName(null)).toBe('—');
    expect(formatBrokerName(undefined)).toBe('—');
  });
});
