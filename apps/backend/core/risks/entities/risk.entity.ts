import {
  RiskLikelihood,
  RiskMitigationStatus,
  RiskPriority,
  RiskReputationalImpact,
  RiskStatus,
  RiskTolerance,
} from '1pd-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Action } from 'src/modules/actions/entities/action.entity';
import { Company } from 'src/modules/companies/entities/company.entity';
import { Matter } from 'src/modules/matters/entities/matter.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Check,
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

@TypeOrmEntity('risks')
@Check(`"matter_id" IS NULL OR "company_id" IS NULL`)
@Check(`NOT ("matter_id" IS NULL AND "company_id" IS NULL)`)
@Check(`"score" >= 0 AND "score" <= 10`)
export class Risk {
  @ApiProperty({
    description: 'Unique identifier for each risk',
    example: 1,
  })
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id!: number;

  @ApiPropertyOptional({
    description:
      'Links to the Matter - risks can optionally be associated with a matter',
    example: 'Matter instance',
    nullable: true,
  })
  @ManyToOne(() => Matter, { nullable: true })
  @JoinColumn({ name: 'matter_id' })
  matter?: Matter;

  @ApiPropertyOptional({
    description:
      'Links to the Company - risks can optionally be associated with a company directly',
    example: 'Company instance',
    nullable: true,
  })
  @ManyToOne(() => Company, { nullable: true })
  @JoinColumn({ name: 'company_id' })
  company?: Company;

  @ApiProperty({
    description: 'Short title of the risk',
    example: 'Breach of Contract Penalty',
    type: 'string',
  })
  @Column('varchar', { name: 'name', length: 255, default: 'Unknown Title' })
  name!: string;

  @ApiProperty({
    description: 'Category of risk',
    example: 'Legal',
  })
  @Column('varchar', {
    name: 'category',
    length: 100,
    default: 'Uncategorized',
  })
  category!: string;

  @ApiProperty({
    description: 'Risk score on a scale from 0 to 10',
    example: 7.5,
    minimum: 0,
    maximum: 10,
  })
  @Column('decimal', {
    name: 'score',
    precision: 3,
    scale: 1,
    default: 5.0,
  })
  score!: number;

  @ApiProperty({
    description: 'Detailed explanation of the risk',
    example:
      'This risk involves potential penalties for late delivery as specified in section 4.2 of the contract.',
  })
  @Column('text', { name: 'description' })
  description!: string;

  @ApiProperty({
    description: 'Pre-control likelihood',
    example: RiskLikelihood.POSSIBLE,
    enum: RiskLikelihood,
  })
  @Column('varchar', {
    name: 'inherent_likelihood',
    length: 20,
    default: 'Medium',
  })
  inherentLikelihood!: string;

  @ApiPropertyOptional({
    description: 'Minimum estimated financial impact (in base currency)',
    example: 50000.0,
  })
  @Column('decimal', {
    name: 'financial_impact_min',
    precision: 15,
    scale: 2,
    nullable: true,
  })
  financialImpactMin?: number;

  @ApiPropertyOptional({
    description: 'Maximum estimated financial impact (in base currency)',
    example: 100000.0,
  })
  @Column('decimal', {
    name: 'financial_impact_max',
    precision: 15,
    scale: 2,
    nullable: true,
  })
  financialImpactMax?: number;

  @ApiPropertyOptional({
    description: 'Currency of financial impact',
    example: 'USD',
  })
  @Column('varchar', { name: 'currency', length: 10, nullable: true })
  currency?: string;

  @ApiProperty({
    description: 'Overall priority',
    example: RiskPriority.HIGH,
    enum: RiskPriority,
    enumName: 'RiskPriority',
  })
  @Column({
    type: 'enum',
    enum: RiskPriority,
    default: RiskPriority.MEDIUM,
  })
  priority!: RiskPriority;

  @ApiProperty({
    description: "Organization's stance",
    example: RiskTolerance.MITIGATE,
    enum: RiskTolerance,
  })
  @Column('varchar', { name: 'tolerance', length: 20, default: 'Medium' })
  tolerance!: string;

