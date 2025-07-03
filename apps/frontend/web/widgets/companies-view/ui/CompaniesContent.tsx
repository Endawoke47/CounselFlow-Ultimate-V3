import { Link } from '@tanstack/react-router';

import { Button } from '@/shared/ui';
import Table from '@/shared/ui/Table/Table';
import { useFetchCompanies } from '@/widgets/companies-view/hooks/useFetchCompanies';
import { columns } from '@/widgets/companies-view/ui/tableColumns';

export const CompaniesContent = () => {
  const { data, isLoading, error } = useFetchCompanies();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading companies</div>;
  }

  return (
    <div className="p-10">
      <div className="flex justify-between items-center py-2">
        <div className="text-2xl pl-4">Companies</div>
        <Link to={'/addCompany'}>
          <Button className="border bg-blue-500 text-white rounded-md hover:bg-blue-200 px-10">
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
