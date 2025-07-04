import { TUpdateRiskRequest } from '@counselflow/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

import { risksClient } from '@/entities/actions/risks.client';

export const useUpdateRisk = (id: number) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  return useMutation({
    mutationFn: (data: TUpdateRiskRequest) => risksClient.updateRisk(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: ({ queryKey }) => 
          queryKey.includes('risks') || 
          (queryKey.includes('risk') && queryKey.includes(id))
      });
      navigate({ to: '/risks' });
    },
  });
};
