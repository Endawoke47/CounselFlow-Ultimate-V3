import { Link } from '@tanstack/react-router';

import { columns } from './tableColumns';
import { useFetchActions } from '../hooks/useFetchActions';

import { Button } from '@/shared/ui';
import Table from '@/shared/ui/Table/Table';

export const ActionsContent = () => {
  const { data, isLoading, error } = useFetchActions();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading actions</div>;
  }

  return (
    <div className="p-10">
      <div className="flex justify-between items-center py-2">
        <div className="text-2xl pl-4">Actions</div>
        <Link to={'/addAction'}>
          <Button className="px-10" variant="outline">
            Add
          </Button>
        </Link>
      </div>
      <Table
        columns={columns}
        rowData={data?.data ?? []}
        rowSelection="multiple"
      />
    </div>
  );
};
