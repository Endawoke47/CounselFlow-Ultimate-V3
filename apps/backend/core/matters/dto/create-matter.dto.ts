import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

class KeyDate {
  @ApiProperty({
    description: 'Date of the milestone or deadline',
    example: '2025-05-30',
  })
  @IsString()
  @IsNotEmpty()
  date!: string;

  @ApiProperty({
    description: 'Description of the milestone or deadline',
    example: 'Closing Deadline',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;
}

export class CreateMatterDto {
  @ApiProperty({
    description: 'Entity ID that this matter belongs to',
    example: '1',
  })
  @IsString()
  @IsNotEmpty()
  companyId!: string;

  @ApiProperty({
    description: 'Descriptive name/title of the matter',
    example: 'Matter Name',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name!: string;

  @ApiProperty({
    description: 'Broad category (e.g., Contract, Litigation, Regulatory, IP)',
    example: 'Contract',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  type!: string;

  @ApiPropertyOptional({
    description:
      'Further specialization (e.g., "Patent Infringement" under IP)',
    example: 'Patent Infringement',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  subtype?: string;

  @ApiProperty({
    description:
      'Current status (e.g., Active, Pending, Closed, On Hold, Escalated)',
    example: 'Active',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  status!: string;

  @ApiPropertyOptional({
    description: 'Priority level (e.g., High, Medium, Low)',
    example: 'High',
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  priority?: string;

  @ApiPropertyOptional({
    description: 'Detailed summary or background information',
    example: 'Matter description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description:
      'A list of date/description pairs to track important milestones or deadlines',
    example: [{ date: '2025-05-30', description: 'Closing Deadline' }],
    type: [KeyDate],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KeyDate)
  keyDates?: KeyDate[];
}
