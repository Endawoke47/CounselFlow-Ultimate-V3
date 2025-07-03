import { Link } from '@tanstack/react-router';
import { ChevronDown, ChevronUp, Eye, Pencil, Trash2Icon } from 'lucide-react';
import { useState } from 'react';

import { useDeleteRisk, useFetchRisks } from '@/entities/risks/hooks';
import { Button } from '@/shared/ui';

type SortableField =
  | 'id'
  | 'name'
  | 'category'
  | 'status'
  | 'priority'
  | 'tolerance'
  | 'mitigationStatus';

export default function RiskList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortableField>('id');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [limit] = useState(20); // Default limit per page

  const {
    data: risks,
    isLoading,
    refetch,
  } = useFetchRisks({
    page,
    search,
    sortBy: [[sortField, sortOrder]],
    limit,
  });
  const deleteRiskMutation = useDeleteRisk();

  const handleSort = (field: SortableField) => {
    if (sortField === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      // Set new sort field and default to ascending
      setSortField(field);
      setSortOrder('ASC');
    }
  };

  const getSortIcon = (field: SortableField) => {
    if (sortField !== field) {
      return null;
    }
    return sortOrder === 'ASC' ? (
      <ChevronUp size={14} className="inline ml-1" />
    ) : (
      <ChevronDown size={14} className="inline ml-1" />
    );
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this risk?')) return;
    try {
      await deleteRiskMutation.mutateAsync(id);
      refetch();
    } catch (error) {
      alert('Failed to delete risk.');
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Risks</h1>
        <Link to="/risks/create">
          <Button className="bg-blue-500 text-white px-4 py-2 rounded">
            Create New Risk
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search risks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {isLoading ? (
        <div className="text-center text-xl">Loading risks...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('id')}
                >
                  ID {getSortIcon('id')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  Name {getSortIcon('name')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('category')}
                >
                  Category {getSortIcon('category')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  Status {getSortIcon('status')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('priority')}
                >
                  Priority {getSortIcon('priority')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('tolerance')}
                >
                  Tolerance {getSortIcon('tolerance')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('mitigationStatus')}
                >
                  Mitigation Status {getSortIcon('mitigationStatus')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created By ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {risks?.data.map((risk) => (
                <tr key={risk.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{risk.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {risk.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{risk.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className="text-sm text-gray-500 max-w-[300px] truncate"
                      title={risk.description}
                    >
                      {risk.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {risk.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      {risk.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {risk.tolerance}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {risk.mitigationStatus}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {/* createdBy is not present in TRiskResponse; add to API/type if needed */}
                    <div className="text-sm text-gray-500">N/A</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-4">
                      <Link to={`/risks/${risk.id}/edit`}>
                        <Pencil size={16} color="green" />
                      </Link>
                      <Link to={`/risks/${risk.id}`}>
                        <Eye size={16} color="blue" />
                      </Link>
                      <button
                        onClick={() => handleDelete(risk.id)}
                        disabled={deleteRiskMutation.isPending}
                        className="cursor-pointer disabled:opacity-50"
                      >
                        <Trash2Icon size={16} color="red" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {risks && risks.meta.totalItems > 0 && (
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Showing {(risks.meta.currentPage - 1) * risks.meta.itemsPerPage + 1}{' '}
            to{' '}
            {Math.min(
              risks.meta.currentPage * risks.meta.itemsPerPage,
              risks.meta.totalItems
            )}{' '}
            of {risks.meta.totalItems} results
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || !risks.links.previous}
              className="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Previous
            </Button>
            <Button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= risks.meta.totalPages || !risks.links.next}
              className="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
