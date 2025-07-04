import { TFindManyRisksResponse } from '@counselflow/types';
import { useQuery } from '@tanstack/react-query';

import { fetchWithPagination } from '@/entities/api/fetchWithPagination';
import { APP_ROUTES } from '@/entities/api/routes';

interface FetchRisksParams {
  page?: number;
  search?: string;
  sortBy?: [string, 'ASC' | 'DESC'][];
  limit?: number;
}

export const useFetchRisks = (params: FetchRisksParams = {}) => {
  const { page, search, sortBy, limit } = params;
  
  return useQuery<TFindManyRisksResponse>({
    queryKey: ['risks', page, search, sortBy, limit],
    queryFn: () => fetchWithPagination(APP_ROUTES.RISKS, {
      page,
      search,
      sortBy,
      limit
    }),
    refetchOnWindowFocus: false,
  });
};
