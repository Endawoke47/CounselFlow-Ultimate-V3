import { useQuery } from '@tanstack/react-query';

import { httpClient } from '@/entities/api/http.client';
import { APP_ROUTES } from '@/entities/api/routes';

// Define the interface directly here
export interface KpiData {
  newRisksThisMonth: number;
  pendingRiskActions: number;
  newHighCriticalRisksThisMonth: number; // Derived for backward compatibility
}

// Raw data shape from the API
interface RawKpiData {
  newRisksThisMonth: number;
  pendingRiskActions: number;
}

export const useFetchKpis = () => {
  return useQuery<KpiData>({
    queryKey: ['dashboardKpis'],
    queryFn: async () => {
      const rawData = await httpClient.get<RawKpiData>(APP_ROUTES.KPIS);
      // Add backward compatibility mapping
      return {
        ...rawData,
        newHighCriticalRisksThisMonth: rawData.newRisksThisMonth
      };
    },
  });
}; 