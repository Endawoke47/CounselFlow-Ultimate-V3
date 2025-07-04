import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';

export enum SecurityEventType {
  DATA_BREACH = 'DATA_BREACH',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  MALWARE_DETECTION = 'MALWARE_DETECTION',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  SYSTEM_COMPROMISE = 'SYSTEM_COMPROMISE',
  PRIVILEGE_ESCALATION = 'PRIVILEGE_ESCALATION',
  DATA_LOSS = 'DATA_LOSS',
  NETWORK_INTRUSION = 'NETWORK_INTRUSION',
  OTHER = 'OTHER',
}

export enum SecurityEventSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  INFO = 'INFO',
}

export class SecurityEventDto {
  @ApiProperty({ description: 'Type of security event', enum: SecurityEventType })
  @IsEnum(SecurityEventType)
  type: SecurityEventType;

  @ApiProperty({ description: 'Severity level of the event', enum: SecurityEventSeverity })
  @IsEnum(SecurityEventSeverity)
  severity: SecurityEventSeverity;

  @ApiProperty({ description: 'Detailed description of the security event' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Source of the event detection', required: false })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiProperty({ description: 'User ID reporting the incident', required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ description: 'Affected system or component', required: false })
  @IsOptional()
  @IsString()
  affectedSystem?: string;

  @ApiProperty({ description: 'Additional metadata about the event', required: false })
  @IsOptional()
  metadata?: any;
}