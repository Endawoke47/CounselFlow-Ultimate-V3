import { useQuery } from '@tanstack/react-query';

import { companiesClient } from '@/entities/companies/api/company.client';

export const useFetchCompany = (companyId: string) => {
  return useQuery({
    queryKey: ['companies', companyId],
    queryFn: () => companiesClient.getCompany(companyId),
    refetchOnWindowFocus: false,
    enabled: !!companyId,
  });
};
