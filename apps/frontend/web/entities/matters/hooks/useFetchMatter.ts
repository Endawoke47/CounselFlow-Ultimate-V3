import { IMatter } from '@counselflow/types';
import { useQuery } from '@tanstack/react-query';

import { mattersClient } from '@/entities/matters/api/matters.client';

export const useFetchMatter = (matterId: string) => {
  return useQuery<IMatter>({
    queryKey: ['matters', matterId],
    queryFn: () => mattersClient.getMatter(matterId),
    refetchOnWindowFocus: false,
    enabled: !!matterId,
  });
};