import { TPaginatedResponse } from '1pd-types';
import { ICompany, ICreateCompanyRequest } from '1pd-types/src/companies';

import { httpClient } from '../../api/http.client';

import { APP_ROUTES } from '@/entities/api/routes';

export const companiesClient = {
  getCompanies: async () => {
    return httpClient.get<TPaginatedResponse<ICompany>>(APP_ROUTES.COMPANIES);
  },

  getCompany: async (id: string) => {
    return httpClient.get<ICompany>(`${APP_ROUTES.COMPANIES}/${id}`);
  },

  createCompany: async (data: ICreateCompanyRequest) => {
    return httpClient.post<ICreateCompanyRequest, ICompany>(
      APP_ROUTES.COMPANIES,
      data
    );
  },

  updateCompany: async (id: string, data: ICreateCompanyRequest) => {
    return httpClient.patch<ICreateCompanyRequest, ICompany>(
      `${APP_ROUTES.COMPANIES}/${id}`,
      data
    );
  },

  deleteCompany: async (id: string) => {
    return httpClient.delete<undefined>(`${APP_ROUTES.COMPANIES}/${id}`);
  },
};
