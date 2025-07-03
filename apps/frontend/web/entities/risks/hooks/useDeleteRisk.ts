import { useMutation, useQueryClient } from '@tanstack/react-query';

import { risksClient } from '@/entities/actions/risks.client';

export const useDeleteRisk = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => risksClient.deleteRisk(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: ({ queryKey }) => queryKey.includes('risks')
      });
    },
  });
}; 