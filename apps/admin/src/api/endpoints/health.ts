import { apiClient } from '@/api/clients';

export interface HealthResponse {
  status: string;
  version: string;
  components: Record<string, string>;
}

/** Query-key factory for the health resource. */
export const healthKeys = {
  all: ['health'] as const,
  status: () => [...healthKeys.all, 'status'] as const,
};

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await apiClient.get<HealthResponse>('/health');
  return response.data;
}
