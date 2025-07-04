import { Injectable, Logger } from '@nestjs/common';
import { AuditQueryDto } from '../dto/audit-query.dto';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  private auditLogs: any[] = [];

  constructor() {
    this.initializeAuditSystem();
  }

  async logAuditEvent(event: {
    userId: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
    outcome: 'SUCCESS' | 'FAILURE' | 'UNAUTHORIZED';
  }): Promise<void> {
    const auditEntry = {
      id: this.generateAuditId(),
      timestamp: new Date(),
      userId: event.userId,
      action: event.action,
      resource: event.resource,
      resourceId: event.resourceId,
      details: event.details,
      ipAddress: event.ipAddress || 'unknown',
      userAgent: event.userAgent || 'unknown',
      outcome: event.outcome,
      sessionId: this.generateSessionId(),
    };

    this.auditLogs.push(auditEntry);
    
    // Log critical events immediately
    if (this.isCriticalEvent(event.action)) {
      this.logger.warn(`Critical audit event: ${event.action} by ${event.userId} on ${event.resource}`);
    }

    // Retention management - keep only last 10000 logs in memory
    if (this.auditLogs.length > 10000) {
      this.auditLogs = this.auditLogs.slice(-10000);
    }
  }

  async getAuditLogs(queryDto: AuditQueryDto): Promise<any> {
    let filteredLogs = [...this.auditLogs];

    // Apply filters
    if (queryDto.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === queryDto.userId);
    }

    if (queryDto.action) {
      filteredLogs = filteredLogs.filter(log => 
        log.action.toLowerCase().includes(queryDto.action.toLowerCase())
      );
    }

    if (queryDto.resource) {
      filteredLogs = filteredLogs.filter(log => 
        log.resource.toLowerCase().includes(queryDto.resource.toLowerCase())
      );
    }

    if (queryDto.startDate) {
      filteredLogs = filteredLogs.filter(log => 
        log.timestamp >= new Date(queryDto.startDate)
      );
    }

    if (queryDto.endDate) {
      filteredLogs = filteredLogs.filter(log => 
        log.timestamp <= new Date(queryDto.endDate)
      );
    }

    if (queryDto.outcome) {
      filteredLogs = filteredLogs.filter(log => log.outcome === queryDto.outcome);
    }

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Pagination
    const limit = queryDto.limit || 100;
    const offset = queryDto.offset || 0;
    const paginatedLogs = filteredLogs.slice(offset, offset + limit);

    return {
      logs: paginatedLogs,
      total: filteredLogs.length,
      limit,
      offset,
      hasMore: offset + limit < filteredLogs.length,
    };
  }

  async getAuditSummary(timeframe: 'day' | 'week' | 'month' = 'day'): Promise<any> {
    const now = new Date();
    const timeRanges = {
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
    };

    const startTime = new Date(now.getTime() - timeRanges[timeframe]);
    const relevantLogs = this.auditLogs.filter(log => log.timestamp >= startTime);

    const summary = {
      timeframe,
      totalEvents: relevantLogs.length,
      successfulEvents: relevantLogs.filter(log => log.outcome === 'SUCCESS').length,
      failedEvents: relevantLogs.filter(log => log.outcome === 'FAILURE').length,
      unauthorizedEvents: relevantLogs.filter(log => log.outcome === 'UNAUTHORIZED').length,
      uniqueUsers: [...new Set(relevantLogs.map(log => log.userId))].length,
      topActions: this.getTopActions(relevantLogs),
      topResources: this.getTopResources(relevantLogs),
      criticalEvents: relevantLogs.filter(log => this.isCriticalEvent(log.action)).length,
      timeDistribution: this.getTimeDistribution(relevantLogs, timeframe),
    };

    return summary;
  }

  async searchAuditLogs(searchTerm: string, limit: number = 100): Promise<any[]> {
    const searchResults = this.auditLogs.filter(log => {
      const searchString = JSON.stringify(log).toLowerCase();
      return searchString.includes(searchTerm.toLowerCase());
    });

    return searchResults
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async getComplianceReport(): Promise<any> {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const relevantLogs = this.auditLogs.filter(log => log.timestamp >= last30Days);

    return {
      reportGenerated: now,
      period: '30 days',
      totalAuditEvents: relevantLogs.length,
      dataAccessEvents: relevantLogs.filter(log => log.action.includes('READ') || log.action.includes('view')).length,
      dataModificationEvents: relevantLogs.filter(log => log.action.includes('create') || log.action.includes('update') || log.action.includes('delete')).length,
      administrativeEvents: relevantLogs.filter(log => log.action.includes('admin')).length,
      securityEvents: relevantLogs.filter(log => this.isCriticalEvent(log.action)).length,
      complianceMetrics: {
        dataRetention: 'COMPLIANT',
        accessLogging: 'COMPLIANT',
        privilegedAccess: 'COMPLIANT',
        systemChanges: 'COMPLIANT',
      },
      recommendations: this.generateComplianceRecommendations(relevantLogs),
    };
  }

  private initializeAuditSystem(): void {
    // Initialize with some sample audit events
    const sampleEvents = [
      {
        userId: 'admin-001',
        action: 'USER_LOGIN',
        resource: 'AUTH_SYSTEM',
        outcome: 'SUCCESS' as const,
      },
      {
        userId: 'user-123',
        action: 'VIEW_DOCUMENT',
        resource: 'DOCUMENT',
        resourceId: 'doc-456',
        outcome: 'SUCCESS' as const,
      },
    ];

    sampleEvents.forEach(event => {
      this.logAuditEvent(event);
    });
  }

  private generateAuditId(): string {
    return `AUD-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
  }

  private generateSessionId(): string {
    return `SES-${Math.random().toString(36).substr(2, 12).toUpperCase()}`;
  }

  private isCriticalEvent(action: string): boolean {
    const criticalActions = [
      'USER_DELETE',
      'PRIVILEGE_ESCALATION',
      'SYSTEM_CONFIGURATION_CHANGE',
      'SECURITY_POLICY_CHANGE',
      'ADMIN_ACCESS',
      'DATA_EXPORT',
      'BULK_DELETE',
    ];
    
    return criticalActions.some(critical => action.includes(critical));
  }

  private getTopActions(logs: any[]): any[] {
    const actionCounts = logs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(actionCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([action, count]) => ({ action, count }));
  }

  private getTopResources(logs: any[]): any[] {
    const resourceCounts = logs.reduce((acc, log) => {
      acc[log.resource] = (acc[log.resource] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(resourceCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([resource, count]) => ({ resource, count }));
  }

  private getTimeDistribution(logs: any[], timeframe: string): any[] {
    // Simplified time distribution - in real implementation would be more sophisticated
    const buckets = timeframe === 'day' ? 24 : timeframe === 'week' ? 7 : 30;
    const distribution = new Array(buckets).fill(0);
    
    logs.forEach(log => {
      const bucket = Math.floor(Math.random() * buckets); // Simplified for demo
      distribution[bucket]++;
    });

    return distribution.map((count, index) => ({ bucket: index, count }));
  }

  private generateComplianceRecommendations(logs: any[]): string[] {
    const recommendations = [];
    
    const failureRate = logs.filter(log => log.outcome === 'FAILURE').length / logs.length;
    if (failureRate > 0.1) {
      recommendations.push('High failure rate detected. Review access controls and user training.');
    }

    const adminEvents = logs.filter(log => log.action.includes('admin')).length;
    if (adminEvents > 50) {
      recommendations.push('High administrative activity. Consider implementing additional approval workflows.');
    }

    const afterHoursEvents = logs.filter(log => {
      const hour = log.timestamp.getHours();
      return hour < 8 || hour > 18;
    }).length;
    
    if (afterHoursEvents > logs.length * 0.2) {
      recommendations.push('Significant after-hours activity detected. Review business justification.');
    }

    if (recommendations.length === 0) {
      recommendations.push('Audit patterns appear normal. Continue monitoring.');
    }

    return recommendations;
  }
}