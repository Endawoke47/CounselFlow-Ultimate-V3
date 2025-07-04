import { TCreateActionRequest } from '@counselflow/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'react-toastify';

import { actionsClient } from '@/entities/actions/api/actions.client';

export const useUpdateAction = (actionId: string) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (data: TCreateActionRequest) =>
      actionsClient.updateAction(actionId, data),
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
