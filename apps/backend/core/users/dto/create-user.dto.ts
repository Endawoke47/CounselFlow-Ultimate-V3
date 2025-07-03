import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'john@1pd-dev.com',
    description: 'Email address of the user',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    example: 'John',
    description: 'First name of the user',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Last name of the user',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiPropertyOptional({
    example: 'Robert',
    required: false,
  })
  @IsString()
  @IsOptional()
  middleName?: string;

  @ApiPropertyOptional({
    example: '+380671234567',
    required: false,
  })
  @IsPhoneNumber()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    example: 'Email preferred, available on phone after 2pm',
    required: false,
  })
  @IsString()
  @IsOptional()
  bestWayToContact?: string;

  @ApiProperty({
    example: '1pd-tEst_pass!',
    description:
      'If password is not provided, a random password will be generated and sent to the user',
    required: true,
  })
  @IsStrongPassword()
  password!: string;

  @ApiProperty({
    example: 1,
    description: 'Company ID that the user belongs to',
    type: 'integer',
    required: true,
  })
  @IsNotEmpty()
  @IsInt()
  companyId!: number;

  @ApiPropertyOptional({
    example: 'Senior Legal Counsel',
    description: 'Job title of the user',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    example: 'Legal',
    description: 'Department the user works in',
    required: false,
  })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiProperty({
    example: 1,
    description: 'Country ID where the user is located',
    type: 'integer',
    required: true,
  })
  @IsNotEmpty()
  @IsInt()
  countryId!: number;

  @ApiProperty({
    example: 1,
    description: 'State/province ID where the user is located',
    type: 'integer',
    required: true,
  })
  @IsNotEmpty()
  @IsInt()
  stateId!: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'City ID where the user is located',
    type: 'integer',
    required: false,
  })
  @IsInt()
  @IsOptional()
  cityId?: number;

  @ApiPropertyOptional({
    example: 'Key contact for IP matters',
    description: 'Additional notes about the user',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
