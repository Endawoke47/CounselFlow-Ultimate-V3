import React from 'react';

import { MatterForm } from '@/entities/matters/ui/MatterForm';
import { useCreateMatter } from '@/features/manage-matter/hooks/useCreateMatter';
import { Text } from '@/shared/ui/Text';

export const CreateMatter = () => {
  const { mutateAsync: createMatter } = useCreateMatter();

  const onSubmit = async (data: any) => {
      await createMatter(data);
  };

  return (
    <div className="p-6 flex flex-col gap-6 justify-center">
      <Text variant="heading">
        Add New Matter
      </Text>
      <MatterForm onSubmit={onSubmit} />
    </div>
  );
};
