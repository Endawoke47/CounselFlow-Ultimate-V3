import { useQuery } from '@tanstack/react-query';

import { httpClient } from '@/entities/api/http.client';
import { APP_ROUTES } from '@/entities/api/routes';

// Define the interface directly here or import if it exists elsewhere
interface TopMatterData {
  id: number;
  name: string;
  numberOfRisks: number;
}

export const useTopMatters = () => {
  return useQuery<TopMatterData[]>({
    queryKey: ['topMatters'],
    queryFn: () => httpClient.get<TopMatterData[]>(APP_ROUTES.TOP_MATTERS),
  });
}; 