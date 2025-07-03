import { ICreateMatterRequest } from '1pd-types/src/matters';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'react-toastify';

import { mattersClient } from '@/entities/matters/api/matters.client';

export const useUpdateMatter = (matterId: string) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (data: ICreateMatterRequest) =>
      mattersClient.updateMatter(matterId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: ({ queryKey }) => queryKey?.includes?.('matters'),
      });
      navigate({ to: '/matters' });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
