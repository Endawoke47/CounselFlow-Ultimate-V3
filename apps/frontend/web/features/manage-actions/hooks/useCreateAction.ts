import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'react-toastify';

import { actionsClient } from '@/entities/actions/api/actions.client';

export const useCreateAction = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: actionsClient.createAction,
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: ({ queryKey }) => queryKey?.includes?.('actions'),
      });
      navigate({ to: '/actions' });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
