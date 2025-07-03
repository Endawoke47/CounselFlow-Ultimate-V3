// Optimized Contracts Dashboard with performance improvements
import React, { useState, useCallback, useMemo, memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Contract, ContractStatus, Priority, ApiResponse } from "@/types/core";
import { withLazyLoading, LazyIntersectionLoader } from "@/components/performance/LazyLoader";
import { apiService } from "@/lib/api";
import ErrorBoundary from "@/components/error/ErrorBoundary";

// Lazy load heavy components
const ContractsOverview = withLazyLoading(
  () => import("./ContractsOverview"),
  "Loading overview..."
);

const ContractsList = withLazyLoading(
  () => import("./ContractsList"),
  "Loading contracts list..."
);

const AlertManagement = withLazyLoading(
  () => import("./AlertManagement"),
  "Loading alert management..."
);

const TaskManagement = withLazyLoading(
  () => import("./TaskManagement"),
  "Loading task management..."
);

const NotificationsCenter = withLazyLoading(
  () => import("./NotificationsCenter"),
  "Loading notifications..."
);

const AddContractModal = withLazyLoading(
  () => import("./AddContractModal"),
  "Loading form..."
);

const ContractDetailModal = withLazyLoading(
  () => import("./ContractDetailModal"),
  "Loading contract details..."
);

// Props interfaces
interface ContractsDashboardProps {
  initialContracts?: Contract[];
  defaultTab?: string;
  onContractSelect?: (contract: Contract) => void;
}

interface ContractStatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
}

interface QuickActionButtonProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

// Memoized components for performance
const ContractStatsCard = memo<ContractStatsCardProps>(({ 
  title, 
  value, 
  change, 
  trend = 'neutral',
  icon 
}) => {
  const trendColor = useMemo(() => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }, [trend]);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={`text-xs ${trendColor}`}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
});

ContractStatsCard.displayName = 'ContractStatsCard';

const QuickActionButton = memo<QuickActionButtonProps>(({ 
  title, 
  description, 
  icon, 
  onClick,
  variant = 'secondary'
}) => {
  const buttonClasses = useMemo(() => {
    const base = "h-auto p-4 flex items-start space-x-3 hover:shadow-md transition-all";
    return variant === 'primary' 
      ? `${base} bg-blue-50 hover:bg-blue-100 border-blue-200`
      : `${base} bg-gray-50 hover:bg-gray-100`;
  }, [variant]);

  return (
    <Button
      variant="outline"
      className={buttonClasses}
      onClick={onClick}
    >
      <div className="flex-shrink-0">{icon}</div>
      <div className="text-left">
        <div className="font-medium">{title}</div>
        <div className="text-sm text-muted-foreground">{description}</div>
      </div>
    </Button>
  );
});

QuickActionButton.displayName = 'QuickActionButton';

// Main dashboard component
export const OptimizedContractsDashboard = memo<ContractsDashboardProps>(({ 
  initialContracts = [],
  defaultTab = "overview",
  onContractSelect
}) => {
  // State management
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoized calculations
  const contractStats = useMemo(() => {
    const total = contracts.length;
    const active = contracts.filter(c => c.status === ContractStatus.ACTIVE).length;
    const expiring = contracts.filter(c => c.status === ContractStatus.EXPIRED).length;
    const pending = contracts.filter(c => c.status === ContractStatus.PENDING_SIGNATURE).length;
    const totalValue = contracts.reduce((sum, c) => sum + (c.value || 0), 0);

    return {
      total,
      active,
      expiring,
      pending,
      totalValue: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
      }).format(totalValue)
    };
  }, [contracts]);

  // Optimized event handlers with useCallback
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  const handleContractAdd = useCallback(() => {
    setShowAddModal(true);
  }, []);

  const handleContractSelect = useCallback((contract: Contract) => {
    setSelectedContract(contract);
    setShowDetailModal(true);
    onContractSelect?.(contract);
  }, [onContractSelect]);

  const handleAddModalClose = useCallback(() => {
    setShowAddModal(false);
  }, []);

  const handleDetailModalClose = useCallback(() => {
    setShowDetailModal(false);
    setSelectedContract(null);
  }, []);

  const handleContractSave = useCallback(async (contractData: Partial<Contract>) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.contracts.create(contractData);
      if (response.success && response.data) {
        setContracts(prev => [...prev, response.data]);
        setShowAddModal(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save contract');
    } finally {
      setLoading(false);
    }
  }, []);

  const quickActions = useMemo(() => [
    {
      title: "New Contract",
      description: "Create a new contract from template",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      onClick: handleContractAdd,
      variant: 'primary' as const
    },
    {
      title: "Upload Document",
      description: "Upload existing contract documents",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      onClick: () => console.log('Upload clicked'),
      variant: 'secondary' as const
    },
    {
      title: "Generate Report",
      description: "Create contracts analysis report",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      onClick: () => console.log('Report clicked'),
      variant: 'secondary' as const
    }
  ], [handleContractAdd]);

  return (
    <ErrorBoundary>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Contract Management</h1>
            <p className="text-muted-foreground">
              Manage and track all your legal contracts efficiently
            </p>
          </div>
          <Button onClick={handleContractAdd} size="lg">
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Contract
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <ContractStatsCard
            title="Total Contracts"
            value={contractStats.total}
            change="+12% from last month"
            trend="up"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
          <ContractStatsCard
            title="Active Contracts"
            value={contractStats.active}
            change="+2 this week"
            trend="up"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <ContractStatsCard
            title="Expiring Soon"
            value={contractStats.expiring}
            change="Requires attention"
            trend="down"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <ContractStatsCard
            title="Total Value"
            value={contractStats.totalValue}
            change="+8.2% from last quarter"
            trend="up"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            }
          />
        </div>

        {/* Quick Actions */}
        <LazyIntersectionLoader
          fallback={<div className="h-32 bg-gray-100 rounded-lg animate-pulse" />}
        >
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common contract management tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {quickActions.map((action, index) => (
                  <QuickActionButton
                    key={index}
                    title={action.title}
                    description={action.description}
                    icon={action.icon}
                    onClick={action.onClick}
                    variant={action.variant}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </LazyIntersectionLoader>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <ContractsOverview 
              contracts={contracts}
              onContractSelect={handleContractSelect}
            />
          </TabsContent>

          <TabsContent value="contracts" className="space-y-4">
            <ContractsList 
              contracts={contracts}
              onContractSelect={handleContractSelect}
              loading={loading}
              error={error}
            />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <AlertManagement contracts={contracts} />
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <TaskManagement contracts={contracts} />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <NotificationsCenter />
          </TabsContent>
        </Tabs>

        {/* Modals */}
        {showAddModal && (
          <AddContractModal
            isOpen={showAddModal}
            onClose={handleAddModalClose}
            onSave={handleContractSave}
            loading={loading}
          />
        )}

        {showDetailModal && selectedContract && (
          <ContractDetailModal
            isOpen={showDetailModal}
            onClose={handleDetailModalClose}
            contract={selectedContract}
          />
        )}

        {/* Error Display */}
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <span className="block sm:inline">{error}</span>
            <button
              className="ml-2 text-red-500 hover:text-red-700"
              onClick={() => setError(null)}
            >
              ×
            </button>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
});

OptimizedContractsDashboard.displayName = 'OptimizedContractsDashboard';

export default OptimizedContractsDashboard;