/**
 * CounselFlow Ultimate V3 - Performance Monitoring Dashboard
 * Real-time performance metrics and optimization insights
 */

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PerformanceMonitor, 
  useWebVitals, 
  useRenderMetrics,
  WebVitalsMetric
} from '@/lib/performance';
import { 
  Activity, 
  Zap, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Gauge,
  Monitor,
  BarChart3
} from 'lucide-react';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  bundleSize: number;
  memoryUsage: number;
  timestamp: number;
}

interface WebVitalsData {
  CLS?: WebVitalsMetric;
  FID?: WebVitalsMetric;
  FCP?: WebVitalsMetric;
  LCP?: WebVitalsMetric;
  TTFB?: WebVitalsMetric;
}

// =============================================================================
// PERFORMANCE DASHBOARD COMPONENT
// =============================================================================

export const PerformanceDashboard: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [webVitals, setWebVitals] = useState<WebVitalsData>({});
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics[]>([]);
  const [cacheStats, setCacheStats] = useState({ size: 0, hitRate: 0 });

  // Web Vitals monitoring
  useWebVitals((metric) => {
    setWebVitals(prev => ({
      ...prev,
      [metric.name]: metric
    }));
  });

  // Performance monitoring
  useRenderMetrics('PerformanceDashboard');

  useEffect(() => {
    const monitor = PerformanceMonitor.getInstance();
    
    const updateMetrics = () => {
      const metrics = monitor.getMetrics();
      setPerformanceMetrics(metrics);
    };

    // Update metrics every 5 seconds
    const interval = setInterval(updateMetrics, 5000);
    updateMetrics(); // Initial load

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Calculate performance scores
  const performanceScore = useMemo(() => {
    let score = 100;
    
    // Web Vitals scoring
    Object.values(webVitals).forEach(metric => {
      if (metric?.rating === 'poor') score -= 20;
      else if (metric?.rating === 'needs-improvement') score -= 10;
    });

    // Average load time impact
    const avgLoadTime = performanceMetrics.reduce((sum, m) => sum + m.loadTime, 0) / 
                       (performanceMetrics.length || 1);
    if (avgLoadTime > 3000) score -= 15;
    else if (avgLoadTime > 1000) score -= 5;

    return Math.max(0, Math.min(100, score));
  }, [webVitals, performanceMetrics]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 70) return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    return <AlertTriangle className="h-5 w-5 text-red-600" />;
  };

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 z-50"
      >
        <Activity className="h-4 w-4 mr-2" />
        Performance
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Monitor className="h-6 w-6" />
              <h2 className="text-2xl font-bold">Performance Dashboard</h2>
            </div>
            <Button variant="outline" onClick={() => setIsVisible(false)}>
              Close
            </Button>
          </div>

          {/* Performance Score Overview */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5" />
                Overall Performance Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                {getScoreIcon(performanceScore)}
                <span className={`text-3xl font-bold ${getScoreColor(performanceScore)}`}>
                  {performanceScore.toFixed(0)}
                </span>
                <span className="text-muted-foreground">/100</span>
                <Badge variant={performanceScore >= 90 ? "default" : performanceScore >= 70 ? "secondary" : "destructive"}>
                  {performanceScore >= 90 ? "Excellent" : performanceScore >= 70 ? "Good" : "Needs Improvement"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="vitals" className="space-y-4">
            <TabsList>
              <TabsTrigger value="vitals">Web Vitals</TabsTrigger>
              <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
              <TabsTrigger value="optimization">Optimization Tips</TabsTrigger>
            </TabsList>

            {/* Web Vitals Tab */}
            <TabsContent value="vitals" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(webVitals).map(([name, metric]) => (
                  <Card key={name}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">{name}</CardTitle>
                      <CardDescription>{getVitalsDescription(name)}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">
                          {formatVitalsValue(name, metric?.value || 0)}
                        </span>
                        <Badge variant={
                          metric?.rating === 'good' ? "default" :
                          metric?.rating === 'needs-improvement' ? "secondary" : "destructive"
                        }>
                          {metric?.rating}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Performance Metrics Tab */}
            <TabsContent value="metrics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Load Times
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {performanceMetrics.length > 0 ? (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Average:</span>
                          <span>{(performanceMetrics.reduce((sum, m) => sum + m.loadTime, 0) / performanceMetrics.length).toFixed(0)}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Latest:</span>
                          <span>{performanceMetrics[performanceMetrics.length - 1]?.loadTime.toFixed(0)}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Samples:</span>
                          <span>{performanceMetrics.length}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No data available</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Memory Usage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Current:</span>
                        <span>{formatBytes(getMemoryUsage())}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cache Size:</span>
                        <span>{cacheStats.size} items</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Hit Rate:</span>
                        <span>{cacheStats.hitRate.toFixed(1)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Optimization Tips Tab */}
            <TabsContent value="optimization" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Performance Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {generateOptimizationTips(webVitals, performanceScore).map((tip, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Zap className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">{tip.title}</p>
                          <p className="text-sm text-muted-foreground">{tip.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function getVitalsDescription(name: string): string {
  const descriptions = {
    CLS: 'Cumulative Layout Shift',
    FID: 'First Input Delay',
    FCP: 'First Contentful Paint',
    LCP: 'Largest Contentful Paint',
    TTFB: 'Time to First Byte'
  };
  return descriptions[name as keyof typeof descriptions] || name;
}

function formatVitalsValue(name: string, value: number): string {
  if (name === 'CLS') {
    return value.toFixed(3);
  }
  return `${value.toFixed(0)}ms`;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function getMemoryUsage(): number {
  if (typeof window !== 'undefined' && 'memory' in performance) {
    return (performance as any).memory.usedJSHeapSize;
  }
  return 0;
}

function generateOptimizationTips(webVitals: WebVitalsData, score: number) {
  const tips = [];

  // Web Vitals specific tips
  if (webVitals.LCP?.rating === 'poor') {
    tips.push({
      title: 'Optimize Largest Contentful Paint',
      description: 'Consider optimizing images, preloading critical resources, or improving server response times.'
    });
  }

  if (webVitals.CLS?.rating === 'poor') {
    tips.push({
      title: 'Reduce Layout Shifts',
      description: 'Add size attributes to images and videos, avoid inserting content above existing content.'
    });
  }

  if (webVitals.FID?.rating === 'poor') {
    tips.push({
      title: 'Improve Interactivity',
      description: 'Break up long tasks, optimize third-party code, and use a web worker for heavy computations.'
    });
  }

  // General performance tips
  if (score < 90) {
    tips.push({
      title: 'Enable Code Splitting',
      description: 'Use dynamic imports and lazy loading to reduce initial bundle size.'
    });

    tips.push({
      title: 'Optimize Bundle Size',
      description: 'Remove unused dependencies and use tree shaking to eliminate dead code.'
    });

    tips.push({
      title: 'Implement Caching',
      description: 'Use React Query or SWR for API caching and implement proper HTTP caching headers.'
    });
  }

  if (tips.length === 0) {
    tips.push({
      title: 'Great Performance!',
      description: 'Your application is performing well. Monitor regularly to maintain optimal performance.'
    });
  }

  return tips;
}

export default PerformanceDashboard;