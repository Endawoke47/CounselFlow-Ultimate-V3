/**
 * CounselFlow Ultimate V3 - API Status Checker Component
 * Real-time API connectivity and health monitoring
 */

"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Activity,
  Clock,
  Zap,
  Database,
  Brain,
  Shield
} from 'lucide-react';
import { useHealthCheck } from '@/lib/api-hooks';
import { apiClient } from '@/lib/api';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

interface EndpointStatus {
  name: string;
  endpoint: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'checking';
  responseTime?: number;
  error?: string;
  lastChecked?: Date;
}

interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    database: EndpointStatus;
    redis: EndpointStatus;
    ai_services: EndpointStatus;
  };
  version: string;
  uptime: number;
  environment: string;
}

// =============================================================================
// API STATUS CHECKER COMPONENT
// =============================================================================

export const ApiStatusChecker: React.FC<{
  isVisible?: boolean;
  onClose?: () => void;
}> = ({ isVisible = false, onClose }) => {
  const [endpoints, setEndpoints] = useState<EndpointStatus[]>([
    { name: 'Authentication', endpoint: '/api/v1/auth/me', status: 'checking' },
    { name: 'Clients', endpoint: '/api/v1/clients', status: 'checking' },
    { name: 'Contracts', endpoint: '/api/v1/contracts', status: 'checking' },
    { name: 'Matters', endpoint: '/api/v1/matters', status: 'checking' },
    { name: 'AI Services', endpoint: '/api/v1/ai/models', status: 'checking' },
    { name: 'Health Check', endpoint: '/health', status: 'checking' },
  ]);

  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Use health check hook
  const { data: healthData, isError: healthError, refetch: refetchHealth } = useHealthCheck({
    enabled: isVisible,
  });

  // Manual endpoint checking
  const checkEndpoint = async (endpoint: EndpointStatus): Promise<EndpointStatus> => {
    const startTime = performance.now();
    
    try {
      let response;
      
      // Handle different endpoint types
      if (endpoint.endpoint === '/health') {
        response = await apiClient.getWithCache('/health', {
          cache: { ttl: 0, staleWhileRevalidate: false } // Force fresh request
        });
      } else if (endpoint.endpoint.includes('/auth/me')) {
        // Only check if authenticated
        if (!apiClient.isAuthenticated()) {
          return {
            ...endpoint,
            status: 'degraded',
            error: 'Not authenticated',
            responseTime: 0,
            lastChecked: new Date(),
          };
        }
        response = await apiClient.get(endpoint.endpoint);
      } else {
        response = await apiClient.get(endpoint.endpoint + '?limit=1');
      }

      const responseTime = performance.now() - startTime;

      return {
        ...endpoint,
        status: responseTime > 2000 ? 'degraded' : 'healthy',
        responseTime: Math.round(responseTime),
        error: undefined,
        lastChecked: new Date(),
      };
    } catch (error: any) {
      const responseTime = performance.now() - startTime;
      
      return {
        ...endpoint,
        status: 'unhealthy',
        responseTime: Math.round(responseTime),
        error: error.message || 'Request failed',
        lastChecked: new Date(),
      };
    }
  };

  // Check all endpoints
  const checkAllEndpoints = async () => {
    setIsChecking(true);
    
    try {
      const results = await Promise.all(
        endpoints.map(endpoint => checkEndpoint(endpoint))
      );
      
      setEndpoints(results);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Failed to check endpoints:', error);
    } finally {
      setIsChecking(false);
    }
  };

  // Auto-check on mount and visibility change
  useEffect(() => {
    if (isVisible) {
      checkAllEndpoints();
      
      // Set up periodic checking
      const interval = setInterval(checkAllEndpoints, 30000); // Every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  // Calculate overall health
  const overallHealth = React.useMemo(() => {
    const healthyCount = endpoints.filter(e => e.status === 'healthy').length;
    const degradedCount = endpoints.filter(e => e.status === 'degraded').length;
    const unhealthyCount = endpoints.filter(e => e.status === 'unhealthy').length;

    if (unhealthyCount > endpoints.length / 2) return 'unhealthy';
    if (degradedCount > 0 || unhealthyCount > 0) return 'degraded';
    return 'healthy';
  }, [endpoints]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'unhealthy':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'checking':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'default';
      case 'degraded':
        return 'secondary';
      case 'unhealthy':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getServiceIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'authentication':
        return <Shield className="h-4 w-4" />;
      case 'ai services':
        return <Brain className="h-4 w-4" />;
      case 'health check':
        return <Activity className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Activity className="h-6 w-6" />
              <h2 className="text-2xl font-bold">API Status Monitor</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={checkAllEndpoints}
                disabled={isChecking}
              >
                {isChecking ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>

          {/* Overall Status */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(overallHealth)}
                Overall System Health
              </CardTitle>
              <CardDescription>
                Last checked: {lastChecked ? lastChecked.toLocaleTimeString() : 'Never'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Badge variant={getStatusColor(overallHealth) as any}>
                  {overallHealth.toUpperCase()}
                </Badge>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Health Score</span>
                    <span>
                      {endpoints.filter(e => e.status === 'healthy').length} / {endpoints.length}
                    </span>
                  </div>
                  <Progress 
                    value={(endpoints.filter(e => e.status === 'healthy').length / endpoints.length) * 100}
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health Data from Backend */}
          {healthData && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Backend Health Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      <span className="font-medium">Database</span>
                      <Badge variant={
                        healthData.services?.database?.status === 'healthy' ? 'default' : 
                        healthData.services?.database?.status === 'timeout' ? 'secondary' : 'destructive'
                      }>
                        {healthData.services?.database?.status || 'Unknown'}
                      </Badge>
                    </div>
                    {healthData.services?.database?.response_time_ms && (
                      <p className="text-sm text-muted-foreground">
                        Response: {healthData.services.database.response_time_ms}ms
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      <span className="font-medium">Redis</span>
                      <Badge variant={
                        healthData.services?.redis?.status === 'healthy' ? 'default' : 
                        healthData.services?.redis?.status === 'timeout' ? 'secondary' : 'destructive'
                      }>
                        {healthData.services?.redis?.status || 'Unknown'}
                      </Badge>
                    </div>
                    {healthData.services?.redis?.response_time_ms && (
                      <p className="text-sm text-muted-foreground">
                        Response: {healthData.services.redis.response_time_ms}ms
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      <span className="font-medium">AI Services</span>
                      <Badge variant={
                        healthData.services?.ai_services?.status === 'healthy' ? 'default' : 
                        healthData.services?.ai_services?.status === 'not_initialized' ? 'secondary' : 'destructive'
                      }>
                        {healthData.services?.ai_services?.status || 'Unknown'}
                      </Badge>
                    </div>
                    {healthData.services?.ai_services?.response_time_ms && (
                      <p className="text-sm text-muted-foreground">
                        Response: {healthData.services.ai_services.response_time_ms}ms
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Version:</span>
                      <span className="ml-2 font-medium">{healthData.version}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Environment:</span>
                      <span className="ml-2 font-medium">{healthData.environment}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Uptime:</span>
                      <span className="ml-2 font-medium">
                        {healthData.uptime_seconds ? Math.round(healthData.uptime_seconds / 60) : 0}m
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Response:</span>
                      <span className="ml-2 font-medium">
                        {healthData.metrics?.total_response_time_ms}ms
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Endpoint Status */}
          <Card>
            <CardHeader>
              <CardTitle>Endpoint Status</CardTitle>
              <CardDescription>
                Individual API endpoint health and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {endpoints.map((endpoint, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      {getServiceIcon(endpoint.name)}
                      <div>
                        <div className="font-medium">{endpoint.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {endpoint.endpoint}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {endpoint.responseTime !== undefined && (
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="h-3 w-3" />
                            {endpoint.responseTime}ms
                          </div>
                          {endpoint.lastChecked && (
                            <div className="text-xs text-muted-foreground">
                              {endpoint.lastChecked.toLocaleTimeString()}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        {getStatusIcon(endpoint.status)}
                        <Badge variant={getStatusColor(endpoint.status) as any}>
                          {endpoint.status}
                        </Badge>
                      </div>
                    </div>

                    {endpoint.error && (
                      <div className="text-xs text-red-600 max-w-xs truncate">
                        {endpoint.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApiStatusChecker;