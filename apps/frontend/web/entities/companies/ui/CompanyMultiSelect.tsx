
import { ICompany } from '@counselflow/types';
import { FC } from 'react';
import { ControllerRenderProps } from 'react-hook-form';

import { APP_ROUTES } from '@/entities/api/routes';
import InfiniteScrollMultiSelect from '@/shared/ui/InfiniteScrollMultiSelect';

interface CompanyMultiSelectProps<TFormValues extends Record<any, any>> {
  field: ControllerRenderProps<TFormValues, any>;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export const CompanyMultiSelect: FC<CompanyMultiSelectProps<any>> = ({
  field,
  label = 'Companies',
  placeholder = 'Find/Add Companies',
  required,
  className,
}) => {
  return (
    <InfiniteScrollMultiSelect<Omit<ICompany, 'id'> & { id: string }>
      label={label}
      placeholder={placeholder}
      queryKey="categories"
      url={APP_ROUTES.COMPANIES}
      selectedValues={(field.value as string[]) ?? []}
      onChange={field.onChange}
      hasSearch
      required={required}
      className={className}
    />
  );
};
