import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Company } from 'src/modules/companies/entities/company.entity';
import { Matter } from 'src/modules/matters/entities/matter.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Entity as TypeOrmEntity,
  UpdateDateColumn,
} from 'typeorm';
import { ContractParty } from './contract-party.entity';

export enum ContractType {
  SALES = 'Sales',
  PROCUREMENT = 'Procurement',
  EMPLOYMENT = 'Employment',
  REAL_ESTATE = 'Real Estate',
  INTELLECTUAL_PROPERTY = 'Intellectual Property',
  FINANCIAL = 'Financial',
  PARTNERSHIP = 'Partnership',
  CONFIDENTIALITY = 'Confidentiality',
  COMPLIANCE = 'Compliance',
  OTHER = 'Other',
}

export enum ContractStatus {
  DRAFT = 'Draft',
  UNDER_REVIEW = 'Under Review',
  IN_NEGOTIATION = 'In Negotiation',
  EXECUTED = 'Executed',
  ACTIVE = 'Active',
  EXPIRED = 'Expired',
  TERMINATED = 'Terminated',
}

export enum Priority {
  CRITICAL = 'Critical',
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low',
}

@TypeOrmEntity('contracts')
export class Contract {
  @ApiProperty({
    description: 'Unique identifier for the contract',
    example: 1,
  })
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id!: number;

  @ApiPropertyOptional({
    description: 'Links the contract to a related legal matter if applicable',
    example: 'Matter instance',
  })
  @ManyToOne(() => Matter, { nullable: true })
  @JoinColumn({ name: 'matter_id' })
  matter?: Matter;

  @ApiPropertyOptional({
    description: 'The primary company owning this contract',
    example: 'Company instance',
  })
  @ManyToOne(() => Company, { nullable: true })
  @JoinColumn({ name: 'owning_company_id' })
  owningCompany?: Company;

  @ApiProperty({
    description: 'Descriptive name of the contract',
    example: 'Master Services Agreement with Acme Corp',
  })
  @Column()
  title!: string;

  @ApiProperty({
    description: 'Broad category of the contract',
    example: ContractType.SALES,
    enum: ContractType,
    enumName: 'ContractType',
  })
  @Column({ type: 'enum', enum: ContractType })
  type!: ContractType;

  @ApiPropertyOptional({
    description: 'Detailed explanation of the contract purpose and scope',
    example:
      'This agreement covers all consulting services provided to Acme Corp for their digital transformation project.',
  })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({
    description: 'Current status of the contract',
    example: ContractStatus.ACTIVE,
    enum: ContractStatus,
    enumName: 'ContractStatus',
  })
  @Column({ type: 'enum', enum: ContractStatus, default: ContractStatus.DRAFT })
  status!: ContractStatus;

  @ApiPropertyOptional({
    description: 'Business importance of the contract',
    example: Priority.HIGH,
    enum: Priority,
    enumName: 'Priority',
    nullable: true,
  })
  @Column({
    type: 'enum',
    enum: Priority,
    default: Priority.MEDIUM,
    nullable: true,
  })
  priority?: Priority;

  @ApiProperty({
    description: 'List of companies with roles/signatories',
    example: [{ company_id: '1', role: 'Vendor', signatory: 'John Doe' }],
    isArray: true,
  })
  @OneToMany(() => ContractParty, party => party.contract)
  parties!: ContractParty[];

  @ApiPropertyOptional({
    description: 'Primary counterparty company',
    example: 'Company instance',
  })
  @ManyToOne(() => Company, { nullable: true })
  @JoinColumn({ name: 'counterparty_id' })
  counterparty?: Company;

  @ApiPropertyOptional({
    description: 'Name of the primary counterparty',
    example: 'Acme Corporation',
  })
  @Column({ nullable: true })
  counterpartyName?: string;

  @ApiPropertyOptional({
    description: 'When the contract obligations become effective',
    example: '2023-01-01',
  })
  @Column({ type: 'date', nullable: true })
  effectiveDate?: Date;

  @ApiPropertyOptional({
    description: 'Date when all parties have signed',
    example: '2022-12-15',
  })
  @Column({ type: 'date', nullable: true })
  executionDate?: Date;

  @ApiPropertyOptional({
    description: 'When the contract naturally ends, if applicable',
    example: '2024-12-31',
  })
  @Column({ type: 'date', nullable: true })
  expirationDate?: Date;

  @ApiPropertyOptional({
    description: 'Total monetary value of the contract',
    example: 100000.0,
  })
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  valueAmount?: number;

  @ApiPropertyOptional({
    description: 'Currency code for value_amount',
    example: 'USD',
  })
  @Column({ length: 10, nullable: true })
  valueCurrency?: string;

  @ApiPropertyOptional({
    description: 'Description of payment schedule and requirements',
    example: 'Monthly installments of $10,000 due on the 1st of each month',
  })
  @Column({ type: 'text', nullable: true })
  paymentTerms?: string;

  @ApiPropertyOptional({
    description: 'In-house lawyer/attorney overseeing the contract',
    example: 'User instance',
  })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'internal_legal_owner_id' })
  internalLegalOwner?: User;

  @ApiPropertyOptional({
    description: 'User who created the contract',
    example: 'User instance',
  })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User;

  @ApiPropertyOptional({
    description:
      'Document access - references the primary contract document (final PDF) for MVP',
    example: 123,
    // TODO: Add foreign key relationship to Document entity when implemented
  })
  @Column({ nullable: true })
  documentId?: number;

  @ApiPropertyOptional({
    description: 'General internal notes or comments',
    example: 'This contract replaces our previous agreement from 2020',
  })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({
    description: 'The date and time the contract was created',
    example: '2023-01-01T00:00:00.000Z',
  })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'The date and time the contract was last updated',
    example: '2023-01-10T00:00:00.000Z',
  })
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;

  @ApiPropertyOptional({
    description: 'The date and time the contract was deleted',
    example: '2023-02-01T00:00:00.000Z',
    nullable: true,
  })
  @DeleteDateColumn({
    name: 'deleted_at',
    nullable: true,
    type: 'timestamptz',
  })
  deletedAt?: Date | null;
}
