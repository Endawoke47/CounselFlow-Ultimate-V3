import React from 'react';

import { ContractForm } from '@/entities/contracts/ui/ContractForm';
import { useCreateContract } from '@/features/manage-contracts/hooks/useCreateContract';
import { Text } from '@/shared/ui/Text';

export const CreateContract = () => {
  const { mutateAsync: createContract } = useCreateContract();

  const onSubmit = async (data: any) => {
      await createContract(data);
  };

  return (
    <div className="p-6 flex flex-col gap-6 justify-center">
      <Text variant="heading">
        Add New Contract
      </Text>
      <ContractForm onSubmit={onSubmit} />
    </div>
  );
};
