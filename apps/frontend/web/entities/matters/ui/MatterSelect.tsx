import { IMatter } from '@counselflow/types';
import { FC } from 'react';

import { APP_ROUTES } from '@/entities/api/routes';
import { useFetchMatter } from '@/entities/matters/hooks/useFetchMatter';
import InfiniteScrollList from '@/shared/ui/InfiniteScrollList';
import Label from '@/shared/ui/Label';

interface MatterSelectProps {
  field: any;
  label: string;
  placeholder: string;
  required?: boolean;
}
const MatterSelect: FC<MatterSelectProps> = ({
  field,
  label,
  placeholder,
  required,
}) => {
  const handleMatterSelect = (matter: IMatter) => {
    field.onChange(matter.id.toString());
  };

  const { data: matter } = useFetchMatter(field.value);

  return (
    <div>
      <Label htmlFor="matters" required={required} className="pb-2">
        {label}
      </Label>
      <InfiniteScrollList<IMatter>
        url={APP_ROUTES.MATTERS}
        queryKey={['matters']}
        placeholder={placeholder ?? 'Select manage-matters'}
        renderItem={(matter) => matter.name}
        onSelectItem={handleMatterSelect}
        initialSelectedValue={matter}
      />
    </div>
  );
};

export default MatterSelect;
