import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';

export enum ResearchDepth {
  QUICK = 'quick',
  STANDARD = 'standard',
  COMPREHENSIVE = 'comprehensive',
}

export class LegalResearchDto {
  @ApiProperty({ description: 'Legal research query' })
  @IsString()
  query: string;

  @ApiProperty({ description: 'Legal jurisdiction', required: false })
  @IsOptional()
  @IsString()
  jurisdiction?: string;

  @ApiProperty({ description: 'Practice area', required: false })
  @IsOptional()
  @IsString()
  practiceArea?: string;

  @ApiProperty({ description: 'Research depth', enum: ResearchDepth, required: false })
  @IsOptional()
  @IsEnum(ResearchDepth)
  depth?: ResearchDepth;

  @ApiProperty({ description: 'Include case law in research', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  includeCaseLaw?: boolean;

  @ApiProperty({ description: 'Include statutes in research', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  includeStatutes?: boolean;

  @ApiProperty({ description: 'Include regulations in research', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  includeRegulations?: boolean;
}