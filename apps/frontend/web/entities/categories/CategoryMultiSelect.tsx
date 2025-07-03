import { FC } from 'react';

import { APP_ROUTES } from '@/entities/api/routes';
import {
  Category,
  CategoryMultiSelectProps,
} from '@/entities/categories/model/type';
import InfiniteScrollMultiSelect from '@/shared/ui/InfiniteScrollMultiSelect';

const CategoryMultiSelect: FC<CategoryMultiSelectProps<any>> = ({
  field,
  required,
  className,
}) => {
  return (
    <InfiniteScrollMultiSelect<Category>
      label="Categories"
      placeholder="Find/Add Categories"
      queryKey="categories"
      url={APP_ROUTES.CATEGORIES}
      selectedValues={(field.value as string[]) ?? []}
      onChange={field.onChange}
      hasSearch
      required={required}
      className={className}
    />
  );
};

export default CategoryMultiSelect;
