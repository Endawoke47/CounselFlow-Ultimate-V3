import { useParams } from '@tanstack/react-router';
import React from 'react';

import { ContractForm } from '@/entities/contracts/ui/ContractForm';
import { useFetchContract } from '@/features/manage-contracts/hooks/useFetchContract';
import { useUpdateContract } from '@/features/manage-contracts/hooks/useUpdateContract';
import { Text } from '@/shared/ui/Text';

export const UpdateContract = () => {
  const params = useParams({ strict: false });
  const contractId = params?.contractId;

  const { data: contractData, isLoading } = useFetchContract(contractId as string);

  const { mutateAsync: updateContract } = useUpdateContract(
    contractId as string
  );

  const onSubmit = async (data: any) => {
      await updateContract(data);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 flex flex-col gap-6 justify-center">
      <Text variant="heading">
        Edit Contract
      </Text>
      <ContractForm defaultValues={contractData} onSubmit={onSubmit} />
    </div>
  );
};
