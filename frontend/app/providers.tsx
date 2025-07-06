"use client";

import React, { useMemo, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import { PerformanceMonitor, useWebVitals } from "@/lib/performance";
import { createApiIntegration } from "@/lib/api-integration";

// Optimized QueryClient with enhanced caching and performance
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        retry: (failureCount, error: any) => {
          // Don't retry on 4xx errors (client errors)
          if (error?.status >= 400 && error?.status < 500) {
            return false;
          }
          // Retry up to 3 times for network errors
          return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        retry: 1,
        retryDelay: 1000,
        onError: (error: any) => {
          // Global error handling for mutations
          console.error('Mutation error:', error);
        },
      },
    },
  });
}

// API Integration Provider
function ApiProvider({ 
  children, 
  queryClient 
}: { 
  children: React.ReactNode;
  queryClient: QueryClient;
}) {
  useEffect(() => {
    // Initialize API integration service
    createApiIntegration(queryClient);
    
    // Set up global error handling
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      // Log to external service in production
      if (process.env.NODE_ENV === 'production') {
        // Send to error tracking service
      }
    };

    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      
      // Log to external service in production
      if (process.env.NODE_ENV === 'production') {
        // Send to error tracking service
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, [queryClient]);

  return <>{children}</>;
}

// Performance monitoring component
function PerformanceProvider({ children }: { children: React.ReactNode }) {
  // Initialize performance monitoring
  const performanceMonitor = useMemo(() => {
    if (typeof window !== "undefined") {
      return PerformanceMonitor.getInstance();
    }
    return null;
  }, []);

  // Web Vitals monitoring
  useWebVitals((metric) => {
    // Log metrics in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[Web Vitals] ${metric.name}: ${metric.value} (${metric.rating})`);
    }

    // In production, send to analytics service
    if (process.env.NODE_ENV === "production") {
      // Analytics service integration would go here
      // gtag('event', metric.name, {
      //   custom_map: { metric_value: 'value' },
      //   value: Math.round(metric.value),
      //   metric_id: metric.id,
      //   metric_rating: metric.rating,
      // });
    }
  });

  return <>{children}</>;
}

// Error Boundary for API errors
class ApiErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('API Error Boundary caught an error:', error, errorInfo);
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Send to error tracking service
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center p-6">
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  // Memoize QueryClient to prevent recreation on re-renders
  const queryClient = useMemo(() => createQueryClient(), []);

  return (
    <ApiErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ApiProvider queryClient={queryClient}>
          <PerformanceProvider>
            {children}
            
            {/* Optimized Toaster with reduced animations for better performance */}
            <Toaster 
              richColors 
              position="top-right"
              duration={4000}
              visibleToasts={3}
              closeButton
              theme="system"
              // Reduce animations on slower devices
              style={{
                animationDuration: typeof window !== "undefined" && 
                  window.matchMedia('(prefers-reduced-motion: reduce)').matches 
                    ? '0.1s' 
                    : '0.3s'
              }}
            />
            
            {/* React Query Devtools - only in development */}
            {process.env.NODE_ENV === 'development' && (
              <ReactQueryDevtools 
                initialIsOpen={false}
                position="bottom-right"
              />
            )}
          </PerformanceProvider>
        </ApiProvider>
      </QueryClientProvider>
    </ApiErrorBoundary>
  );
}