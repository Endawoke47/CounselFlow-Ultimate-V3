/**
 * CounselFlow Ultimate V3 - Enhanced Frontend Caching
 * Advanced client-side caching with intelligent invalidation
 */

import { QueryClient } from '@tanstack/react-query';

// Enhanced cache configuration types
export interface CacheStrategy {
  staleTime: number;
  gcTime: number; // Formerly cacheTime
  refetchInterval?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
  invalidatePatterns?: string[];
  tags?: string[];
  priority?: 'low' | 'normal' | 'high';
  maxSize?: number;
}

export interface IntelligentCacheConfig {
  strategies: Record<string, CacheStrategy>;
  globalSettings: {
    maxMemoryUsage: number; // MB
    cleanupInterval: number; // seconds
    compressionThreshold: number; // bytes
  };
}

// Cache priorities and strategies
export const CACHE_STRATEGIES: Record<string, CacheStrategy> = {
  // User and authentication data
  user: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    tags: ['user', 'auth'],
    priority: 'high'
  },

  // Client data
  'clients-list': {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    invalidatePatterns: ['clients', 'dashboard'],
    tags: ['clients'],
    priority: 'normal'
  },

  'clients-detail': {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    invalidatePatterns: ['clients'],
    tags: ['clients'],
    priority: 'high'
  },

  // Contract data
  'contracts-list': {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 5 * 60 * 1000,
    invalidatePatterns: ['contracts', 'dashboard'],
    tags: ['contracts'],
    priority: 'normal'
  },

  'contracts-detail': {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    invalidatePatterns: ['contracts'],
    tags: ['contracts'],
    priority: 'high'
  },

  'contracts-analytics': {
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchInterval: 15 * 60 * 1000,
    invalidatePatterns: ['contracts', 'analytics', 'dashboard'],
    tags: ['contracts', 'analytics'],
    priority: 'normal'
  },

  // Matter data
  'matters-list': {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 5 * 60 * 1000,
    invalidatePatterns: ['matters', 'dashboard'],
    tags: ['matters'],
    priority: 'normal'
  },

  'matters-detail': {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    invalidatePatterns: ['matters'],
    tags: ['matters'],
    priority: 'high'
  },

  // Dashboard data
  'dashboard-overview': {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000,
    invalidatePatterns: ['dashboard'],
    tags: ['dashboard', 'analytics'],
    priority: 'high'
  },

  'dashboard-metrics': {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 10 * 60 * 1000,
    invalidatePatterns: ['dashboard', 'metrics'],
    tags: ['dashboard', 'analytics', 'metrics'],
    priority: 'normal'
  },

  // AI service results
  'ai-analysis': {
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    tags: ['ai', 'analysis'],
    priority: 'high',
    maxSize: 5 * 1024 * 1024 // 5MB for AI results
  },

  'ai-generation': {
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    tags: ['ai', 'generation'],
    priority: 'normal'
  },

  // Search results
  'search-results': {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    tags: ['search'],
    priority: 'low'
  },

  // Static/reference data
  'reference-data': {
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnWindowFocus: false,
    tags: ['reference'],
    priority: 'low'
  }
};

// Enhanced Query Client with intelligent caching
export class IntelligentQueryClient {
  private queryClient: QueryClient;
  private cacheMetrics: Map<string, any>;
  private memoryUsage: number;
  private cleanupTimer: NodeJS.Timeout | null;

