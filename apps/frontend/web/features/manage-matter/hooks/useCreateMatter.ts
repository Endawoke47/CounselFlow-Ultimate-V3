import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'react-toastify';

import { mattersClient } from '@/entities/matters/api/matters.client';

export const useCreateMatter = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: mattersClient.createMatter,
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
