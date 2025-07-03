import { useFetchKpis } from '../model/useFetchKpis';

const KPIs = () => {
  const { data: kpis, isLoading } = useFetchKpis();

  if (isLoading) {
    return <div className="text-center py-4">Loading KPIs...</div>;
  }

  if (!kpis) {
    return <div className="text-center py-4">No data available.</div>;
  }

  return (
    <div className="rounded-lg overflow-hidden shadow bg-white border border-gray-300">
      <div className="p-4 border-b border-gray-300">
        <h2 className="text-xl font-bold uppercase text-teal-700">KPIs</h2>
      </div>
      <div className="p-6 grid grid-cols-2 gap-6">
        {isLoading && (
          <div className="col-span-2 text-center py-4">Loading KPIs...</div>
        )}
        {!isLoading && !kpis && (
          <div className="col-span-2 text-center py-4">No data available.</div>
        )}
        {!isLoading && kpis && (
          <>
            <div className="text-center p-4 border-r border-gray-200">
              <h3 className="text-gray-500 text-sm font-medium mb-2">
                Risks this month
              </h3>
              <p className="text-3xl font-bold">{kpis.newRisksThisMonth}</p>
            </div>
            <div className="text-center p-4">
              <h3 className="text-gray-500 text-sm font-medium mb-2">
                No of pending tasks
              </h3>
              <p className="text-3xl font-bold">{kpis.pendingRiskActions}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default KPIs;
