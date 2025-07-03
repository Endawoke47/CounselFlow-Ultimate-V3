import { IAction, TCreateActionRequest, TCreateActionResponse, TPaginatedResponse } from '1pd-types';

import { httpClient } from '../../api/http.client';

import { APP_ROUTES } from '@/entities/api/routes';

export const actionsClient = {
  getActions: async () => {
    return httpClient.get<TPaginatedResponse<TCreateActionResponse>>(APP_ROUTES.ACTIONS);
  },

  getAction: async (id: string) => {
    return httpClient.get<IAction>(`${APP_ROUTES.ACTIONS}/${id}`);
  },

  createAction: async (data: TCreateActionRequest) => {
    return httpClient.post<TCreateActionRequest, TCreateActionResponse>(
      APP_ROUTES.ACTIONS,
      data
    );
  },

  updateAction: async (id: string, data: TCreateActionRequest) => {
    return httpClient.patch<TCreateActionRequest, TCreateActionResponse>(
      `${APP_ROUTES.ACTIONS}/${id}`,
      data
    );
  },

  deleteAction: async (id: string) => {
    return httpClient.delete<undefined>(`${APP_ROUTES.ACTIONS}/${id}`);
  },
};
