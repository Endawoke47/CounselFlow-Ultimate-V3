import { CompanyForm } from '@/entities/companies/ui/CompanyForm';
import { useCreateCompany } from '@/features/manage-companies/hooks/useCreateCompany';
import { Text } from '@/shared/ui/Text';

export const CreateCompany = () => {
  const { mutateAsync: createCompany } = useCreateCompany();

  const onSubmit = async (data: any) => {
    await createCompany({ ...data, type: 'ADMIN', countryId: 6, accountId: 3 });
  };

  return (
    <div className="p-6 flex flex-col gap-6 justify-center">
      <Text variant="heading">Add New Company</Text>
      <CompanyForm onSubmit={onSubmit} />
    </div>
  );
};
