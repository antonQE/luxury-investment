import { describe, expect, it } from 'vitest';

import { ApiError } from '@/types/api';

describe('ApiError', () => {
  it('exposes status and treats 4xx as client errors', () => {
    const error = new ApiError('bad request', 400, { error: { code: 'VALIDATION_FAILED' } });
    expect(error.status).toBe(400);
    expect(error.code).toBe('VALIDATION_FAILED');
    expect(error.isClientError()).toBe(true);
    expect(error.isServerError()).toBe(false);
  });
});
