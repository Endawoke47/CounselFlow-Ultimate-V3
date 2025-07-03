import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
  UpdateDateColumn,
} from 'typeorm';

import { Category } from 'src/modules/categories/entities/category.entity';
import { City } from 'src/modules/geo/entities/city.entity';
import { Country } from 'src/modules/geo/entities/country.entity';
import { State } from 'src/modules/geo/entities/state.entity';
import { Sector } from 'src/modules/sectors/entities/sector.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { CompanyAccount } from './company-account.entity';

export interface ShareholderInfo {
  shareholder_name: string;
  ownership_percentage: number;
  share_class?: string;
  [key: string]: any;
}

export interface DirectorInfo {
  name: string;
  title: string;
  start_date?: string;
  [key: string]: any;
}

export enum CompanyStatus {
  ACTIVE = 'Active',
  DISSOLVED = 'Dissolved',
  DORMANT = 'Dormant',
  IN_LIQUIDATION = 'In Liquidation',
  TARGET = 'Target',
}

@Entity('companies')
@Tree('closure-table', {
  closureTableName: 'company',
  ancestorColumnName: column => 'ancestor_' + column.propertyName,
  descendantColumnName: column => 'descendant_' + column.propertyName,
})
export class Company {
  @ApiProperty({
    description: 'The unique identifier of the company',
    example: 1,
  })
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id!: number;

  @ApiProperty({
    description: 'The name of the company',
    example: 'Acme Corporation',
  })
  @Column('varchar', { name: 'name', length: 255 })
  name!: string;

  @ApiPropertyOptional({
    description: 'A detailed description of the company',
    example: 'Leading provider of technological solutions',
    nullable: true,
  })
  @Column('text', { name: 'description', nullable: true })
  description?: string | null;

  @ApiPropertyOptional({
    description: 'Information about shareholders',
    example: [
      {
        shareholder_name: 'XYZ Holding Company',
        ownership_percentage: 100,
        share_class: 'Common',
      },
    ],
    type: 'array',
    isArray: true,
    items: {
      type: 'object',
      properties: {
        shareholder_name: { type: 'string' },
        ownership_percentage: { type: 'number' },
        share_class: { type: 'string' },
      },
    },
  })
  @Column('jsonb', { name: 'shareholders_info', nullable: true })
  shareholdersInfo?: ShareholderInfo[];

