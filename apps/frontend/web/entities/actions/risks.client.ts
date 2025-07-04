import {
  TCreateRiskRequest,
  TCreateRiskResponse,
  TFindManyRisksResponse,
  TRiskResponse,
  TUpdateRiskRequest,
  TUpdateRiskResponse
} from '@counselflow/types';

import { httpClient } from '@/entities/api/http.client';
import { APP_ROUTES } from '@/entities/api/routes';

export const risksClient = {
  getRisks: async (params?: Record<string, string>) => {
    return httpClient.get<TFindManyRisksResponse>(APP_ROUTES.RISKS, { params });
  },

  getRisk: async (id: number) => {
    return httpClient.get<TRiskResponse>(`${APP_ROUTES.RISKS}/${id}`);
  },

  createRisk: async (data: TCreateRiskRequest) => {
    return httpClient.post<TCreateRiskRequest, TCreateRiskResponse>(
      APP_ROUTES.RISKS,
      data
    );
  },

  updateRisk: async (id: number, data: TUpdateRiskRequest) => {
    return httpClient.patch<TUpdateRiskRequest, TUpdateRiskResponse>(
      `${APP_ROUTES.RISKS}/${id}`,
      data
    );
  },

  deleteRisk: async (id: number) => {
    return httpClient.delete<void>(`${APP_ROUTES.RISKS}/${id}`);
  },

  restoreRisk: async (id: number) => {
    return httpClient.post<null, void>(
      `${APP_ROUTES.RISKS}/${id}/restore`,
      null
    );
  }
}; 