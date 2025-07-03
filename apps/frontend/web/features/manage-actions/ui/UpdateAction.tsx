import { useParams } from '@tanstack/react-router';
import React from 'react';

import { ActionForm } from '@/entities/actions/ui/ActionForm';
import { useFetchAction } from '@/features/manage-actions/hooks/useFetchAction';
import { useUpdateAction } from '@/features/manage-actions/hooks/useUpdateAction';
import { Text } from '@/shared/ui/Text';

export const UpdateAction = () => {
  const params = useParams({ strict: false });
  const actionId = params?.id;

  const { data: actionData, isLoading } = useFetchAction(actionId as string);
  const { mutateAsync: updateAction } = useUpdateAction(actionId as string);

  const onSubmit = async (data: any) => {
    await updateAction(data);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 flex flex-col gap-6 justify-center">
      <Text variant="heading">
        Edit Action
      </Text>
      <ActionForm onSubmit={onSubmit} defaultValues={actionData} />
    </div>
  );
};
