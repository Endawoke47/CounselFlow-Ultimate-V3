/**
 * CounselFlow Ultimate V3 - Optimized Lazy Component Loading
 * Enhanced lazy loading with preloading and error boundaries
 */

"use client";

import React, { Suspense, memo } from 'react';
import { createLazyComponent, useIntersectionObserver } from '@/lib/performance';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// =============================================================================
// LOADING SKELETONS
// =============================================================================

const TableSkeleton = memo(() => (
  <div className="space-y-3">
    <div className="flex justify-between items-center">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-8 w-24" />
    </div>
    <div className="border rounded-lg">
      <div className="p-4 border-b">
        <div className="flex space-x-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="p-4 border-b last:border-b-0">
          <div className="flex space-x-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      ))}
    </div>
  </div>
));
TableSkeleton.displayName = 'TableSkeleton';

const ChartSkeleton = memo(() => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-4 w-48" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-64 w-full" />
    </CardContent>
  </Card>
));
ChartSkeleton.displayName = 'ChartSkeleton';

const FormSkeleton = memo(() => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-10 w-full" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-24 w-full" />
    </div>
    <div className="flex space-x-4">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-20" />
    </div>
  </div>
));
FormSkeleton.displayName = 'FormSkeleton';

const DashboardSkeleton = memo(() => (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="h-8 w-8 rounded" />
            </div>
            <div className="mt-4">
              <Skeleton className="h-3 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartSkeleton />
      <ChartSkeleton />
    </div>

    {/* Table */}
    <TableSkeleton />
  </div>
));
DashboardSkeleton.displayName = 'DashboardSkeleton';

// =============================================================================
// LAZY COMPONENTS WITH PRELOADING
// =============================================================================

// Data Table Components
export const LazyAdvancedDataTable = createLazyComponent(
  () => import('@/components/data-table/advanced-data-table'),
  { preload: true, fallback: TableSkeleton }
);

// AI Components
export const LazyLegalChatbot = createLazyComponent(
  () => import('@/components/ai/legal-chatbot'),
  { preload: false }
);

// Dashboard Components
export const LazyDashboardCharts = createLazyComponent(
  () => import('@/app/(dashboard)/dashboard/components/charts'),
  { preload: true }
);

export const LazyContractsTable = createLazyComponent(
  () => import('@/app/(dashboard)/contracts/components/contracts-table'),
  { preload: false }
);

export const LazyMattersTable = createLazyComponent(
  () => import('@/app/(dashboard)/matters/components/matters-table'),
  { preload: false }
);

export const LazyClientsTable = createLazyComponent(
  () => import('@/app/(dashboard)/clients/components/clients-table'),
  { preload: false }
);

// AI Module Components
export const LazyContractAnalysis = createLazyComponent(
  () => import('@/app/(dashboard)/ai/contract-analysis/components/analysis-form'),
  { preload: false }
);

export const LazyDocumentGenerator = createLazyComponent(
  () => import('@/app/(dashboard)/ai/document-generator/components/generator-form'),
  { preload: false }
);

export const LazyAIOrchestrator = createLazyComponent(
  () => import('@/app/(dashboard)/ai/orchestrator/components/orchestrator-dashboard'),
  { preload: false }
);

// Legal Module Components
export const LazyIPManagement = createLazyComponent(
  () => import('@/app/(dashboard)/ip/components/ip-dashboard'),
  { preload: false }
);

export const LazyPrivacyAssessment = createLazyComponent(
  () => import('@/app/(dashboard)/privacy/components/pia-dashboard'),
  { preload: false }
);

export const LazyComplianceMonitor = createLazyComponent(
  () => import('@/app/(dashboard)/compliance/components/compliance-dashboard'),
  { preload: false }
);

export const LazyLitigationManagement = createLazyComponent(
  () => import('@/app/(dashboard)/litigation/components/litigation-dashboard'),
  { preload: false }
);

// Admin Components
export const LazyUserManagement = createLazyComponent(
  () => import('@/app/(dashboard)/admin/users/components/user-management'),
  { preload: false }
);

// =============================================================================
// ENHANCED LAZY WRAPPER WITH INTERSECTION OBSERVER
// =============================================================================

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ComponentType;
  rootMargin?: string;
  threshold?: number;
}

export const LazyWrapper = memo<LazyWrapperProps>(({ 
  children, 
  fallback: Fallback = () => <div>Loading...</div>,
  rootMargin = '50px',
  threshold = 0.1 
}) => {
  const elementRef = React.useRef<HTMLDivElement>(null);
  const { isIntersecting } = useIntersectionObserver(elementRef, {
    rootMargin,
    threshold,
  });

  return (
    <div ref={elementRef}>
      {isIntersecting ? (
        <Suspense fallback={<Fallback />}>
          {children}
        </Suspense>
      ) : (
        <Fallback />
      )}
    </div>
  );
});
LazyWrapper.displayName = 'LazyWrapper';

// =============================================================================
// ROUTE-BASED LAZY LOADING
// =============================================================================

interface LazyRouteProps {
  component: React.LazyExoticComponent<any>;
  skeleton?: React.ComponentType;
  preload?: boolean;
}

export const LazyRoute = memo<LazyRouteProps>(({ 
  component: Component, 
  skeleton: Skeleton = DashboardSkeleton,
  preload = false 
}) => {
  return (
    <Suspense fallback={<Skeleton />}>
      <Component />
    </Suspense>
  );
});
LazyRoute.displayName = 'LazyRoute';

// =============================================================================
// PERFORMANCE OPTIMIZED COMPONENT WRAPPER
// =============================================================================

interface PerformantComponentProps {
  children: React.ReactNode;
  shouldRender?: boolean;
  renderThreshold?: number;
}

export const PerformantComponent = memo<PerformantComponentProps>(({ 
  children, 
  shouldRender = true,
  renderThreshold = 1000 
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    if (shouldRender) {
      // Delay rendering for better perceived performance
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, Math.min(renderThreshold, 100));
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [shouldRender, renderThreshold]);

  if (!shouldRender || !isVisible) {
    return null;
  }

  return <>{children}</>;
});
PerformantComponent.displayName = 'PerformantComponent';

// =============================================================================
// EXPORTS
// =============================================================================

export const LoadingSkeletons = {
  Table: TableSkeleton,
  Chart: ChartSkeleton,
  Form: FormSkeleton,
  Dashboard: DashboardSkeleton,
};

export default {
  LazyAdvancedDataTable,
  LazyLegalChatbot,
  LazyDashboardCharts,
  LazyContractsTable,
  LazyMattersTable,
  LazyClientsTable,
  LazyContractAnalysis,
  LazyDocumentGenerator,
  LazyAIOrchestrator,
  LazyIPManagement,
  LazyPrivacyAssessment,
  LazyComplianceMonitor,
  LazyLitigationManagement,
  LazyUserManagement,
  LazyWrapper,
  LazyRoute,
  PerformantComponent,
  LoadingSkeletons,
};