import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CompanyAccount } from 'src/modules/companies/entities/company-account.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('accounts')
export default class Account {
  @ApiProperty({
    description: 'The unique identifier of the account',
    example: 1,
  })
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id!: number;

  @ApiProperty({
    description: 'The size of the organization',
    example: 'CORPORATION',
  })
  @Column('varchar', { name: 'organization_size', length: 250 })
  organizationSize!: string;

  @ApiProperty({
    description: 'Whether this account has admin privileges',
    example: false,
  })
  @Column('boolean', { name: 'is_admin', default: false })
  public isAdmin!: boolean;

  @ApiProperty({
    description: 'Company accounts associated with this account',
    type: 'array',
    isArray: true,
    items: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 2 },
        companyType: { type: 'string', example: 'ADMIN' },
        companyId: { type: 'number', example: 2 },
        accountId: { type: 'number', example: 2 },
        company: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 2 },
            contact: { type: 'string', example: '1PD' },
            name: { type: 'string', example: '1PD' },
            description: { type: 'string', nullable: true },
            email: { type: 'string', nullable: true },
            phone: { type: 'string', nullable: true },
            website: { type: 'string', nullable: true },
            number: { type: 'string', nullable: true },
            address: { type: 'string', example: '1PD' },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2025-04-07T09:31:02.968Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2025-04-07T09:31:02.968Z',
            },
            deletedAt: { type: 'string', format: 'date-time', nullable: true },
          },
        },
      },
    },
  })
  @OneToMany(() => CompanyAccount, companyAccount => companyAccount.account)
  @JoinColumn({ name: 'companies_accounts' })
  public companyAccounts!: CompanyAccount[];

  @ApiPropertyOptional({
    description: 'The user who created this account',
    type: 'object',
    nullable: true,
    properties: {
      id: { type: 'number', example: 1 },
      email: { type: 'string', example: 'user@example.com' },
      firstName: { type: 'string', example: 'John' },
      lastName: { type: 'string', example: 'Doe' },
    },
  })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn([
    {
      name: 'created_by',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'fk_account_created_by',
    },
  ])
  createdBy?: User | null;

  @ApiProperty({
    description: 'The date and time the account was created',
    example: '2021-01-01T00:00:00.000Z',
  })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'The date and time the account was last updated',
    example: '2021-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;

  @ApiPropertyOptional({
    description: 'The date and time the account was deleted',
    example: '2021-01-01T00:00:00.000Z',
    nullable: true,
  })
  @DeleteDateColumn({
    name: 'deleted_at',
    nullable: true,
    type: 'timestamptz',
  })
  deletedAt?: Date | null;
}
