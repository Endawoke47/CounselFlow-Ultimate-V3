import { IContract } from '1pd-types/src/contracts';
import { useQuery } from '@tanstack/react-query';

import { contractsClient } from '@/entities/contracts/api/contracts.client';

export const useFetchContract = (contractId: string) => {
  return useQuery<IContract>({
    queryKey: ['contracts', contractId],
    queryFn: () => contractsClient.getContract(contractId),
    refetchOnWindowFocus: false,
    enabled: !!contractId,
  });
};
