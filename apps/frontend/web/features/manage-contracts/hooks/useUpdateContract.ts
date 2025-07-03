import { ICreateContractRequest } from '1pd-types/src/contracts';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'react-toastify';

import { contractsClient } from '@/entities/contracts/api/contracts.client';

export const useUpdateContract = (contractId: string) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (data: ICreateContractRequest) =>
      contractsClient.updateContract(contractId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: ({ queryKey }) => queryKey?.includes?.('contracts'),
      });
      navigate({ to: '/contracts' });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
