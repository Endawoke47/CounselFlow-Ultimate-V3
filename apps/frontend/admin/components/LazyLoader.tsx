import React, { Suspense, lazy, ComponentType } from 'react';
import { LoadingState } from '@/types/core';

// Loading spinner component
const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-2 text-sm text-gray-600">{message}</p>
    </div>
  </div>
);

// Error fallback component
const ErrorFallback: React.FC<{ error?: Error; retry?: () => void }> = ({ 
  error, 
  retry 
}) => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="text-center max-w-md p-6">
      <div className="text-red-500 mb-4">
        <svg 
          className="h-12 w-12 mx-auto" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Failed to load component
      </h3>
      <p className="text-gray-600 mb-4">
        {error?.message || 'An error occurred while loading the component.'}
      </p>
      {retry && (
        <button
          onClick={retry}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Try Again
        </button>
      )}
    </div>
  </div>
);

// HOC for lazy loading with retry capability
export function withLazyLoading<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  loadingMessage?: string
) {
  const LazyComponent = lazy(importFunc);

  return React.memo<P>((props) => {
    const [retryCount, setRetryCount] = React.useState(0);

    const retry = React.useCallback(() => {
      setRetryCount(prev => prev + 1);
    }, []);

    return (
      <Suspense 
        key={retryCount} // Force re-mount on retry
        fallback={<LoadingSpinner message={loadingMessage} />}
      >
        <React.Suspense fallback={<LoadingSpinner message={loadingMessage} />}>
          <LazyComponent {...props} />
        </React.Suspense>
      </Suspense>
    );
  });
}

// Utility for preloading components
export const preloadComponent = (
  importFunc: () => Promise<{ default: ComponentType<any> }>
): void => {
  importFunc().catch(() => {
    // Ignore preload errors
  });
};

// Hook for lazy loading with state management
export const useLazyLoad = <T,>(
  loadFunc: () => Promise<T>,
  dependencies: React.DependencyList = []
): LoadingState & { data: T | null; error: string | null; retry: () => void } => {
  const [state, setState] = React.useState<{
    data: T | null;
    loading: boolean;
    error: string | null;
  }>({
    data: null,
    loading: false,
    error: null
  });

  const [retryCount, setRetryCount] = React.useState(0);

  const retry = React.useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        const result = await loadFunc();
        if (!cancelled) {
          setState({
            data: result,
            loading: false,
            error: null
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to load'
          });
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [...dependencies, retryCount]);

  return {
    ...state,
    isLoading: state.loading,
    retry
  };
};

// Component for lazy loading with intersection observer
export const LazyIntersectionLoader: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
  once?: boolean;
}> = ({
  children,
  fallback = <LoadingSpinner />,
  rootMargin = '50px',
  threshold = 0.1,
  once = true
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [hasLoaded, setHasLoaded] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            setHasLoaded(true);
            observer.disconnect();
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        rootMargin,
        threshold
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [rootMargin, threshold, once]);

  return (
    <div ref={ref}>
      {(isVisible || hasLoaded) ? children : fallback}
    </div>
  );
};

export default withLazyLoading;