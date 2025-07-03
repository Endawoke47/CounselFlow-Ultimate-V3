import { useQuery } from '@tanstack/react-query';

import { companiesClient } from '@/entities/companies/api/company.client';

export const useFetchCompanies = () => {
  return useQuery({
    queryKey: ['companies'],
    queryFn: companiesClient.getCompanies,
  });
};
