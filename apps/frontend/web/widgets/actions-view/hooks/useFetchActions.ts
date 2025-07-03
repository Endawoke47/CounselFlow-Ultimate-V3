import { useQuery } from '@tanstack/react-query';

import { actionsClient } from '@/entities/actions/api/actions.client';

export const useFetchActions = () => {
  return useQuery({
    queryKey: ['manage-actions'],
    queryFn: actionsClient.getActions,
  });
};
