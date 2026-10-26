import { describe, expect, it } from 'vitest';

import type { AdminViewing } from '@/api/endpoints/viewings';

import { findOverlappingViewingIds, viewingsOverlap } from './viewing-overlap';

function viewing(
  partial: Partial<AdminViewing> & Pick<AdminViewing, 'id' | 'agentId'>,
): AdminViewing {
  return {
    propertyId: 'p1',
    contactId: 'c1',
    inquiryId: null,
    scheduledAt: '2026-11-05T10:00:00.000Z',
    endsAt: '2026-11-05T11:00:00.000Z',
    locationNote: '',
    accessInstructions: '',
    status: 'scheduled',
    outcomeNote: '',
    nextActionNote: '',
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
    ...partial,
  };
}

describe('viewing overlap', () => {
  it('detects same-agent overlapping ranges', () => {
    const a = viewing({
      id: 'a',
      agentId: 'agent-1',
      scheduledAt: '2026-11-05T10:00:00.000Z',
      endsAt: '2026-11-05T11:00:00.000Z',
    });
    const b = viewing({
      id: 'b',
      agentId: 'agent-1',
      scheduledAt: '2026-11-05T10:30:00.000Z',
      endsAt: '2026-11-05T11:30:00.000Z',
    });
    expect(viewingsOverlap(a, b)).toBe(true);
    expect(findOverlappingViewingIds([a, b])).toEqual(new Set(['a', 'b']));
  });

  it('ignores different agents and declined viewings', () => {
    const a = viewing({
      id: 'a',
      agentId: 'agent-1',
      scheduledAt: '2026-11-05T10:00:00.000Z',
      endsAt: '2026-11-05T11:00:00.000Z',
    });
    const otherAgent = viewing({
      id: 'b',
      agentId: 'agent-2',
      scheduledAt: '2026-11-05T10:30:00.000Z',
      endsAt: '2026-11-05T11:30:00.000Z',
    });
    const declined = viewing({
      id: 'c',
      agentId: 'agent-1',
      status: 'declined',
      scheduledAt: '2026-11-05T10:30:00.000Z',
      endsAt: '2026-11-05T11:30:00.000Z',
    });
    expect(viewingsOverlap(a, otherAgent)).toBe(false);
    expect(viewingsOverlap(a, declined)).toBe(false);
    expect(findOverlappingViewingIds([a, otherAgent, declined]).size).toBe(0);
  });
});
