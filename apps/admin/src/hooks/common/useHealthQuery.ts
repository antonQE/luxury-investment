import { useQuery } from '@tanstack/react-query';

import { fetchHealth, healthKeys } from '@/api/endpoints/health';

export function useHealthQuery() {
  return useQuery({
    queryKey: healthKeys.status(),
    queryFn: fetchHealth,
  });
}
