import { fetchWithAuth } from '@/entities/api/fetchWithAuth';

export interface ApiResponse<T> {
  data: T[];
  meta: {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
    sortBy: [string, 'ASC' | 'DESC'][];
  };
  links: {
    current: string;
    next: string;
    last: string;
  };
}

interface FetchWithPaginationOptions extends Omit<RequestInit, 'credentials'> {
  page?: number;
  search?: string;
  sortBy?: [string, 'ASC' | 'DESC'][];
  limit?: number;
  filter?: Record<string, string>;
}

export const fetchWithPagination = async <T>(
  url: string,
  options: FetchWithPaginationOptions = {}
): Promise<ApiResponse<T>> => {
  const queryParams = new URLSearchParams();
  if (options.page) {
    queryParams.append('page', options.page.toString());
  }
  if (options.search) {
    queryParams.append('search', options.search.toString());
  }
  if (options.limit) {
    queryParams.append('limit', options.limit.toString());
  }
  if (options.sortBy && options.sortBy.length > 0) {
    options.sortBy.forEach(([field, order]) => {
      queryParams.append('sortBy', `${field}:${order}`);
    });
  }
  if (options.filter) {
    Object.entries(options.filter).forEach(([key, value]) => {
      queryParams.append(`filter.${key}`, value);
    });
  }
  const fullUrl = `${url}${url.includes('?') ? '&' : '?'}${queryParams.toString()}`;
  return await fetchWithAuth(fullUrl, { ...options, method: 'GET' });
};
