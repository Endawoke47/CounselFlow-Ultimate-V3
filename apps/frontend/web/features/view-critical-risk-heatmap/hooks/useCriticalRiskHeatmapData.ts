import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { httpClient } from '@/entities/api/http.client';
import { APP_ROUTES } from '@/entities/api/routes';

export function useCriticalRiskHeatmapData() {
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['critical-risk-heatmap'],
    queryFn: () => httpClient.get<any>(APP_ROUTES.CRITICAL_RISK_HEATMAP),
    refetchOnWindowFocus: false,
    staleTime: 0, // Treat data as stale immediately
  });

  useEffect(() => {
    if (data) {
      console.log('Critical Risk Heatmap Data:', data);
    }
  }, [data]);

  return { data, isLoading, error };
} 