  @ApiPropertyOptional({
    description: 'Information about key directors',
    example: [
      {
        name: 'Jane Doe',
        title: 'Managing Director',
        start_date: '2020-01-01',
      },
    ],
    type: 'array',
    isArray: true,
    items: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        title: { type: 'string' },
        start_date: { type: 'string', format: 'date' },
      },
    },
  })
  @Column('jsonb', { name: 'directors_info', nullable: true })
  directorsInfo?: DirectorInfo[];

  @ApiPropertyOptional({
    description: 'Overall status of the company',
    example: CompanyStatus.ACTIVE,
    enum: CompanyStatus,
  })
  @Column('varchar', { name: 'status', length: 50, nullable: true })
  status?: CompanyStatus;

  @ApiPropertyOptional({
    description: 'Jurisdiction where the company is incorporated',
    example: 'United States',
  })
  @Column('varchar', {
    name: 'jurisdiction_of_incorporation',
    length: 100,
    nullable: true,
  })
  jurisdictionOfIncorporation?: string;

  @ApiPropertyOptional({
    description: 'Date when the company was incorporated',
    example: '2021-01-01',
  })
  @Column('date', { name: 'incorporation_date', nullable: true })
  incorporationDate?: Date;

  @ApiPropertyOptional({
    description: 'Tax identification number of the company',
    example: '12-3456789',
  })
  @Column('varchar', { name: 'tax_id', length: 100, nullable: true })
  taxId?: string;

  @ApiPropertyOptional({
    description: 'Business registration number of the company',
    example: 'REG123456',
  })
  @Column('varchar', {
    name: 'business_reg_number',
    length: 100,
    nullable: true,
  })
  businessRegNumber?: string;

  @ApiPropertyOptional({
    description: 'Registered address of the company',
    example: '123 Main St, City, State, ZIP',
  })
  @Column('text', { name: 'registered_address', nullable: true })
  registeredAddress?: string;

  @ApiPropertyOptional({
    description: 'Industry sector of the company',
    example: 'Technology',
  })
  @Column('text', { name: 'industry_sector', nullable: true })
  industrySector?: string;

  @ApiPropertyOptional({
    description: 'End date of the fiscal year',
    example: '2021-12-31',
    nullable: true,
  })
  @Column('date', { name: 'fiscal_year_end', nullable: true })
  fiscalYearEnd?: Date | null;

  @ApiPropertyOptional({
    description: 'Currency used for financial reporting',
    example: 'USD',
    nullable: true,
  })
  @Column('varchar', { name: 'reporting_currency', length: 50, nullable: true })
  reportingCurrency?: string | null;

  @ApiPropertyOptional({
    description: 'List of regulatory bodies overseeing the company',
    example: ['SEC', 'FINRA'],
    isArray: true,
  })
  @Column('text', { name: 'regulatory_bodies', array: true, nullable: true })
  regulatoryBodies?: string[];

  @ApiPropertyOptional({
    description: 'Additional notes about the company',
    example: 'This company is a subsidiary of...',
    nullable: true,
  })
  @Column('text', { name: 'notes', nullable: true })
  notes?: string | null;

  @ApiProperty({
    description: 'Contact information for the company',
    example: 'John Doe, CFO',
    nullable: true,
  })
  @Column('text', { name: 'contact', nullable: true })
  contact!: string | null;

  @ApiPropertyOptional({
    description: 'The email address of the company',
    example: 'contact@acmecorp.com',
    nullable: true,
  })
  @Column('varchar', { name: 'email', length: 255, nullable: true })
  email?: string | null;

  @ApiPropertyOptional({
    description: 'The phone number of the company',
    example: '+1 (555) 123-4567',
    nullable: true,
  })
  @Column('varchar', { name: 'phone', length: 50, nullable: true })
  phone?: string | null;

  @ApiPropertyOptional({
    description: 'The website URL of the company',
    example: 'https://www.acmecorp.com',
    nullable: true,
  })
  @Column('varchar', { name: 'website', length: 255, nullable: true })
  website?: string | null;

  @ApiPropertyOptional({
    description: 'Company number (e.g., client or registration number)',
    example: 'AC12345678',
    nullable: true,
  })
  @Column('varchar', {
    name: 'number',
    length: 255,
    nullable: true,
    comment: 'Company number, e.g. client number',
  })
  number?: string | null;

  @ApiPropertyOptional({
    description: 'The physical address of the company',
    example: '123 Main St, Suite 500',
    nullable: true,
  })
  @Column('varchar', { name: 'address', length: 255, nullable: true })
  address?: string | null;

  @ApiProperty({
    description: 'The city where the company is located',
    type: 'object',
    properties: {
      id: { type: 'number', example: 1 },
      name: { type: 'string', example: 'Los Angeles' },
    },
  })
  @ManyToOne(() => City, city => city.companies)
  @JoinColumn([{ name: 'city_id', referencedColumnName: 'id' }])
  city!: City;

  @ApiProperty({
    description: 'The country where the company is located',
    type: 'object',
    properties: {
      id: { type: 'number', example: 1 },
      name: { type: 'string', example: 'United States' },
      shortname: { type: 'string', example: 'USA' },
    },
  })
  @ManyToOne(() => Country, country => country.companies)
  @JoinColumn([{ name: 'country_id', referencedColumnName: 'id' }])
  country!: Country;

  @ApiProperty({
    description: 'The state/province where the company is located',
    type: 'object',
    properties: {
      id: { type: 'number', example: 1 },
      name: { type: 'string', example: 'California' },
    },
  })
  @ManyToOne(() => State, states => states.companies)
  @JoinColumn([{ name: 'state_id', referencedColumnName: 'id' }])
  state!: State;

  @ApiProperty({
    description: 'Categories the company belongs to',
    type: 'array',
    isArray: true,
    items: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'Technology' },
      },
    },
  })
  @ManyToMany(() => Category, category => category.companies)
  @JoinTable()
  categories!: Category[];

  @ApiProperty({
    description: 'Sectors the company operates in',
    type: 'array',
    isArray: true,
    items: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'Finance' },
      },
    },
  })
  @ManyToMany(() => Sector, sector => sector.companies)
  @JoinTable()
  sectors!: Sector[];

  @ApiProperty({
    description: 'Child companies (subsidiaries) of this company',
    type: () => Company,
    isArray: true,
  })
  @TreeChildren()
  children!: Company[];

  @ApiPropertyOptional({
    description: 'Parent company of this company',
    type: () => Company,
  })
  @TreeParent()
  parent?: Company;

  @ApiHideProperty()
  @OneToMany(() => User, (user: User) => user.company)
  users!: User[];

  @ApiHideProperty()
  @OneToMany(() => CompanyAccount, companyAccount => companyAccount.company, {
    onDelete: 'CASCADE',
  })
  companyAccounts!: CompanyAccount[];

  @ApiProperty({
    description: 'The date and time the company was created',
    example: '2023-01-01T00:00:00.000Z',
  })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'The date and time the company was last updated',
    example: '2023-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;

  @ApiPropertyOptional({
    description: 'The date and time the company was deleted',
    example: '2023-01-01T00:00:00.000Z',
    nullable: true,
  })
  @DeleteDateColumn({
    name: 'deleted_at',
    nullable: true,
    type: 'timestamptz',
  })
  deletedAt?: Date | null;
}
