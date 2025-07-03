import { useState } from 'react';

import { useDashboardRisks } from '../model/useDashboardRisks';

import { Button } from '@/shared/ui'; // Assuming Button component exists in shared UI

const DashboardRisks = () => {
  const [page, setPage] = useState(1);
  const limit = 10; // Risks per page for dashboard

  const { data: risks, isLoading } = useDashboardRisks({ page, limit });

  // Function to determine background color based on score
  const getScoreColorClass = (score: number) => {
    if (score < 5) return 'bg-green-400'; // Green for scores below 5
    if (score <= 8) return 'bg-orange-400'; // Orange for scores between 5 and 8
    return 'bg-red-400'; // Red for scores above 8
  };

  return (
    <div className="rounded-lg overflow-hidden shadow bg-white border border-gray-300">
      <div className="p-4 border-b border-gray-300">
        <h2 className="text-xl font-bold uppercase text-teal-700">RISKS</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-300 border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-300">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-300">
                Matter
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-300">
                Score
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-300">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-300">
                Company
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-300">
            {isLoading && (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-4 border border-gray-200"
                >
                  Loading risks...
                </td>
              </tr>
            )}
            {!isLoading && (!risks || risks.data.length === 0) && (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-4 border border-gray-200"
                >
                  No risks found.
                </td>
              </tr>
            )}
            {!isLoading &&
              risks &&
              risks.data.map((risk) => {
                const companyName = risk.matter?.company?.name || '-';

                return (
                  <tr key={risk.id}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm border border-gray-200">
                      {risk.name}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm border border-gray-200">
                      {risk.matter?.name || '-'}
                    </td>
                    <td
                      className={`px-4 py-4 whitespace-nowrap text-sm text-center text-white ${getScoreColorClass(risk.score)} border border-gray-200`}
                    >
                      {risk.score}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm border border-gray-200">
                      {risk.category}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm border border-gray-200">
                      {companyName}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      {risks && risks.meta.totalItems > limit && (
        <div className="p-4 border-t border-gray-300 flex justify-between items-center">
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
              className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm disabled:opacity-50"
            >
              Previous
            </Button>
            <Button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= risks.meta.totalPages || !risks.links.next}
              className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm disabled:opacity-50"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardRisks;
