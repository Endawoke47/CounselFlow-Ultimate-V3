import { useMutation, useQueryClient } from '@tanstack/react-query';

import { companiesClient } from '@/entities/companies/api/company.client';

export const useDeleteCompany = (companyId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => companiesClient.deleteCompany(companyId),
    onSuccess: () => {
      console.log('Successfully deleted companies');
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
    onError: (error) => {
      console.error('Error deleting companies:', error);
    },
  });
};
