import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Company } from 'src/modules/companies/entities/company.entity';
import { Contract } from 'src/modules/contracts/entities/contract.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Entity as TypeOrmEntity,
  UpdateDateColumn,
} from 'typeorm';

@TypeOrmEntity('contract_parties')
export class ContractParty {
  @ApiProperty({
    description: 'Unique identifier for the contract party',
    example: 1,
  })
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id!: number;

  @ApiProperty({
    description: 'The contract this party is associated with',
    example: 'Contract instance',
  })
  @ManyToOne(() => Contract, { nullable: false })
  @JoinColumn({ name: 'contract_id' })
  contract!: Contract;

  @ApiProperty({
    description: 'The company that is a party to the contract',
    example: 'Company instance',
  })
  @ManyToOne(() => Company, { nullable: false })
  @JoinColumn({ name: 'company_id' })
  company!: Company;

  @ApiProperty({
    description: 'The role of this party in the contract',
    example: 'Vendor',
  })
  @Column()
  role!: string;

  @ApiProperty({
    description: 'The signatory representing this party',
    example: 'John Doe',
  })
  @Column()
  signatory!: string;

  @ApiPropertyOptional({
    description: 'User who created this contract party',
    example: 'User instance',
  })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User;

  @ApiProperty({
    description: 'The date and time the contract party was created',
    example: '2023-01-01T00:00:00.000Z',
  })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'The date and time the contract party was last updated',
    example: '2023-01-10T00:00:00.000Z',
  })
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;

  @ApiPropertyOptional({
    description: 'The date and time the contract party was deleted',
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
