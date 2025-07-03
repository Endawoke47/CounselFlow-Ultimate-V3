import { Text } from '@/shared/ui/Text';
import { useCreateDispute } from '@/features/manage-disputes/hooks/useCreateDispute';
import { DisputeForm } from '@/entities/disputes/ui/DisputeForm';

export const CreateDispute = () => {
  const { mutateAsync: createDispute } = useCreateDispute();

  const onSubmit = async (data: any) => {
    await createDispute({
      ...data,
      type: "Litigation",
      status: "Pre-Filing",
      parties: [
        {
          "companyId": "10",
          "role": "Defendant",
        }
      ],
    });
  };

  return (
    <div className="p-6 flex flex-col gap-6 justify-center">
      <Text variant="heading">Add New Dispute Resolution</Text>
      <DisputeForm onSubmit={onSubmit} />
    </div>
  );
};
