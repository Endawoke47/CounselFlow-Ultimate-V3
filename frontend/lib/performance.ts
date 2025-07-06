/**
 * CounselFlow Ultimate V3 - Frontend Performance Optimization Utilities
 * Enhanced performance monitoring and optimization tools
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// =============================================================================
// PERFORMANCE MONITORING
// =============================================================================

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  bundleSize: number;
  memoryUsage: number;
  timestamp: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private observers: PerformanceObserver[] = [];

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers();
    }
  }

  private initializeObservers() {
    // Observe navigation timing
    if ('PerformanceObserver' in window) {
      const navObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            this.recordMetric({
              loadTime: entry.loadEventEnd - entry.loadEventStart,
              renderTime: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
              bundleSize: 0, // Will be updated separately
              memoryUsage: this.getMemoryUsage(),
              timestamp: Date.now(),
            });
          }
        });
      });

      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navObserver);

      // Observe LCP (Largest Contentful Paint)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.startTime);
      });

      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

      // Observe FID (First Input Delay)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          console.log('FID:', entry.processingStart - entry.startTime);
        });
      });

      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);
    }
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  private recordMetric(metric: PerformanceMetrics) {
    this.metrics.push(metric);
    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  getAverageLoadTime(): number {
    if (this.metrics.length === 0) return 0;
    const total = this.metrics.reduce((sum, metric) => sum + metric.loadTime, 0);
    return total / this.metrics.length;
  }

  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// =============================================================================
// COMPONENT OPTIMIZATION HOOKS
// =============================================================================

/**
 * Hook for debouncing values to prevent excessive re-renders
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for throttling function calls
 */
export function useThrottle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  const lastCall = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      
      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        return func(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          lastCall.current = Date.now();
          func(...args);
        }, delay - (now - lastCall.current));
      }
    }) as T,
    [func, delay]
  );
}

/**
 * Hook for intersection observer (lazy loading, infinite scroll)
 */
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [intersectionRatio, setIntersectionRatio] = useState(0);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        setIntersectionRatio(entry.intersectionRatio);
      },
      {
        threshold: [0, 0.25, 0.5, 0.75, 1],
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [elementRef, options]);

  return { isIntersecting, intersectionRatio };
}

/**
 * Hook for measuring component render performance
 */
export function useRenderMetrics(componentName: string) {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current += 1;
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;

    if (process.env.NODE_ENV === 'development') {
      console.log(`[${componentName}] Render #${renderCount.current} took ${renderTime.toFixed(2)}ms`);
    }

    startTime.current = performance.now();
  });

  return {
    renderCount: renderCount.current,
  };
}

// =============================================================================
// LAZY LOADING UTILITIES
// =============================================================================

/**
 * Enhanced lazy loading with preload capability
 */
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: {
    preload?: boolean;
    fallback?: React.ComponentType;
  } = {}
) {
  const LazyComponent = React.lazy(importFunc);

  // Preload if specified
  if (options.preload && typeof window !== 'undefined') {
    importFunc().catch(() => {
      // Handle preload errors silently
    });
  }

  return LazyComponent;
}

/**
 * Preload route component on hover/focus
 */
export function useRoutePreload(routePath: string) {
  const preloadRoute = useCallback(() => {
    // This would integrate with Next.js router for preloading
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        // Preload route
        const router = require('next/router').default;
        router.prefetch(routePath);
      });
    }
  }, [routePath]);

  return { preloadRoute };
}

// =============================================================================
// MEMORY OPTIMIZATION
// =============================================================================

/**
 * Hook for cleaning up event listeners and intervals
 */
export function useCleanup(cleanupFn: () => void, deps: React.DependencyList = []) {
  useEffect(() => {
    return cleanupFn;
  }, deps);
}

/**
 * Memoized computation with cache expiry
 */
export function useMemoWithTTL<T>(
  factory: () => T,
  deps: React.DependencyList,
  ttl: number = 5000
): T {
  const cache = useRef<{ value: T; timestamp: number } | null>(null);

  return useMemo(() => {
    const now = Date.now();
    
    if (cache.current && (now - cache.current.timestamp) < ttl) {
      return cache.current.value;
    }

    const value = factory();
    cache.current = { value, timestamp: now };
    return value;
  }, deps);
}

// =============================================================================
// BUNDLE SIZE OPTIMIZATION
// =============================================================================

/**
 * Dynamic import with error handling
 */
export async function loadModule<T>(
  importFunc: () => Promise<T>,
  fallback?: T
): Promise<T> {
  try {
    return await importFunc();
  } catch (error) {
    console.error('Failed to load module:', error);
    if (fallback) {
      return fallback;
    }
    throw error;
  }
}

/**
 * Conditionally load features based on user preferences or device capabilities
 */
export function useFeatureFlag(featureName: string, defaultValue: boolean = false): boolean {
  return useMemo(() => {
    if (typeof window === 'undefined') return defaultValue;
    
    // Check localStorage for user preferences
    const stored = localStorage.getItem(`feature_${featureName}`);
    if (stored !== null) {
      return stored === 'true';
    }

    // Check device capabilities
    switch (featureName) {
      case 'animations':
        return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      case 'high_res_images':
        return window.devicePixelRatio > 1;
      case 'web_workers':
        return 'Worker' in window;
      default:
        return defaultValue;
    }
  }, [featureName, defaultValue]);
}

// =============================================================================
// IMAGE OPTIMIZATION
// =============================================================================

/**
 * Progressive image loading hook
 */
export function useProgressiveImage(
  src: string,
  placeholderSrc?: string
): {
  imgSrc: string;
  isLoaded: boolean;
  isError: boolean;
} {
  const [imgSrc, setImgSrc] = useState(placeholderSrc || src);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const img = new Image();
    
    img.onload = () => {
      setImgSrc(src);
      setIsLoaded(true);
    };
    
    img.onerror = () => {
      setIsError(true);
    };
    
    img.src = src;
  }, [src]);

  return { imgSrc, isLoaded, isError };
}

// =============================================================================
// CRITICAL CSS OPTIMIZATION
// =============================================================================

/**
 * Hook to load non-critical CSS
 */
export function useNonCriticalCSS(href: string, media: string = 'all') {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.media = 'print';
    link.onload = () => {
      link.media = media;
    };

    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, [href, media]);
}

// =============================================================================
// WEB VITALS MONITORING
// =============================================================================

export interface WebVitalsMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB';
  value: number;
  delta: number;
  id: string;
  rating: 'good' | 'needs-improvement' | 'poor';
}

export function useWebVitals(onMetric?: (metric: WebVitalsMetric) => void) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadWebVitals = async () => {
      try {
        const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals');
        
        const handleMetric = (metric: WebVitalsMetric) => {
          console.log(`[Web Vitals] ${metric.name}:`, metric.value);
          onMetric?.(metric);
        };

        getCLS(handleMetric);
        getFID(handleMetric);
        getFCP(handleMetric);
        getLCP(handleMetric);
        getTTFB(handleMetric);
      } catch (error) {
        console.warn('Web Vitals could not be loaded:', error);
      }
    };

    loadWebVitals();
  }, [onMetric]);
}

// =============================================================================
// EXPORTS
// =============================================================================

export { React };
export default PerformanceMonitor;