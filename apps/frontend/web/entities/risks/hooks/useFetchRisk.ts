import { TRiskResponse } from '@counselflow/types';
import { useQuery } from '@tanstack/react-query';

import { risksClient } from '@/entities/actions/risks.client';

export const useFetchRisk = (id: number) => {
  return useQuery<TRiskResponse>({
    queryKey: ['risk', id],
    queryFn: () => risksClient.getRisk(id),
    refetchOnWindowFocus: false,
    enabled: !!id && id > 0,
  });
}; 