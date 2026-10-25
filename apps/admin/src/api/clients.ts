import { QueryClient } from '@tanstack/react-query';

import { env } from '@/config/env';
import { ApiError } from '@/types/api';

import HttpClient from './HttpClient';

export const apiClient = new HttpClient(env().apiUrl);

function shouldRetry(failureCount: number, error: unknown, max: number): boolean {
  if (error instanceof ApiError && error.isClientError()) return false;
  if (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof error.status === 'number' &&
    error.status >= 400 &&
    error.status < 500
  ) {
    return false;
  }
  return failureCount < max;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => shouldRetry(failureCount, error, 3),
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30_000),
      staleTime: 1000 * 60,
      refetchOnWindowFocus: false,
      throwOnError: false,
    },
    mutations: {
      retry: (failureCount, error) => shouldRetry(failureCount, error, 1),
      throwOnError: false,
    },
  },
});
