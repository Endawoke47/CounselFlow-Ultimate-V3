import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EncryptionService } from './services/encryption.service';
import { MonitoringService } from './services/monitoring.service';
import { AuditService } from './services/audit.service';
import { ComplianceService } from './services/compliance.service';
import { SecurityController } from './security.controller';

@Module({
  imports: [ConfigModule],
  controllers: [SecurityController],
  providers: [
    EncryptionService,
    MonitoringService,
    AuditService,
    ComplianceService,
  ],
  exports: [
    EncryptionService,
    MonitoringService,
    AuditService,
    ComplianceService,
  ],
})
export class SecurityModule {}