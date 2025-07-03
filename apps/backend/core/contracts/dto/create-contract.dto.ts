import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsDecimal,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import {
  ContractStatus,
  ContractType,
  Priority,
} from '../entities/contract.entity';

export class ContractPartyDto {
  @ApiProperty({
    description: 'ID of the company that is a party to the contract',
    example: '1',
  })
  @IsString()
  @IsNotEmpty()
  companyId!: string;

  @ApiProperty({
    description: 'The role of this party in the contract',
    example: 'Vendor',
  })
  @IsString()
  @IsNotEmpty()
  role!: string;

  @ApiProperty({
    description: 'The signatory representing this party',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  signatory!: string;
}

export class CreateContractDto {
  @ApiPropertyOptional({
    description: 'ID of the matter this contract is associated with',
    example: '1',
  })
  @IsString()
  @IsOptional()
  matterId?: string;

  @ApiPropertyOptional({
    description: 'ID of the company that owns this contract',
    example: '1',
  })
  @IsString()
  @IsOptional()
  owningCompanyId?: string;

  @ApiProperty({
    description: 'Descriptive name of the contract',
    example: 'Master Services Agreement with Acme Corp',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    description: 'Broad category of the contract',
    example: ContractType.SALES,
    enum: ContractType,
    enumName: 'ContractType',
  })
  @IsEnum(ContractType)
  @IsNotEmpty()
  type!: ContractType;

  @ApiPropertyOptional({
    description: 'Detailed explanation of the contract purpose and scope',
    example:
      'This agreement covers all consulting services provided to Acme Corp for their digital transformation project.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Current status of the contract',
    example: ContractStatus.DRAFT,
    enum: ContractStatus,
    enumName: 'ContractStatus',
  })
  @IsEnum(ContractStatus)
  @IsNotEmpty()
  status!: ContractStatus;

  @ApiPropertyOptional({
    description: 'Business importance of the contract',
    example: Priority.HIGH,
    enum: Priority,
    enumName: 'Priority',
  })
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @ApiPropertyOptional({
    description: 'List of companies with roles/signatories',
    example: [{ companyId: '1', role: 'Vendor', signatory: 'John Doe' }],
    type: [ContractPartyDto],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContractPartyDto)
  partiesInvolved?: ContractPartyDto[];

  @ApiPropertyOptional({
    description: 'ID of the primary counterparty company',
    example: '1',
  })
  @IsString()
  @IsOptional()
  counterpartyId?: string;

  @ApiPropertyOptional({
    description: 'Name of the primary counterparty',
    example: 'Acme Corporation',
  })
  @IsString()
  @IsOptional()
  counterpartyName?: string;

  @ApiPropertyOptional({
    description: 'When the contract obligations become effective',
    example: '2023-01-01',
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  effectiveDate?: Date;

  @ApiPropertyOptional({
    description: 'Date when all parties have signed',
    example: '2022-12-15',
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  executionDate?: Date;

  @ApiPropertyOptional({
    description: 'When the contract naturally ends, if applicable',
    example: '2024-12-31',
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  expirationDate?: Date;

  @ApiPropertyOptional({
    description: 'Total monetary value of the contract',
    example: 100000.0,
    type: 'number',
    format: 'float',
  })
  @Transform(({ value }) => {
    // For validation purposes only, convert to string
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    return value;
  })
  @IsDecimal({ decimal_digits: '2', force_decimal: false })
  @Type(() => Number) // Transform back to number after validation
  @IsOptional()
  valueAmount?: number;

  @ApiPropertyOptional({
    description: 'Currency code for value_amount',
    example: 'USD',
  })
  @IsString()
  @MaxLength(10)
  @IsOptional()
  valueCurrency?: string;

  @ApiPropertyOptional({
    description: 'Description of payment schedule and requirements',
    example: 'Monthly installments of $10,000 due on the 1st of each month',
  })
  @IsString()
  @IsOptional()
  paymentTerms?: string;

  @ApiPropertyOptional({
    description: 'ID of the in-house lawyer/attorney overseeing the contract',
    example: '1',
  })
  @IsString()
  @IsOptional()
  internalLegalOwnerId?: string;

  @ApiPropertyOptional({
    description:
      'Document access - references the primary contract document (final PDF) for MVP',
    example: 123,
  })
  @IsNumber()
  @IsOptional()
  documentId?: number;

  @ApiPropertyOptional({
    description: 'General internal notes or comments',
    example: 'This contract replaces our previous agreement from 2020',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
