import {
  IContract,
  ICreateContractRequest, IUpdateContractRequest,
  TPaginatedResponse,
} from '1pd-types';

import { httpClient } from '../../api/http.client';

import { APP_ROUTES } from '@/entities/api/routes';

export const contractsClient = {
  getContracts: async () => {
    return httpClient.get<TPaginatedResponse<IContract>>(APP_ROUTES.CONTRACTS);
  },

  getContract: async (id: string) => {
    return httpClient.get<IContract>(`${APP_ROUTES.CONTRACTS}/${id}`);
  },

  createContract: async (data: ICreateContractRequest) => {
    return httpClient.post<ICreateContractRequest, IContract>(
      APP_ROUTES.CONTRACTS,
      data
    );
  },

  updateContract: async (id: string, data: IUpdateContractRequest) => {
    return httpClient.patch<IUpdateContractRequest, IContract>(
      `${APP_ROUTES.CONTRACTS}/${id}`,
      data
    );
  },

  deleteContract: async (id: string) => {
    return httpClient.delete<undefined>(`${APP_ROUTES.CONTRACTS}/${id}`);
  },
};
