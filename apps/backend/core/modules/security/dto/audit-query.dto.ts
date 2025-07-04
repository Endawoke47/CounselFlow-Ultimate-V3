import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export enum AuditOutcome {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  UNAUTHORIZED = 'UNAUTHORIZED',
}

export class AuditQueryDto {
  @ApiProperty({ description: 'Filter by user ID', required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ description: 'Filter by action type', required: false })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiProperty({ description: 'Filter by resource type', required: false })
  @IsOptional()
  @IsString()
  resource?: string;

  @ApiProperty({ description: 'Filter by outcome', enum: AuditOutcome, required: false })
  @IsOptional()
  @IsEnum(AuditOutcome)
  outcome?: AuditOutcome;

  @ApiProperty({ description: 'Start date for filtering (ISO 8601)', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'End date for filtering (ISO 8601)', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ description: 'Number of results to return', required: false, default: 100 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  limit?: number;

  @ApiProperty({ description: 'Number of results to skip', required: false, default: 0 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  offset?: number;
}