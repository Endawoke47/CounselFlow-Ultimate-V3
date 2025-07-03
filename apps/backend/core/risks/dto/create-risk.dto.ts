import {
  RiskLikelihood,
  RiskMitigationStatus,
  RiskPriority,
  RiskReputationalImpact,
  RiskStatus,
  RiskTolerance,
  TCreateRiskRequest,
} from '1pd-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateRiskDto implements TCreateRiskRequest {
  @ApiProperty({
    description: 'ID of the matter this risk is associated with',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  matterId!: number;

  @ApiProperty({
    description: 'Short title of the risk',
    example: 'Breach of Contract Penalty',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Category of risk',
    example: 'Legal',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @IsNotEmpty()
  category!: string;

  @ApiProperty({
    description: 'Detailed explanation of the risk',
    example:
      'This risk involves potential penalties for late delivery as specified in section 4.2 of the contract.',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    description: 'Pre-control likelihood',
    example: RiskLikelihood.POSSIBLE,
    enum: RiskLikelihood,
    enumName: 'RiskLikelihood',
  })
  @IsEnum(RiskLikelihood)
  @IsNotEmpty()
  inherentLikelihood!: RiskLikelihood;

  @ApiPropertyOptional({
    description: 'Minimum estimated financial impact (in base currency)',
    example: 50000.0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  financialImpactMin?: number;

  @ApiPropertyOptional({
    description: 'Maximum estimated financial impact (in base currency)',
    example: 100000.0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  financialImpactMax?: number;

  @ApiPropertyOptional({
    description: 'Currency of financial impact',
    example: 'USD',
  })
  @IsString()
  @MaxLength(10)
  @IsOptional()
  currency?: string;

  @ApiProperty({
    description: 'Overall priority',
    example: RiskPriority.HIGH,
    enum: RiskPriority,
    enumName: 'RiskPriority',
  })
  @IsEnum(RiskPriority)
  @IsNotEmpty()
  priority!: RiskPriority;

  @ApiProperty({
    description: "Organization's stance",
    example: RiskTolerance.MITIGATE,
    enum: RiskTolerance,
    enumName: 'RiskTolerance',
  })
  @IsEnum(RiskTolerance)
  @IsNotEmpty()
  tolerance!: RiskTolerance;

  @ApiPropertyOptional({
    description: 'Steps to reduce or eliminate the risk',
    example: 'Implement weekly progress reviews to ensure timely delivery.',
  })
  @IsString()
  @IsOptional()
  mitigationPlan?: string;

  @ApiProperty({
    description: 'Status of mitigation efforts',
    example: RiskMitigationStatus.IN_PROGRESS,
    enum: RiskMitigationStatus,
    enumName: 'RiskMitigationStatus',
  })
  @IsEnum(RiskMitigationStatus)
  @IsNotEmpty()
  mitigationStatus!: RiskMitigationStatus;

  @ApiPropertyOptional({
    description: 'ID of the user responsible for managing the risk',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  ownerId?: number;

  @ApiPropertyOptional({
    description: 'Code for the internal department overseeing the risk',
    example: 'LEG-001',
  })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  internalDepartmentCode?: string;

  @ApiPropertyOptional({
    description: 'Defines access permissions for related documents',
    example: 'Legal Team Only',
  })
  @IsString()
  @IsOptional()
  documentAccess?: string;

  @ApiPropertyOptional({
    description: 'URLs, file paths, or references to underlying documents',
    example: ['/docs/risk_assessment.pdf', '/docs/contract_review.docx'],
    isArray: true,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  documentLinks?: string[];

  @ApiProperty({
    description: 'Specific assessment of reputational impact',
    example: RiskReputationalImpact.MEDIUM,
    enum: RiskReputationalImpact,
    enumName: 'RiskReputationalImpact',
  })
  @IsEnum(RiskReputationalImpact)
  @IsNotEmpty()
  reputationalAssessment!: RiskReputationalImpact;

  @ApiProperty({
    description: 'Date the risk was identified',
    example: '2023-01-15',
  })
  @IsDateString()
  @IsNotEmpty()
  identificationDate!: string;

  @ApiProperty({
    description: 'Next scheduled review date',
    example: '2023-04-15',
  })
  @IsDateString()
  @IsNotEmpty()
  reviewDate!: string;

  @ApiPropertyOptional({
    description: 'Date the risk was resolved or accepted',
    example: '2023-06-30',
  })
  @IsDateString()
  @IsOptional()
  resolutionDate?: string;

  @ApiProperty({
    description: 'Indicates if the risk has regulatory impact',
    example: true,
  })
  @IsBoolean()
  regulatoryImplications!: boolean;

  @ApiPropertyOptional({
    description: 'List of applicable regulations',
    example: ['GDPR', 'SOX'],
    isArray: true,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  relatedRegulations?: string[];

  @ApiProperty({
    description: 'Current state of the risk',
    example: RiskStatus.ASSESSED,
    enum: RiskStatus,
    enumName: 'RiskStatus',
  })
  @IsEnum(RiskStatus)
  @IsNotEmpty()
  status!: RiskStatus;

  @ApiPropertyOptional({
    description: 'Additional information or comments',
    example: 'Risk level may change after Q3 financial review.',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: 'Risk score on a scale from 0 to 10',
    example: 7.5,
    minimum: 0,
    maximum: 10,
  })
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  @Max(10)
  @IsNotEmpty()
  score!: number;
}
