import { useMutation, useQueryClient } from '@tanstack/react-query';

import { companiesClient } from '@/entities/companies/api/company.client';

export const useCreateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: companiesClient.createCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: ({ queryKey }) => queryKey?.includes?.('companies'),
      });
    },
  });
};
