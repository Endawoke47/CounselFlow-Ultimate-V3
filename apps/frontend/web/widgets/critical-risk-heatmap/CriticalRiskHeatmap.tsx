import React, { useState } from 'react';

import { useCriticalRiskHeatmapData } from '@/features/view-critical-risk-heatmap';

const SEVERITY_COLORS: Record<string, string> = {
  Low: 'bg-blue-400 text-white',
  Moderate: 'bg-green-400 text-white',
  High: 'bg-yellow-400 text-gray-900',
  Critical: 'bg-orange-400 text-white',
};

const SEVERITY_LABELS = [
  { label: 'Low', color: 'bg-blue-400' },
  { label: 'Moderate', color: 'bg-green-400' },
  { label: 'High', color: 'bg-yellow-400' },
  { label: 'Critical', color: 'bg-orange-400' },
];

export const CriticalRiskHeatmap: React.FC = () => {
  const { data, isLoading, error } = useCriticalRiskHeatmapData();
  const [tooltip, setTooltip] = useState<null | {
    x: number;
    y: number;
    content: string;
  }>();

  if (isLoading) {
    return <div>Loading heatmap...</div>;
  }

  if (error) {
    return <div className="text-red-500">Failed to load heatmap.</div>;
  }

  const { subsidiaries, riskTypes, heatmapData } = data;

  // Helper to get cell data
  const getCell = (subsidiary: any, riskType: string) =>
    heatmapData.find(
      (d: any) => d.subsidiaryId === subsidiary.id && d.riskType === riskType
    );

  return (
    <div className="w-fit bg-white rounded-lg shadow p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
        <h3 className="text-2xl font-bold">Critical Risk Heatmap</h3>
        {/* Filters can be added here */}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-max border-separate border-spacing-2">
          <thead>
            <tr>
              <th className="text-left px-2 py-1"></th>
              {riskTypes.map((riskType: string) => (
                <th
                  key={riskType}
                  className="text-center px-2 py-1 text-base font-semibold"
                >
                  {riskType}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {subsidiaries.map((subsidiary: any, rowIdx: number) => (
              <tr key={subsidiary.id}>
                <td className="text-right pr-4 font-medium text-base whitespace-nowrap">
                  {subsidiary.name}
                </td>
                {riskTypes.map((riskType: string, colIdx: number) => {
                  const cell = getCell(subsidiary, riskType);
                  const severity = cell?.severityCounts?.highestSeverity;
                  return (
                    <td key={riskType} className="px-2 py-1">
                      {severity ? (
                        <div
                          className={`w-16 h-12 rounded transition-colors duration-200 flex items-center justify-center cursor-pointer ${SEVERITY_COLORS[severity]}`}
                          onMouseEnter={(e) => {
                            const rect = (
                              e.target as HTMLElement
                            ).getBoundingClientRect();
                            setTooltip({
                              x: rect.left + rect.width / 2,
                              y: rect.top,
                              content: `${subsidiary.name}\n${riskType}\n${severity}`,
                            });
                          }}
                          onMouseLeave={() => setTooltip(null)}
                        />
                      ) : (
                        <div className="w-16 h-12 rounded bg-gray-200" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {/* Tooltip */}
        {tooltip && (
          <div
            className="fixed z-50 px-4 py-2 bg-white rounded shadow-lg border text-sm whitespace-pre-line pointer-events-none"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            {tooltip.content.split('\n').map((line, i) => (
              <div key={i} className={i === 2 ? 'font-bold' : ''}>
                {line}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-6 mt-6">
        {SEVERITY_LABELS.map(({ label, color }) => (
          <div key={label} className="flex items-center gap-2">
            <span className={`inline-block w-4 h-4 rounded ${color}`} />
            <span className="text-sm">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CriticalRiskHeatmap;
