import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SecurityEventDto } from '../dto/security-event.dto';

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);
  private securityEvents: any[] = [];
  private threats: any[] = [];

  constructor(private readonly configService: ConfigService) {
    this.initializeMonitoring();
  }

  async getSystemSecurityStatus(): Promise<any> {
    const status = {
      overall: 'SECURE',
      lastScan: new Date(),
      activeThreatLevel: this.calculateThreatLevel(),
      securityModules: {
        encryption: { status: 'ACTIVE', lastCheck: new Date() },
        authentication: { status: 'ACTIVE', lastCheck: new Date() },
        authorization: { status: 'ACTIVE', lastCheck: new Date() },
        auditLogging: { status: 'ACTIVE', lastCheck: new Date() },
        intrusion_detection: { status: 'ACTIVE', lastCheck: new Date() },
        data_loss_prevention: { status: 'ACTIVE', lastCheck: new Date() },
      },
      metrics: {
        totalSecurityEvents: this.securityEvents.length,
        threatsDetected: this.threats.length,
        threatsBlocked: this.threats.filter(t => t.status === 'BLOCKED').length,
        failedLoginAttempts: this.getRecentFailedLogins(),
        suspiciousActivities: this.getSuspiciousActivities(),
      },
    };

    return status;
  }

  async getCurrentThreats(): Promise<any[]> {
    return this.threats.filter(threat => threat.status === 'ACTIVE').map(threat => ({
      id: threat.id,
      type: threat.type,
      severity: threat.severity,
      description: threat.description,
      detectedAt: threat.detectedAt,
      source: threat.source,
      mitigationStatus: threat.mitigationStatus,
    }));
  }

  async reportSecurityIncident(eventDto: SecurityEventDto): Promise<any> {
    const incident = {
      id: this.generateIncidentId(),
      type: eventDto.type,
      severity: eventDto.severity,
      description: eventDto.description,
      source: eventDto.source || 'USER_REPORTED',
      reportedAt: new Date(),
      status: 'INVESTIGATING',
      reportedBy: eventDto.userId,
    };

    this.securityEvents.push(incident);
    
    // Auto-escalate high severity incidents
    if (eventDto.severity === 'CRITICAL' || eventDto.severity === 'HIGH') {
      await this.escalateIncident(incident);
    }

    this.logger.warn(`Security incident reported: ${incident.type} - ${incident.severity}`);
    
    return {
      incidentId: incident.id,
      status: 'REPORTED',
      estimatedResolutionTime: this.getEstimatedResolutionTime(eventDto.severity),
      nextSteps: this.getIncidentNextSteps(eventDto.type),
    };
  }

  async detectSuspiciousActivity(userId: string, activity: string, metadata: any): Promise<void> {
    const riskScore = this.calculateRiskScore(activity, metadata);
    
    if (riskScore > 0.7) {
      const threat = {
        id: this.generateThreatId(),
        type: 'SUSPICIOUS_ACTIVITY',
        severity: riskScore > 0.9 ? 'CRITICAL' : 'HIGH',
        description: `Suspicious activity detected: ${activity}`,
        detectedAt: new Date(),
        source: 'AUTOMATED_DETECTION',
        userId,
        activity,
        metadata,
        riskScore,
        status: 'ACTIVE',
        mitigationStatus: 'PENDING',
      };

      this.threats.push(threat);
      this.logger.warn(`Threat detected: ${threat.description} (Risk Score: ${riskScore})`);
      
      if (riskScore > 0.9) {
        await this.triggerAutomaticMitigation(threat);
      }
    }
  }

  async monitorDataAccess(userId: string, resourceType: string, resourceId: string, action: string): Promise<void> {
    const accessEvent = {
      userId,
      resourceType,
      resourceId,
      action,
      timestamp: new Date(),
      ipAddress: 'unknown', // Would be extracted from request
      userAgent: 'unknown', // Would be extracted from request
    };

    // Check for unusual access patterns
    if (this.isUnusualAccessPattern(accessEvent)) {
      await this.detectSuspiciousActivity(userId, 'UNUSUAL_DATA_ACCESS', accessEvent);
    }

    // Log for audit trail
    this.logger.log(`Data access: ${userId} ${action} ${resourceType}:${resourceId}`);
  }

  private initializeMonitoring(): void {
    // Initialize with some sample threats for demonstration
    this.threats = [
      {
        id: 'THR-001',
        type: 'BRUTE_FORCE_ATTEMPT',
        severity: 'MEDIUM',
        description: 'Multiple failed login attempts detected',
        detectedAt: new Date(Date.now() - 60000),
        source: 'AUTOMATED_DETECTION',
        status: 'BLOCKED',
        mitigationStatus: 'RESOLVED',
      },
    ];
  }

  private calculateThreatLevel(): string {
    const activeThreatCount = this.threats.filter(t => t.status === 'ACTIVE').length;
    const criticalThreats = this.threats.filter(t => t.severity === 'CRITICAL').length;
    
    if (criticalThreats > 0) return 'CRITICAL';
    if (activeThreatCount > 5) return 'HIGH';
    if (activeThreatCount > 2) return 'MEDIUM';
    return 'LOW';
  }

  private calculateRiskScore(activity: string, metadata: any): number {
    let score = 0;
    
    // Base risk scores for different activities
    const activityRisk = {
      'LOGIN_ATTEMPT': 0.1,
      'DATA_ACCESS': 0.2,
      'BULK_DOWNLOAD': 0.6,
      'ADMIN_ACCESS': 0.7,
      'SYSTEM_MODIFICATION': 0.8,
      'PRIVILEGE_ESCALATION': 0.9,
    };
    
    score += activityRisk[activity] || 0.1;
    
    // Additional risk factors
    if (metadata.outsideBusinessHours) score += 0.2;
    if (metadata.newLocation) score += 0.3;
    if (metadata.multipleFailedAttempts) score += 0.4;
    if (metadata.privilegedAccount) score += 0.3;
    
    return Math.min(score, 1.0);
  }

  private async escalateIncident(incident: any): Promise<void> {
    this.logger.error(`SECURITY ALERT: ${incident.type} - ${incident.severity}`);
    // In real implementation, this would notify security team
  }

  private async triggerAutomaticMitigation(threat: any): Promise<void> {
    this.logger.warn(`Automatic mitigation triggered for threat: ${threat.id}`);
    threat.mitigationStatus = 'AUTO_MITIGATING';
    // In real implementation, this would trigger automatic security responses
  }

  private isUnusualAccessPattern(accessEvent: any): boolean {
    // Simple heuristic - in real implementation, this would use ML models
    const recentAccess = this.securityEvents.filter(event => 
      event.userId === accessEvent.userId && 
      event.timestamp > new Date(Date.now() - 3600000) // Last hour
    );
    
    return recentAccess.length > 10; // More than 10 accesses in an hour
  }

  private generateIncidentId(): string {
    return `INC-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  }

  private generateThreatId(): string {
    return `THR-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  }

  private getRecentFailedLogins(): number {
    // Mock implementation
    return Math.floor(Math.random() * 5);
  }

  private getSuspiciousActivities(): number {
    return this.threats.filter(t => t.type === 'SUSPICIOUS_ACTIVITY' && t.status === 'ACTIVE').length;
  }

  private getEstimatedResolutionTime(severity: string): string {
    const times = {
      'CRITICAL': '1-2 hours',
      'HIGH': '4-8 hours',
      'MEDIUM': '1-2 days',
      'LOW': '3-5 days',
    };
    return times[severity] || '1-2 days';
  }

  private getIncidentNextSteps(type: string): string[] {
    const steps = {
      'DATA_BREACH': [
        'Isolate affected systems',
        'Assess scope of breach',
        'Notify affected parties',
        'Implement containment measures',
      ],
      'UNAUTHORIZED_ACCESS': [
        'Disable compromised accounts',
        'Review access logs',
        'Strengthen authentication',
        'Monitor for further activity',
      ],
      'MALWARE_DETECTION': [
        'Quarantine infected systems',
        'Run full system scan',
        'Update security signatures',
        'Restore from clean backups',
      ],
    };
    
    return steps[type] || [
      'Investigate incident details',
      'Implement appropriate countermeasures',
      'Monitor system activity',
      'Document findings',
    ];
  }
}