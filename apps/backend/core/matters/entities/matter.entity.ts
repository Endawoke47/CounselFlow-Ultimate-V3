import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Company } from 'src/modules/companies/entities/company.entity';
import { Risk } from 'src/modules/risks/entities/risk.entity';
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

@TypeOrmEntity('matters')
export class Matter {
  @ApiProperty({
    description: 'The unique identifier of the matter',
    example: 1,
  })
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id!: number;

  @ApiProperty({
    description: 'Descriptive name/title of the matter',
    example: 'Matter Name',
  })
  @Column('varchar', { name: 'name', length: 255 })
  name!: string;

  @ApiProperty({
    description: 'Broad category (e.g., Contract, Litigation, Regulatory, IP)',
    example: 'Contract',
  })
  @Column('varchar', { name: 'type', length: 50, default: 'General' })
  type!: string;

  @ApiPropertyOptional({
    description:
      'Further specialization (e.g., "Patent Infringement" under IP)',
    example: 'Patent Infringement',
  })
  @Column('varchar', { name: 'subtype', length: 100, nullable: true })
  subtype?: string;

  @ApiProperty({
    description:
      'Current status (e.g., Active, Pending, Closed, On Hold, Escalated)',
    example: 'Active',
  })
  @Column('varchar', { name: 'status', length: 50, default: 'Open' })
  status!: string;

  @ApiPropertyOptional({
    description: 'Priority level (e.g., High, Medium, Low)',
    example: 'High',
  })
  @Column('varchar', { name: 'priority', length: 20, nullable: true })
  priority?: string;

  @ApiPropertyOptional({
    description: 'Detailed summary or background information',
    example: 'Matter description',
  })
  @Column('text', { name: 'description', nullable: true })
  description?: string;

  @ApiProperty({
    description: 'Links the matter to its primary entity',
    example: 'Company instance',
  })
  @ManyToOne(() => Company, { nullable: false })
  @JoinColumn({ name: 'company_id' })
  company!: Company;

  @ApiPropertyOptional({
    description:
      'A list of date/description pairs to track important milestones or deadlines',
    example: [{ date: '2025-05-30', description: 'Closing Deadline' }],
    isArray: true,
  })
  @Column('jsonb', { name: 'key_dates', nullable: true })
  keyDates?: Array<{ date: string; description: string }>;

  @ApiProperty({
    description: 'The date and time the matter was created',
    example: '2021-01-01T00:00:00.000Z',
  })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'The date and time the matter was last updated',
    example: '2021-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;

  @ApiPropertyOptional({
    description: 'The date and time the matter was deleted',
    example: '2021-01-01T00:00:00.000Z',
    nullable: true,
  })
  @DeleteDateColumn({
    name: 'deleted_at',
    nullable: true,
    type: 'timestamptz',
  })
  deletedAt?: Date | null;

  @ApiPropertyOptional({
    description: 'Risks associated with this matter',
    type: () => Risk,
    isArray: true,
  })
  @OneToMany(() => Risk, risk => risk.matter)
  risks?: Risk[];
}
