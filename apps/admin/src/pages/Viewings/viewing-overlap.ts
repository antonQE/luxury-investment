import type { AdminViewing } from '@/api/endpoints/viewings';

const DEFAULT_DURATION_MS = 60 * 60 * 1000;
const INACTIVE = new Set(['declined', 'cancelled']);

function endMs(viewing: AdminViewing): number {
  if (viewing.endsAt !== null) return new Date(viewing.endsAt).getTime();
  return new Date(viewing.scheduledAt).getTime() + DEFAULT_DURATION_MS;
}

export function viewingsOverlap(a: AdminViewing, b: AdminViewing): boolean {
  if (a.id === b.id) return false;
  if (a.agentId !== b.agentId) return false;
  if (INACTIVE.has(a.status) || INACTIVE.has(b.status)) return false;
  const aStart = new Date(a.scheduledAt).getTime();
  const bStart = new Date(b.scheduledAt).getTime();
  const aEnd = endMs(a);
  const bEnd = endMs(b);
  return aStart < bEnd && bStart < aEnd;
}

/** Returns viewing ids that overlap at least one other viewing for the same agent. */
export function findOverlappingViewingIds(viewings: AdminViewing[]): Set<string> {
  const ids = new Set<string>();
  for (let i = 0; i < viewings.length; i += 1) {
    for (let j = i + 1; j < viewings.length; j += 1) {
      const left = viewings[i];
      const right = viewings[j];
      if (left === undefined || right === undefined) continue;
      if (viewingsOverlap(left, right)) {
        ids.add(left.id);
        ids.add(right.id);
      }
    }
  }
  return ids;
}
