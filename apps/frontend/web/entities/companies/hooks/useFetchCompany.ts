import { ICompany } from '1pd-types/src/companies';
import { useQuery } from '@tanstack/react-query';

import { companiesClient } from '@/entities/companies/api/company.client';

export const useFetchCompany = (companyId: string) => {
  return useQuery<ICompany>({
    queryKey: ['companies', companyId],
    queryFn: () => companiesClient.getCompany(companyId),
    refetchOnWindowFocus: false,
    enabled: !!companyId,
  });
};