  @ApiPropertyOptional({
    description: 'Steps to reduce or eliminate the risk',
    example: 'Implement weekly progress reviews to ensure timely delivery.',
  })
  @Column('text', { name: 'mitigation_plan', nullable: true })
  mitigationPlan?: string;

  @ApiPropertyOptional({
    description: 'Status of mitigation efforts',
    example: RiskMitigationStatus.IN_PROGRESS,
    enum: RiskMitigationStatus,
  })
  @Column('varchar', { name: 'mitigation_status', length: 50, nullable: true })
  mitigationStatus?: string;

  @ApiPropertyOptional({
    description: 'Person responsible for managing the risk',
    example: 'User instance',
  })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'owner_id' })
  owner?: User;

  @ApiPropertyOptional({
    description: 'Code for the internal department overseeing the risk',
    example: 'LEG-001',
  })
  @Column('varchar', {
    name: 'internal_department_code',
    length: 50,
    nullable: true,
  })
  internalDepartmentCode?: string;

  @ApiPropertyOptional({
    description: 'Defines access permissions for related documents',
    example: 'Legal Team Only',
  })
  @Column('text', { name: 'document_access', nullable: true })
  documentAccess?: string;

  @ApiPropertyOptional({
    description: 'URLs, file paths, or references to underlying documents',
    example: ['/docs/risk_assessment.pdf', '/docs/contract_review.docx'],
    type: 'array',
    items: {
      type: 'string',
    },
    isArray: true,
  })
  @Column('jsonb', { name: 'document_links', nullable: true })
  documentLinks?: string[];

  @ApiPropertyOptional({
    description: 'Actions related to this risk',
    type: () => Action,
    isArray: true,
  })
  @OneToMany(() => Action, action => action.risk)
  actions?: Action[];

  @ApiPropertyOptional({
    description: 'Specific assessment of reputational impact',
    example: RiskReputationalImpact.MEDIUM,
    enum: RiskReputationalImpact,
  })
  @Column('varchar', {
    name: 'reputational_assessment',
    length: 20,
    nullable: true,
  })
  reputationalAssessment?: string;

  @ApiProperty({
    description: 'Date the risk was identified',
    example: '2023-01-15',
  })
  @Column('date', {
    name: 'identification_date',
    default: () => `('now'::text)::date`,
  })
  identificationDate!: Date;

  @ApiPropertyOptional({
    description: 'Next scheduled review date',
    example: '2023-04-15',
  })
  @Column('date', { name: 'review_date', nullable: true })
  reviewDate?: Date;

  @ApiPropertyOptional({
    description: 'Date the risk was resolved or accepted',
    example: '2023-06-30',
  })
  @Column('date', { name: 'resolution_date', nullable: true })
  resolutionDate?: Date;

  @ApiProperty({
    description: 'Indicates if the risk has regulatory impact',
    example: true,
  })
  @Column('boolean', { name: 'regulatory_implications', default: false })
  regulatoryImplications!: boolean;

  @ApiPropertyOptional({
    description: 'List of applicable regulations',
    example: ['GDPR', 'SOX'],
    type: 'array',
    items: {
      type: 'string',
    },
    isArray: true,
  })
  @Column('jsonb', { name: 'related_regulations', nullable: true })
  relatedRegulations?: string[];

  @ApiProperty({
    description: 'Current state of the risk',
    example: RiskStatus.ASSESSED,
    enum: RiskStatus,
  })
  @Column('varchar', { name: 'status', length: 50, default: 'Open' })
  status!: string;

  @ApiPropertyOptional({
    description: 'Additional information or comments',
    example: 'Risk level may change after Q3 financial review.',
  })
  @Column('text', { name: 'notes', nullable: true })
  notes?: string;

  @ApiPropertyOptional({
    description: 'The user who created the risk',
    example: 'User instance',
  })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User;

  @ApiProperty({
    description: 'The date and time the risk was created',
    example: '2023-01-01T00:00:00.000Z',
  })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'The date and time the risk was last updated',
    example: '2023-01-10T00:00:00.000Z',
  })
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;

  @ApiPropertyOptional({
    description: 'The date and time the risk was deleted',
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
