import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import {
  DisputeStatus,
  DisputeType,
  ResolutionType,
  RiskLevel,
} from '../entities/dispute.entity';
import { CreateDisputeClaimDto } from './create-dispute-claim.dto';
import { CreateDisputePartyDto } from './create-dispute-party.dto';

export class CreateDisputeDto {
  @ApiPropertyOptional({
    description: 'ID of the matter this dispute is associated with',
    example: '1',
  })
  @IsString()
  @IsOptional()
  matterId?: string;

  @ApiPropertyOptional({
    description:
      'ID of the contract this dispute is related to (if applicable)',
    example: '1',
  })
  @IsString()
  @IsOptional()
  contractId?: string;

  @ApiPropertyOptional({
    description: 'ID of the company that initiated this dispute',
    example: '1',
  })
  @IsString()
  @IsOptional()
  initiatingCompanyId?: string;

  @ApiProperty({
    description: 'Descriptive name of the dispute',
    example: 'Late Delivery Penalty Dispute with Acme Corp',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    description: 'Broad category of the dispute',
    example: DisputeType.LITIGATION,
    enum: DisputeType,
    enumName: 'DisputeType',
  })
  @IsEnum(DisputeType)
  @IsNotEmpty()
  type!: DisputeType;

  @ApiPropertyOptional({
    description: 'Detailed explanation of the dispute and its background',
    example:
      'Dispute regarding the interpretation of delivery timeline in section 3.2 of the contract',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Initial status of the dispute',
    example: DisputeStatus.PRE_FILING,
    enum: DisputeStatus,
    enumName: 'DisputeStatus',
  })
  @IsEnum(DisputeStatus)
  @IsNotEmpty()
  status!: DisputeStatus;

  @ApiPropertyOptional({
    description: 'Array of parties involved in the dispute',
    type: [CreateDisputePartyDto],
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDisputePartyDto)
  @IsOptional()
  parties?: CreateDisputePartyDto[];

  @ApiPropertyOptional({
    description: 'Array of initial claims for the dispute',
    type: [CreateDisputeClaimDto],
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDisputeClaimDto)
  @IsOptional()
  claims?: CreateDisputeClaimDto[];

  @ApiPropertyOptional({
    description: 'Date when the dispute was resolved',
    example: '2023-05-15',
  })
  @IsDateString()
  @IsOptional()
  resolutionDate?: string;

  @ApiPropertyOptional({
    description: 'Monetary amount claimed in the dispute',
    example: 100000.0,
  })
  @IsNumber()
  @IsOptional()
  amountClaimed?: number;

  @ApiPropertyOptional({
    description: 'Currency code for amount_claimed',
    example: 'USD',
  })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({
    description: 'Jurisdiction where the dispute is being handled',
    example: 'New York Supreme Court',
  })
  @IsString()
  @IsOptional()
  jurisdiction?: string;

  @ApiPropertyOptional({
    description: 'ID of the lead attorney overseeing the dispute',
    example: '1',
  })
  @IsString()
  @IsOptional()
  leadAttorneyId?: string;

  @ApiPropertyOptional({
    description: 'General internal notes or comments',
    example: 'Weekly status updates required for executive team',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Date when the dispute was formally filed',
    example: '2023-01-01',
  })
  @IsDateString()
  @IsOptional()
  filingDate?: string;

  @ApiPropertyOptional({
    description: 'Key dates and deadlines (JSON object)',
    example: { discoveryDeadline: '2023-03-01', trialDate: '2023-06-15' },
  })
  @IsObject()
  @IsOptional()
  keyDates?: Record<string, string>;

  @ApiPropertyOptional({
    description: 'Estimated cost of resolving the dispute',
    example: 50000.0,
  })
  @IsNumber()
  @IsOptional()
  estimatedCost?: number;

  @ApiPropertyOptional({
    description: 'Initial risk assessment rating',
    example: RiskLevel.HIGH,
    enum: RiskLevel,
    enumName: 'RiskLevel',
  })
  @IsEnum(RiskLevel)
  @IsOptional()
  riskAssessment?: RiskLevel;

  @ApiPropertyOptional({
    description: 'The type of resolution achieved (if already known)',
    example: ResolutionType.SETTLEMENT,
    enum: ResolutionType,
    enumName: 'ResolutionType',
  })
  @IsEnum(ResolutionType)
  @IsOptional()
  resolutionType?: ResolutionType;

  @ApiPropertyOptional({
    description: 'Summary of the resolution outcome (if already known)',
    example: 'Settled for 75% of claimed amount with confidentiality clause',
  })
  @IsString()
  @IsOptional()
  resolutionSummary?: string;

  @ApiPropertyOptional({
    description: 'Actual cost incurred in resolving the dispute',
    example: 45000.0,
  })
  @IsNumber()
  @IsOptional()
  actualCost?: number;
}
