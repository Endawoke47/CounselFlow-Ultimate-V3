import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CompanyAccountType } from '../entities/company-account.entity';
import {
  CompanyStatus,
  DirectorInfo,
  ShareholderInfo,
} from '../entities/company.entity';

class ShareholderInfoDto implements ShareholderInfo {
  @ApiProperty({
    description: 'Name of the shareholder',
    example: 'XYZ Holding Company',
  })
  @IsString()
  @IsNotEmpty()
  shareholder_name!: string;

  @ApiProperty({ description: 'Percentage of ownership', example: 100 })
  @IsNumber()
  @IsNotEmpty()
  ownership_percentage!: number;

  @ApiPropertyOptional({ description: 'Class of shares', example: 'Common' })
  @IsString()
  @IsOptional()
  share_class?: string;
}

class DirectorInfoDto implements DirectorInfo {
  @ApiProperty({ description: 'Name of the director', example: 'Jane Doe' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Title of the director',
    example: 'Managing Director',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({
    description: 'Start date of directorship',
    example: '2020-01-01',
  })
  @IsString()
  @IsOptional()
  start_date?: string;
}

export class CreateCompanyDto {
  @ApiProperty({
    example: 'My company',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({
    example: 'Company description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'info@mycompany.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: '+1 (555) 123-4567',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: 'https://mycompany.com',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({
    example: 'Khreschatyk str. 1',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    example: '1234567890',
    description: 'Company registration number or identifier',
    required: false,
  })
  @IsOptional()
  @IsString()
  number?: string;

  @ApiPropertyOptional({
    example: 41331,
    required: false,
    description: 'City ID (optional for client companies)',
  })
  @IsOptional()
  @IsInt()
  cityId?: number;

  @ApiProperty({
    example: 228,
  })
  @IsNotEmpty()
  @IsInt()
  countryId!: number;

  @ApiPropertyOptional({
    example: 3779,
    required: false,
    description: 'State ID (optional for client companies)',
  })
  @IsOptional()
  @IsInt()
  stateId?: number;

  @ApiProperty({
    example: 'LAWYER',
    description: '',
    required: true,
    enum: CompanyAccountType,
    enumName: 'CompanyAccountType',
  })
  @IsEnum(CompanyAccountType)
  type!: CompanyAccountType;

  @ApiProperty({
    example: 3779,
  })
  @IsNotEmpty()
  @IsInt()
  accountId!: number;

  @ApiPropertyOptional({
    example: [1],
    description: 'Category IDs',
    required: false,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  categoryIds?: number[];

  @ApiPropertyOptional({
    example: [1],
    description: 'Sector IDs',
    required: false,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  sectorIds?: number[];

  @ApiPropertyOptional({
    example: 'Contact details',
    description: 'Contact details text field',
    required: false,
  })
  @IsOptional()
  @IsString()
  contact?: string;

  // Entity fields
  @ApiPropertyOptional({
    description: 'Information about shareholders',
    example: [
      {
        shareholder_name: 'XYZ Holding Company',
        ownership_percentage: 100,
        share_class: 'Common',
      },
    ],
    type: [ShareholderInfoDto],
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShareholderInfoDto)
  @IsOptional()
  shareholdersInfo?: ShareholderInfoDto[];

  @ApiPropertyOptional({
    description: 'Information about key directors',
    example: [
      {
        name: 'Jane Doe',
        title: 'Managing Director',
        start_date: '2020-01-01',
      },
    ],
    type: [DirectorInfoDto],
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DirectorInfoDto)
  @IsOptional()
  directorsInfo?: DirectorInfoDto[];

  @ApiPropertyOptional({
    description: 'Overall status of the company',
    example: CompanyStatus.ACTIVE,
    enum: CompanyStatus,
  })
  @IsEnum(CompanyStatus)
  @IsOptional()
  status?: CompanyStatus;

  @ApiPropertyOptional({
    description: 'Jurisdiction where the company is incorporated',
    example: 'United States',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  jurisdictionOfIncorporation?: string;

  @ApiPropertyOptional({
    description: 'Date when the company was incorporated',
    example: '2021-01-01',
  })
  @IsDateString()
  @IsOptional()
  incorporationDate?: string;

  @ApiPropertyOptional({
    description: 'Tax identification number of the company',
    example: '12-3456789',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  taxId?: string;

  @ApiPropertyOptional({
    description: 'Business registration number of the company',
    example: 'REG123456',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  businessRegNumber?: string;

  @ApiPropertyOptional({
    description: 'Registered address of the company',
    example: '123 Main St, City, State, ZIP',
  })
  @IsString()
  @IsOptional()
  registeredAddress?: string;

  @ApiPropertyOptional({
    description: 'Industry sector of the company',
    example: 'Technology',
  })
  @IsString()
  @IsOptional()
  industrySector?: string;

  @ApiPropertyOptional({
    description: 'End date of the fiscal year',
    example: '2021-12-31',
    nullable: true,
  })
  @IsDateString()
  @IsOptional()
  fiscalYearEnd?: string | null;

  @ApiPropertyOptional({
    description: 'Currency used for financial reporting',
    example: 'USD',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  reportingCurrency?: string | null;

  @ApiPropertyOptional({
    description: 'List of regulatory bodies overseeing the company',
    example: ['SEC', 'FINRA'],
    isArray: true,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  regulatoryBodies?: string[];

  @ApiPropertyOptional({
    description: 'Additional notes about the company',
    example: 'This company is a subsidiary of...',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  notes?: string | null;

  @ApiPropertyOptional({
    description: 'ID of the user who created this company',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  createdById?: number;

  @ApiPropertyOptional({
    description: 'ID of the parent company',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  parentId?: number;

  @ApiPropertyOptional({
    description: 'IDs of child companies',
    example: [2, 3, 4],
    type: [Number],
    isArray: true,
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  childrenIds?: number[];
}
