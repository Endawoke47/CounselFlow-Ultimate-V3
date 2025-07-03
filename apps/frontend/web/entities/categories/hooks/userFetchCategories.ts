import { useQuery } from '@tanstack/react-query';

import { ApiResponse, fetchWithPagination } from '@/entities/api/fetchWithPagination';
import { APP_ROUTES } from '@/entities/api/routes';
import { Category } from '@/entities/categories/model/type';

export const useFetchCategories = () => {
  return useQuery<ApiResponse<Category>>({
    queryKey: ['categories'],
    queryFn: () => fetchWithPagination(APP_ROUTES.CATEGORIES, {}),
    refetchOnWindowFocus: false,
  });
};