  constructor(config?: IntelligentCacheConfig) {
    this.cacheMetrics = new Map();
    this.memoryUsage = 0;
    this.cleanupTimer = null;

    this.queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000, // 5 minutes default
          gcTime: 10 * 60 * 1000, // 10 minutes default
          refetchOnWindowFocus: false,
          refetchOnReconnect: true,
          retry: (failureCount, error: any) => {
            // Don't retry on 4xx errors
            if (error?.status >= 400 && error?.status < 500) {
              return false;
            }
            return failureCount < 3;
          },
          retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        },
        mutations: {
          retry: 1,
          retryDelay: 1000,
          onSuccess: () => {
            // Intelligent cache invalidation on mutations
            this.handleMutationSuccess();
          },
          onError: (error: any) => {
            console.error('Mutation error:', error);
          },
        },
      },
    });

    // Start memory monitoring
    this.startMemoryMonitoring();
  }

  private startMemoryMonitoring() {
    // Monitor memory usage every 30 seconds
    this.cleanupTimer = setInterval(() => {
      this.monitorMemoryUsage();
    }, 30000);
  }

  private monitorMemoryUsage() {
    if (typeof window !== 'undefined' && 'performance' in window) {
      try {
        // @ts-ignore - Performance memory API
        const memory = (performance as any).memory;
        if (memory) {
          const usedMB = memory.usedJSHeapSize / 1024 / 1024;
          this.memoryUsage = usedMB;

          // Trigger cleanup if memory usage is high
          if (usedMB > 100) { // 100MB threshold
            this.performIntelligentCleanup();
          }
        }
      } catch (error) {
        console.warn('Memory monitoring not available:', error);
      }
    }
  }

  private performIntelligentCleanup() {
    console.log('Performing intelligent cache cleanup');

    const cache = this.queryClient.getQueryCache();
    const queries = cache.getAll();

    // Sort queries by priority and last access time
    const sortedQueries = queries
      .map(query => ({
        query,
        priority: this.getQueryPriority(query.queryKey),
        lastAccess: query.state.dataUpdatedAt || 0,
        size: this.estimateQuerySize(query.state.data)
      }))
      .sort((a, b) => {
        // Prioritize by: 1. Priority (low first), 2. Last access (oldest first), 3. Size (largest first)
        if (a.priority !== b.priority) {
          return a.priority === 'low' ? -1 : a.priority === 'high' ? 1 : 0;
        }
        if (Math.abs(a.lastAccess - b.lastAccess) > 60000) { // More than 1 minute difference
          return a.lastAccess - b.lastAccess;
        }
        return b.size - a.size;
      });

    // Remove the least important queries
    const queriesToRemove = sortedQueries.slice(0, Math.ceil(queries.length * 0.3)); // Remove 30%
    
    queriesToRemove.forEach(({ query }) => {
      cache.remove(query);
    });

    console.log(`Cleaned up ${queriesToRemove.length} cache entries`);
  }

  private getQueryPriority(queryKey: unknown[]): 'low' | 'normal' | 'high' {
    const keyString = Array.isArray(queryKey) ? queryKey.join('-') : String(queryKey);
    
    for (const [pattern, strategy] of Object.entries(CACHE_STRATEGIES)) {
      if (keyString.includes(pattern) || keyString.startsWith(pattern)) {
        return strategy.priority || 'normal';
      }
    }
    
    return 'normal';
  }

  private estimateQuerySize(data: any): number {
    if (!data) return 0;
    
    try {
      return JSON.stringify(data).length;
    } catch {
      return 1000; // Default estimate
    }
  }

  private handleMutationSuccess() {
    // Implement intelligent cache invalidation based on mutation context
    // This would be called by mutations to invalidate related caches
    console.log('Handling mutation success - invalidating related caches');
  }

  // Public methods
  public getQueryClient(): QueryClient {
    return this.queryClient;
  }

  public invalidateByTags(tags: string[]) {
    const cache = this.queryClient.getQueryCache();
    const queries = cache.getAll();

    queries.forEach(query => {
      const queryStrategy = this.getQueryStrategy(query.queryKey);
      if (queryStrategy?.tags?.some(tag => tags.includes(tag))) {
        this.queryClient.invalidateQueries({ queryKey: query.queryKey });
      }
    });
  }

  public invalidateByPatterns(patterns: string[]) {
    patterns.forEach(pattern => {
      this.queryClient.invalidateQueries({
        predicate: (query) => {
          const keyString = Array.isArray(query.queryKey) 
            ? query.queryKey.join('-') 
            : String(query.queryKey);
          return keyString.includes(pattern);
        }
      });
    });
  }

  private getQueryStrategy(queryKey: unknown[]): CacheStrategy | undefined {
    const keyString = Array.isArray(queryKey) ? queryKey.join('-') : String(queryKey);
    
    for (const [pattern, strategy] of Object.entries(CACHE_STRATEGIES)) {
      if (keyString.includes(pattern) || keyString.startsWith(pattern)) {
        return strategy;
      }
    }
    
    return undefined;
  }

  public getCacheMetrics() {
    const cache = this.queryClient.getQueryCache();
    const queries = cache.getAll();

    const metrics = {
      totalQueries: queries.length,
      memoryUsage: this.memoryUsage,
      byStrategy: {} as Record<string, number>,
      byPriority: { low: 0, normal: 0, high: 0 },
      staleCounts: 0,
      errorCounts: 0,
    };

    queries.forEach(query => {
      const strategy = this.getQueryStrategy(query.queryKey);
      const priority = strategy?.priority || 'normal';
      metrics.byPriority[priority]++;

      if (query.state.isStale) metrics.staleCounts++;
      if (query.state.isError) metrics.errorCounts++;
    });

    return metrics;
  }

  public preloadQuery(queryKey: string[], queryFn: () => Promise<any>, strategy?: string) {
    const cacheStrategy = strategy ? CACHE_STRATEGIES[strategy] : undefined;
    
    this.queryClient.prefetchQuery({
      queryKey,
      queryFn,
      staleTime: cacheStrategy?.staleTime || 5 * 60 * 1000,
    });
  }

  public warmCache(operations: Array<{ key: string[], fn: () => Promise<any>, strategy?: string }>) {
    operations.forEach(({ key, fn, strategy }) => {
      this.preloadQuery(key, fn, strategy);
    });
  }

  public clearUserSpecificCache(userId: string) {
    this.queryClient.invalidateQueries({
      predicate: (query) => {
        const keyString = Array.isArray(query.queryKey) 
          ? query.queryKey.join('-') 
          : String(query.queryKey);
        return keyString.includes(userId);
      }
    });
  }

  public shutdown() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.queryClient.clear();
  }
}

