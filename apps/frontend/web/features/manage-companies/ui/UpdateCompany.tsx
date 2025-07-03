import { useParams } from '@tanstack/react-router';
import React from 'react';

import { CompanyForm } from '@/entities/companies/ui/CompanyForm';
import { useFetchCompany } from '@/features/manage-companies/hooks/useFetchCompany';
import { useUpdateCompany } from '@/features/manage-companies/hooks/useUpdateCompany';
import { Text } from '@/shared/ui/Text';

export const UpdateCompany = () => {
  const params = useParams({ strict: false });
  const companyId = params?.companyId;

  const { data: companyData, isLoading } = useFetchCompany(companyId as string);
  const { mutateAsync: updateCompany } = useUpdateCompany(companyId as string);

  const onSubmit = async (data: any) => {
    await updateCompany(data);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 flex flex-col gap-6 justify-center">
      <Text variant="heading">
        Edit Company
      </Text>
      <CompanyForm onSubmit={onSubmit} defaultValues={companyData} />
    </div>
  );
};
