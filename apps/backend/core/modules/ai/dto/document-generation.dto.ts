import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, IsEnum } from 'class-validator';

export enum DocumentType {
  CONTRACT = 'contract',
  LETTER = 'letter',
  MEMO = 'memo',
  BRIEF = 'brief',
  MOTION = 'motion',
  AGREEMENT = 'agreement',
  POLICY = 'policy',
  CLAUSE = 'clause',
}

export class DocumentGenerationDto {
  @ApiProperty({ description: 'Type of document to generate', enum: DocumentType })
  @IsEnum(DocumentType)
  documentType: DocumentType;

  @ApiProperty({ description: 'Template to use for generation', required: false })
  @IsOptional()
  @IsString()
  template?: string;

  @ApiProperty({ description: 'Data to populate the document' })
  @IsObject()
  data: any;

  @ApiProperty({ description: 'Generation options', required: false })
  @IsOptional()
  @IsObject()
  options?: {
    tone?: 'formal' | 'professional' | 'friendly';
    length?: 'short' | 'medium' | 'long';
    complexity?: 'simple' | 'standard' | 'complex';
    includeExplanations?: boolean;
  };

  @ApiProperty({ description: 'Legal jurisdiction', required: false })
  @IsOptional()
  @IsString()
  jurisdiction?: string;
}