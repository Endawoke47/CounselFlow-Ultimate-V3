import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAccountDto {
  @ApiPropertyOptional({
    example: false,
    description: 'Whether this account has admin privileges',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isAdmin?: boolean;

  @ApiProperty({
    example: 'CORPORATION',
    description: 'Type of organization (e.g., CORPORATION, LLC, etc.)',
  })
  @IsString()
  @MinLength(1)
  organizationSize!: string;
}
