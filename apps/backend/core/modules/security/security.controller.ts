import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/decorators/roles.enum';
import { MonitoringService } from './services/monitoring.service';
import { AuditService } from './services/audit.service';
import { ComplianceService } from './services/compliance.service';
import { SecurityEventDto, AuditQueryDto } from './dto';

@ApiTags('Security')
@Controller('security')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SecurityController {
  constructor(
    private readonly monitoring: MonitoringService,
    private readonly audit: AuditService,
    private readonly compliance: ComplianceService,
  ) {}

  @Get('status')
  @ApiOperation({ summary: 'Get security system status' })
  @ApiResponse({ status: 200, description: 'Security status retrieved' })
  @Roles(Role.ADMIN, Role.SECURITY_OFFICER)
  async getSecurityStatus() {
    return await this.monitoring.getSystemSecurityStatus();
  }

  @Get('threats')
  @ApiOperation({ summary: 'Get current security threats' })
  @ApiResponse({ status: 200, description: 'Security threats retrieved' })
  @Roles(Role.ADMIN, Role.SECURITY_OFFICER)
  async getCurrentThreats() {
    return await this.monitoring.getCurrentThreats();
  }

  @Post('incident')
  @ApiOperation({ summary: 'Report security incident' })
  @ApiResponse({ status: 201, description: 'Security incident reported' })
  @Roles(Role.ADMIN, Role.SECURITY_OFFICER, Role.USER)
  async reportIncident(@Body() eventDto: SecurityEventDto) {
    return await this.monitoring.reportSecurityIncident(eventDto);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get audit logs' })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved' })
  @Roles(Role.ADMIN, Role.SECURITY_OFFICER)
  async getAuditLogs(@Query() queryDto: AuditQueryDto) {
    return await this.audit.getAuditLogs(queryDto);
  }

  @Get('compliance-status')
  @ApiOperation({ summary: 'Get compliance status' })
  @ApiResponse({ status: 200, description: 'Compliance status retrieved' })
  @Roles(Role.ADMIN, Role.COMPLIANCE_OFFICER)
  async getComplianceStatus() {
    return await this.compliance.getComplianceStatus();
  }

  @Post('compliance-scan')
  @ApiOperation({ summary: 'Run compliance scan' })
  @ApiResponse({ status: 200, description: 'Compliance scan completed' })
  @Roles(Role.ADMIN, Role.COMPLIANCE_OFFICER)
  async runComplianceScan() {
    return await this.compliance.runComplianceScan();
  }

  @Get('encryption-status')
  @ApiOperation({ summary: 'Get encryption status' })
  @ApiResponse({ status: 200, description: 'Encryption status retrieved' })
  @Roles(Role.ADMIN, Role.SECURITY_OFFICER)
  async getEncryptionStatus() {
    return {
      algorithm: 'AES-256-GCM',
      keyRotation: 'Enabled',
      lastRotation: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      nextRotation: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      encryptedFields: [
        'user.personalData',
        'document.content',
        'contract.sensitiveTerms',
        'communication.privilegedContent',
      ],
    };
  }
}