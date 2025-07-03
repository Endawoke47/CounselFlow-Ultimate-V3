import { useQuery } from '@tanstack/react-query';

import { actionsClient } from '@/entities/actions/api/actions.client';

export const useFetchAction = (actionId: string) => {
  return useQuery({
    queryKey: ['actions', actionId],
    queryFn: () => actionsClient.getAction(actionId),
    refetchOnWindowFocus: false,
    enabled: !!actionId,
  });
};
