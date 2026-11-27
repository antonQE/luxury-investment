// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('analytics session helpers', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    vi.resetModules();
  });

  it('keeps a persistent visitor and a separate short-lived session', async () => {
    const mod = await import('@/lib/analytics/session');
    const visitorA = mod.getAnalyticsVisitorKey();
    const sessionA = mod.getAnalyticsSessionKey();
    expect(visitorA.length).toBeGreaterThanOrEqual(8);
    expect(sessionA.length).toBeGreaterThanOrEqual(8);
    expect(mod.getAnalyticsVisitorKey()).toBe(visitorA);
    expect(mod.getAnalyticsSessionKey()).toBe(sessionA);
    expect(visitorA).not.toBe(sessionA);
  });

  it('migrates legacy localStorage session key into visitor id', async () => {
    window.localStorage.setItem('li_analytics_session', 'legacy-visitor-key-123');
    const mod = await import('@/lib/analytics/session');
    expect(mod.getAnalyticsVisitorKey()).toBe('legacy-visitor-key-123');
  });

  it('rotates session after idle timeout', async () => {
    vi.useFakeTimers();
    const mod = await import('@/lib/analytics/session');
    const first = mod.getAnalyticsSessionKey();
    vi.advanceTimersByTime(mod.ANALYTICS_SESSION_IDLE_MS + 1000);
    const second = mod.getAnalyticsSessionKey();
    expect(second).not.toBe(first);
    vi.useRealTimers();
  });
});
