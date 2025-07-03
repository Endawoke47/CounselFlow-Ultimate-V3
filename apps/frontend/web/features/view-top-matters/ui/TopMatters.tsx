import { useTopMatters } from '../model/useTopMatters';
import { MatterDrawer } from '@/widgets/matter-drawer/ui';
import { useState } from 'react';
import Drawer from '@/shared/ui/Drawer/Drawer';

const TopMatters = () => {
  const { data: matters, isLoading } = useTopMatters();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string>();

  const handleRowClick = (id: string) => {
    setSelectedId(id);
    setIsDrawerOpen(true);
  }

  return (
    <div className="rounded-lg overflow-hidden shadow bg-white border border-gray-300">
      <div className="p-4 border-b border-gray-300">
        <h2 className="text-xl font-bold uppercase text-teal-700">MATTERS</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-300 border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-300">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-300 w-32">
                No. of risks
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-300">
            {isLoading && (
              <tr>
                <td
                  colSpan={2}
                  className="text-center py-4 border border-gray-200"
                >
                  Loading matters...
                </td>
              </tr>
            )}
            {!isLoading && (!matters || matters.length === 0) && (
              <tr>
                <td
                  colSpan={2}
                  className="text-center py-4 border border-gray-200"
                >
                  No matters found.
                </td>
              </tr>
            )}
            {!isLoading &&
              matters &&
              matters.map((matter) => (
                <tr key={matter.id} onClick={() => handleRowClick(matter.id as unknown as string)}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm border border-gray-200">
                    {matter.name}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-center border border-gray-200 w-32">
                    {matter.numberOfRisks}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <Drawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          className="min-w-[700px]"
        >
          <MatterDrawer id={selectedId}/>
        </Drawer>
      </div>
    </div>
  );
};

export default TopMatters;
