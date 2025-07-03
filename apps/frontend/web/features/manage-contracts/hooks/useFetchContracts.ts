import { useQuery } from '@tanstack/react-query';

import { contractsClient } from '@/entities/contracts/api/contracts.client';

export const useFetchContracts = () => {
  return useQuery({
    queryKey: ['contracts'],
    queryFn: contractsClient.getContracts,
  });
};
