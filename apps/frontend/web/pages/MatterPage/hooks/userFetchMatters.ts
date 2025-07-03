import { IMatter } from '1pd-types';
import { useQuery } from '@tanstack/react-query';

import { ApiResponse, fetchWithPagination } from '@/entities/api/fetchWithPagination';
import { APP_ROUTES } from '@/entities/api/routes';

export const useFetchMatters = () => {
  return useQuery<ApiResponse<IMatter>>({
    queryKey: ['matters'],
    queryFn: () => fetchWithPagination(APP_ROUTES.MATTERS, {}),
    refetchOnWindowFocus: false,
  });
};

