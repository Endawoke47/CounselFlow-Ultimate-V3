import { Link } from '@tanstack/react-router';

import { Button } from '@/shared/ui';
import Table from '@/shared/ui/Table/Table';
import { columns } from '@/widgets/disputes-view/ui/tableColumns';
import { useFetchDisputes } from '@/widgets/disputes-view/hooks/useFetchDisputes';

export const DisputesContent = () => {
  const { data, isLoading, error } = useFetchDisputes();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading disputes</div>;
  }

  return (
    <div className="p-10">
      <div className="flex justify-between items-center py-2">
        <div className="text-2xl pl-4">Dispute Resolutions</div>
        <Link to={'/addDispute'}>
          <Button variant="outline" className="px-10">
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
