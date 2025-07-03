import { useQuery } from '@tanstack/react-query';

import { disputesClient } from '@/entities/disputes/api/disputes.client';

export const useFetchDispute = (disputeId: number) => {
  return useQuery({
    queryKey: ['disputes', disputeId],
    queryFn: () => disputesClient.getDispute(disputeId),
    refetchOnWindowFocus: false,
    enabled: !!disputeId,
  });
};
