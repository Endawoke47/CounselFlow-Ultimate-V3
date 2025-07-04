import { TFindManyRisksResponse } from '@counselflow/types';
import { useQuery } from '@tanstack/react-query';

import { fetchWithPagination } from '@/entities/api/fetchWithPagination';
import { APP_ROUTES } from '@/entities/api/routes';

interface DashboardRisksParams {
  page?: number;
  limit?: number;
}

export const useDashboardRisks = ({ page = 1, limit = 10 }: DashboardRisksParams = {}) => {
  
  const queryKey = ['dashboardRisks', page, limit];

  const queryFn = () => {
    return fetchWithPagination<TFindManyRisksResponse['data'][0]>(
      APP_ROUTES.RISKS,
      {
        page,
        limit,
        sortBy: [['score', 'DESC']],
        filter: { status: '$not:CLOSED' }
      }
    );
  };

  return useQuery<TFindManyRisksResponse>({
    queryKey,
    queryFn,
    refetchOnWindowFocus: false,
  });
}; 