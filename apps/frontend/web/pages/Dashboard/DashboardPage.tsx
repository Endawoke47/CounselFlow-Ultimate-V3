import React, { useState } from 'react';

import { DashboardRisks } from '@/features/view-dashboard-risks';
import { KPIs } from '@/features/view-kpis';
import { TopMatters } from '@/features/view-top-matters';
import { CriticalRiskHeatmap } from '@/widgets/critical-risk-heatmap/CriticalRiskHeatmap';
import Layout from '@/widgets/layout/Layout';

export const DashboardPage: React.FC = () => {
  const [showHeatmap, setShowHeatmap] = useState(false);

  return (
    <Layout>
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center cursor-pointer">
              <span
                className={`mr-3 text-sm font-medium ${!showHeatmap ? 'text-teal-700' : 'text-gray-500'}`}
              >
                Risks Table
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={showHeatmap}
                  onChange={() => setShowHeatmap(!showHeatmap)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
              </div>
              <span
                className={`ml-3 text-sm font-medium ${showHeatmap ? 'text-teal-700' : 'text-gray-500'}`}
              >
                Risk Heatmap
              </span>
            </label>
          </div>
          <h1 className="text-4xl font-bold text-teal-700">DASHBOARD</h1>
        </div>
        <div className="flex flex-col gap-8">
          {/* Conditional rendering of either Risks Table or Heatmap */}
          {showHeatmap ? <CriticalRiskHeatmap /> : <DashboardRisks />}

          {/* Matters and KPIs - Side by Side Below */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <TopMatters />
            <KPIs />
          </div>
        </div>
      </div>
    </Layout>
  );
};
