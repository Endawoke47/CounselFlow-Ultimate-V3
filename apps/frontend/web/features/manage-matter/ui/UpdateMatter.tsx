import { useParams } from '@tanstack/react-router';
import React from 'react';

import { useFetchMatter } from '@/entities/matters/hooks/useFetchMatter';
import { MatterForm } from '@/entities/matters/ui/MatterForm';
import { useUpdateMatter } from '@/features/manage-matter/hooks/useUpdateMatter';
import { Text } from '@/shared/ui/Text';

export const UpdateMatter = () => {
  const params = useParams({ strict: false });
  const matterId = params?.matterId;

  const { data: matterData, isLoading } = useFetchMatter(matterId as string);
  const { mutateAsync: updateMatter } = useUpdateMatter(matterId as string);

  const onSubmit = async (data: any) => {
      await updateMatter(data);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 flex flex-col gap-6 justify-center">
      <Text variant="heading">
        Edit Matter
      </Text>
      <MatterForm onSubmit={onSubmit} defaultValues={matterData} />
    </div>
  );
};
