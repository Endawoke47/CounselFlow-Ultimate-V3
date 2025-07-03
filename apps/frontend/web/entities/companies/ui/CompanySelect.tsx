import { ICompany } from '1pd-types/src/companies';
import { FC } from 'react';
import { ControllerRenderProps } from 'react-hook-form';

import { APP_ROUTES } from '@/entities/api/routes';
import { useFetchCompany } from '@/entities/companies/hooks/useFetchCompany';
import InfiniteScrollList from '@/shared/ui/InfiniteScrollList';
import Label from '@/shared/ui/Label';

interface CompanySelectProps {
  field: ControllerRenderProps<any, any>;
  label: string;
  placeholder: string;
  required?: boolean;
}

export const CompanySelect: FC<CompanySelectProps> = ({
  field,
  label,
  placeholder,
  required,
}) => {
  const handleCompanySelect = (company: ICompany) => {
    field.onChange(company.id.toString());
  };

  const { data: company } = useFetchCompany(field.value);

  return (
    <div>
      <Label htmlFor="companies" required={required} className="pb-2">
        {label}
      </Label>
      <InfiniteScrollList<ICompany>
        url={APP_ROUTES.COMPANIES}
        queryKey={['companies']}
        placeholder={placeholder}
        renderItem={(company) => company.name}
        onSelectItem={handleCompanySelect}
        initialSelectedValue={company}
      />
    </div>
  );
};
