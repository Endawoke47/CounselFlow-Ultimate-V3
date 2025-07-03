import { ActionForm } from '@/entities/actions/ui/ActionForm';
import { useCreateAction } from '@/features/manage-actions/hooks/useCreateAction';
import { Text } from '@/shared/ui/Text';

export const CreateAction = () => {
  const { mutateAsync: createAction } = useCreateAction();

  const onSubmit = async (data: any) => {
    await createAction(data);
  };

  return (
    <div className="p-6 flex flex-col gap-6 justify-center">
      <Text variant="heading">Add New Action</Text>
      <ActionForm onSubmit={onSubmit} />
    </div>
  );
};
