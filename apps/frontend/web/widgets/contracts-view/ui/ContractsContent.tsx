import { Link } from '@tanstack/react-router';

import { Button } from '@/shared/ui';
import Table from '@/shared/ui/Table/Table';
import { useFetchContracts } from '@/widgets/contracts-view/hooks/useFetchContracts';
import { columns } from '@/widgets/contracts-view/ui/tableColumns';

export const ContractsContent = () => {
  const { data, isLoading, error } = useFetchContracts();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading contracts</div>;
  }

  return (
    <div className="p-10">
      <div className="flex justify-between items-center py-2">
        <div className="text-2xl pl-4">Contracts</div>
        <Link to={'/addContract'}>
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
