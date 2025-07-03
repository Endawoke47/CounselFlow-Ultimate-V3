import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'react-toastify';

import { contractsClient } from '@/entities/contracts/api/contracts.client';

export const useCreateContract = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: contractsClient.createContract,
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
