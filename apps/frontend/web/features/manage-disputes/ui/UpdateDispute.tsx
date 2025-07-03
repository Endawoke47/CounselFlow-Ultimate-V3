import { useParams } from '@tanstack/react-router';
import React from 'react';

import { Text } from '@/shared/ui/Text';
import { useFetchDispute } from '@/features/manage-disputes/hooks/useFetchDispute';
import { useUpdateDispute } from '@/features/manage-disputes/hooks/useUpdateDispute';
import { DisputeForm } from '@/entities/disputes/ui/DisputeForm';

export const UpdateDispute = () => {
  const params = useParams({ strict: false });
  const disputeId = params?.disputeId;

  const { data: disputeData, isLoading } = useFetchDispute(disputeId);
  const { mutateAsync: updateDispute } = useUpdateDispute(disputeId);

  const onSubmit = async (data: any) => {
    await updateDispute(data);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 flex flex-col gap-6 justify-center">
      <Text variant="heading">
        Edit New Dispute Resolution
      </Text>
      <DisputeForm onSubmit={onSubmit} defaultValues={disputeData} />
    </div>
  );
};
