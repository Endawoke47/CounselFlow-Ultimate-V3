import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsEnum } from 'class-validator';

export enum ContractType {
  EMPLOYMENT = 'employment',
  NDA = 'nda',
  SERVICE_AGREEMENT = 'service_agreement',
  PURCHASE_ORDER = 'purchase_order',
  LEASE = 'lease',
  PARTNERSHIP = 'partnership',
  LICENSE = 'license',
  OTHER = 'other',
}

export enum AnalysisType {
  QUICK = 'quick',
  STANDARD = 'standard',
  COMPREHENSIVE = 'comprehensive',
  RISK_FOCUSED = 'risk_focused',
  COMPLIANCE_FOCUSED = 'compliance_focused',
}

export class ContractAnalysisDto {
  @ApiProperty({ description: 'Contract content to analyze' })
  @IsString()
  content: string;

  @ApiProperty({ description: 'Type of contract', enum: ContractType })
  @IsEnum(ContractType)
  contractType: ContractType;

  @ApiProperty({ description: 'Type of analysis to perform', enum: AnalysisType, required: false })
  @IsOptional()
  @IsEnum(AnalysisType)
  analysisType?: AnalysisType;

  @ApiProperty({ description: 'Specific areas to focus analysis on', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  focusAreas?: string[];

  @ApiProperty({ description: 'Include risk assessment', required: false, default: true })
  @IsOptional()
  includeRiskAssessment?: boolean;

  @ApiProperty({ description: 'Include compliance check', required: false, default: true })
  @IsOptional()
  includeComplianceCheck?: boolean;
}