// Hook for cache management
export function useCacheManager() {
  const queryClient = useQueryClient();

  const invalidateByTags = (tags: string[]) => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();

    queries.forEach(query => {
      const keyString = Array.isArray(query.queryKey) 
        ? query.queryKey.join('-') 
        : String(query.queryKey);
      
      for (const [pattern, strategy] of Object.entries(CACHE_STRATEGIES)) {
        if (keyString.includes(pattern) && strategy.tags?.some(tag => tags.includes(tag))) {
          queryClient.invalidateQueries({ queryKey: query.queryKey });
          break;
        }
      }
    });
  };

  const clearAllCache = () => {
    queryClient.clear();
  };

  const getCacheInfo = () => {
    const cache = queryClient.getQueryCache();
    return {
      queryCount: cache.getAll().length,
      // Add more cache info as needed
    };
  };

  return {
    invalidateByTags,
    clearAllCache,
    getCacheInfo,
  };
}

// Cache warming utilities
export async function warmDashboardCache(queryClient: QueryClient, userId: string) {
  console.log('Warming dashboard cache for user:', userId);
  
  // Pre-load common dashboard queries
  const warmingOperations = [
    {
      key: ['dashboard', 'overview', userId],
      fn: () => fetch(`/api/v1/dashboard/overview`).then(r => r.json()),
      strategy: 'dashboard-overview'
    },
    {
      key: ['dashboard', 'metrics', userId, { days: 30 }],
      fn: () => fetch(`/api/v1/dashboard/metrics/clients?days=30`).then(r => r.json()),
      strategy: 'dashboard-metrics'
    }
  ];

  // Execute warming operations in parallel
  await Promise.allSettled(
    warmingOperations.map(({ key, fn }) => 
      queryClient.prefetchQuery({ queryKey: key, queryFn: fn })
    )
  );
}

// Background cache optimization
export function startBackgroundCacheOptimization(queryClient: QueryClient) {
  // Run optimization every 5 minutes
  setInterval(() => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    // Remove stale queries that haven't been accessed recently
    queries.forEach(query => {
      const timeSinceUpdate = Date.now() - (query.state.dataUpdatedAt || 0);
      const timeSinceAccess = Date.now() - (query.state.dataUpdatedAt || 0); // Approximation
      
      // Remove if stale for more than 30 minutes and not accessed recently
      if (timeSinceUpdate > 30 * 60 * 1000 && timeSinceAccess > 10 * 60 * 1000) {
        cache.remove(query);
      }
    });
  }, 5 * 60 * 1000); // Every 5 minutes
}

// Export enhanced query client factory
export function createIntelligentQueryClient(config?: IntelligentCacheConfig): QueryClient {
  const intelligentClient = new IntelligentQueryClient(config);
  
  // Start background optimization
  if (typeof window !== 'undefined') {
    startBackgroundCacheOptimization(intelligentClient.getQueryClient());
  }
  
  return intelligentClient.getQueryClient();
}

import { useQueryClient } from '@tanstack/react-query';

// Performance monitoring for cache effectiveness
export function useCachePerformance() {
  const queryClient = useQueryClient();

  const getPerformanceMetrics = () => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();

    let totalHits = 0;
    let totalMisses = 0;
    let averageResponseTime = 0;

    queries.forEach(query => {
      // These would need to be tracked during actual usage
      totalHits += (query as any).hits || 0;
      totalMisses += (query as any).misses || 0;
    });

    const hitRate = totalHits / (totalHits + totalMisses) || 0;

    return {
      hitRate: Math.round(hitRate * 100),
      totalQueries: queries.length,
      averageResponseTime,
      memoryUsage: queries.reduce((acc, query) => {
        return acc + (JSON.stringify(query.state.data || {}).length);
      }, 0)
    };
  };

  return { getPerformanceMetrics };
}