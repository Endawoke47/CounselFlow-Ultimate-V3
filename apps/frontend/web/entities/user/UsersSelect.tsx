import { IUser } from '1pd-types';
import { FC } from 'react';

import { APP_ROUTES } from '@/entities/api/routes';
import InfiniteScrollList from '@/shared/ui/InfiniteScrollList';
import Label from '@/shared/ui/Label';


interface UsersSelectProps {
  field: any;
  label: string;
  placeholder: string;
  required?: boolean;
}

const UsersSelect: FC<UsersSelectProps> = ({
  field,
  label,
  placeholder,
  required,
}) => {
  const handleUsersSelect = (user: IUser) => {
    field.onChange(user.id.toString());
  };

  return (
    <div>
      <Label htmlFor="users" required={required} className="pb-2">
        {label}
      </Label>
      <InfiniteScrollList<IUser>
        url={APP_ROUTES.USERS}
        queryKey={['users']}
        placeholder={placeholder}
        renderItem={(user) => user.middleName}
        onSelectItem={handleUsersSelect}
      />
    </div>
  );
};

export default UsersSelect;
