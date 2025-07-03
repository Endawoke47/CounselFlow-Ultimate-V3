import { httpClient } from '@/entities/api/http.client';
import { APP_ROUTES } from '@/entities/api/routes';
import { TPaginatedResponse } from '1pd-types';

export const disputesClient = {
  getDisputes: async () => {
    return httpClient.get<TPaginatedResponse<any>>(APP_ROUTES.DISPUTES);
  },

  getDispute: async (id: number) => {
    return httpClient.get<any>(`${APP_ROUTES.DISPUTES}/${id}`);
  },

  createDispute: async (data: any) => {
    return httpClient.post<any, any>(
      APP_ROUTES.DISPUTES,
      data
    );
  },

  updateDispute: async (id: number, data: any) => {
    return httpClient.patch<any, any>(
      `${APP_ROUTES.DISPUTES}/${id}`,
      data
    );
  },

  deleteDispute: async (id: number) => {
    return httpClient.delete<void>(`${APP_ROUTES.DISPUTES}/${id}`);
  },

  restoreRisk: async (id: number) => {
    return httpClient.post<null, void>(
      `${APP_ROUTES.RISKS}/${id}/restore`,
      null
    );
  }
}; 