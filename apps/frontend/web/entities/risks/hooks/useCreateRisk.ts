import { TCreateRiskRequest } from '1pd-types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

import { risksClient } from '@/entities/actions/risks.client';



export const useCreateRisk = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  return useMutation({
    mutationFn: (data: TCreateRiskRequest) => risksClient.createRisk(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: ({ queryKey }) => queryKey.includes('risks'),
      });
      navigate({ to: '/risks' });
    },
  });
};
