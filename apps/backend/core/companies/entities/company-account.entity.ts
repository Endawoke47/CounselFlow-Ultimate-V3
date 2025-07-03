import { ApiProperty } from '@nestjs/swagger';
import Account from 'src/modules/accounts/entities/account.entity';
import { Company } from 'src/modules/companies/entities/company.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum CompanyAccountType {
  ADMIN = 'ADMIN',
  LAWYER = 'LAWYER',
  LAWYER_CUSTOMER = 'LAWYER_CUSTOMER',
  LAWYER_OUTSOURCE = 'LAWYER_OUTSOURCE',
}

/**
 * CompanyAccount Entity
 *
 * This is a junction entity that represents the many-to-many relationship between
 * companies and accounts, with additional metadata about the relationship type.
 *
 * It serves as the implementation for the "company access" concept, where accounts can be
 * associated with companies with specific roles:
 * - ADMIN: Full administrative access to the company
 * - LAWYER: Lawyer access to the company
 * - LAWYER_CUSTOMER: Customer access through a lawyer
 * - LAWYER_OUTSOURCE: Outsourced lawyer access
 *
 * The unique indexes ensure that an account can only have one role per company.
 */
@Entity('companies_accounts')
@Index('IDX_COMPANY_ACCOUNT_UNIQUE', ['companyId', 'accountId'], {
  unique: true,
})
export class CompanyAccount {
  @ApiProperty({
    description: 'The unique identifier of the company-account relationship',
    example: 1,
  })
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id!: number;

  @ApiProperty({
    description: 'The type of relationship between the company and account',
    example: CompanyAccountType.LAWYER,
    enum: CompanyAccountType,
    enumName: 'CompanyAccountType',
  })
  @Column({
    type: 'enum',
    enum: CompanyAccountType,
    default: CompanyAccountType.LAWYER,
  })
  public companyType!: CompanyAccountType;

  @ApiProperty({
    description: 'The ID of the company in the relationship',
    example: 1,
  })
  @Column({ name: 'company_id' })
  public companyId!: number;

  @ApiProperty({
    description: 'The ID of the account in the relationship',
    example: 1,
  })
  @Column({ name: 'account_id' })
  public accountId!: number;

  @ApiProperty({
    description: 'The company entity in the relationship',
    type: 'object',
    properties: {
      id: { type: 'number', example: 1 },
      name: { type: 'string', example: 'Acme Corporation' },
    },
  })
  @ManyToOne(() => Company, (company: Company) => company.companyAccounts)
  @JoinColumn([
    {
      name: 'company_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'fk_company_account_company',
    },
  ])
  public company!: Company;

  @ApiProperty({
    description: 'The account entity in the relationship',
    type: 'object',
    properties: {
      id: { type: 'number', example: 1 },
      email: { type: 'string', example: 'user@example.com' },
    },
  })
  @ManyToOne(() => Account, account => account.companyAccounts)
  @JoinColumn([
    {
      name: 'account_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'fk_company_account_account',
    },
  ])
  public account!: Account;
}
