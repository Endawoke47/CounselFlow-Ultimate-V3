import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class CreateLawyerAccountDto {
  @ApiProperty({
    example: '1st Lawyer Company',
    description: 'Company name',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  companyName!: string;

  @ApiProperty({
    example: 'lawyer@1stlayertcompany.com',
    description: 'Company contact person email',
    required: true,
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 's0m3Str0ngP@ssw0rd',
    description: 'Company contact person',
    required: true,
  })
  @IsStrongPassword()
  @IsNotEmpty()
  password!: string;

  @ApiProperty({
    example: 'John',
    description: 'Company contact person name',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Company contact person last name',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({
    example: '+380671234567',
    description: 'Company contact person phone number',
    required: true,
  })
  @IsString()
  @IsPhoneNumber()
  phone!: string;

  // Optional fields
  @ApiPropertyOptional({
    example: '1st Khreschatyk street',
    description: 'Company address',
    required: false,
  })
  @IsString()
  @IsOptional()
  companyAddress?: string;

  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Company contact person',
    required: false,
  })
  @IsString()
  @IsOptional()
  companyContact?: string;

  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Company contact person middle name',
    required: false,
  })
  @IsString()
  @IsOptional()
  middleName?: string;

  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Company contact person title',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Company department',
    required: false,
  })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiPropertyOptional({
    example: 'call me',
    description: 'best way to contact',
    required: false,
  })
  @IsString()
  @IsOptional()
  bestWayToContact?: string;
}
