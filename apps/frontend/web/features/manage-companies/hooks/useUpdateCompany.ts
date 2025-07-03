import { ICreateCompanyRequest } from '1pd-types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'react-toastify';

import { companiesClient } from '@/entities/companies/api/company.client';

export const useUpdateCompany = (companyId: string) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (data: ICreateCompanyRequest) =>
      companiesClient.updateCompany(companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: ({ queryKey }) => queryKey?.includes?.('companies'),
      });
      navigate({ to: '/companies' });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
