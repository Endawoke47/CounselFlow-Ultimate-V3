import { useQuery } from '@tanstack/react-query';

import { disputesClient } from '@/entities/disputes/api/disputes.client';

export const useFetchDisputes = () => {
  return useQuery({
    queryKey: ['disputes'],
    queryFn: disputesClient.getDisputes,
  });
};
