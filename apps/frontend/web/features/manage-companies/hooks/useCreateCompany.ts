import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'react-toastify';

import { companiesClient } from '@/entities/companies/api/company.client';

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: companiesClient.createCompany,
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
