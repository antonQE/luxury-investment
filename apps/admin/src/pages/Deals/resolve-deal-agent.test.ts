import { describe, expect, it } from 'vitest';

import { resolveDealAgentId } from './DealsList';

describe('resolveDealAgentId', () => {
  it('keeps an explicit agent selection', () => {
    expect(resolveDealAgentId('agent-2', 'agent-1')).toBe('agent-2');
  });

  it('falls back to the authenticated user when agent is empty', () => {
    expect(resolveDealAgentId('', 'agent-1')).toBe('agent-1');
  });

  it('returns empty when neither agent nor user is available', () => {
    expect(resolveDealAgentId('', undefined)).toBe('');
    expect(resolveDealAgentId('', null)).toBe('');
  });
});
