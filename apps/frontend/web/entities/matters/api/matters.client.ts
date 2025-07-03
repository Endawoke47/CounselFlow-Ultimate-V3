import { ICreateMatterRequest, IMatter, TPaginatedResponse } from '1pd-types';

import { httpClient } from '../../api/http.client';

import { APP_ROUTES } from '@/entities/api/routes';

export const mattersClient = {
  getMatters: async () => {
    return httpClient.get<TPaginatedResponse<IMatter>>(APP_ROUTES.MATTERS);
  },

  getMatter: async (id: string) => {
    return httpClient.get<IMatter>(`${APP_ROUTES.MATTERS}/${id}`);
  },

  createMatter: async (data: ICreateMatterRequest) => {
    return httpClient.post<ICreateMatterRequest, IMatter>(
      APP_ROUTES.MATTERS,
      data
    );
  },

  updateMatter: async (id: string, data: ICreateMatterRequest) => {
    return httpClient.patch<ICreateMatterRequest, IMatter>(
      `${APP_ROUTES.MATTERS}/${id}`,
      data
    );
  },

  deleteMatter: async (id: string) => {
    return httpClient.delete<undefined>(`${APP_ROUTES.MATTERS}/${id}`);
  },
};
