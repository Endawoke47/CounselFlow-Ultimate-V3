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
import { DisputeClaim } from './dispute-claim.entity';
import { DisputeParty } from './dispute-party.entity';

export enum DisputeType {
  LITIGATION = 'Litigation',
  ARBITRATION = 'Arbitration',
  MEDIATION = 'Mediation',
}

export enum DisputeStatus {
  PRE_FILING = 'Pre-Filing',
  FILED = 'Filed',
  DISCOVERY = 'Discovery',
  HEARING_TRIAL = 'Hearing/Trial',
  SETTLEMENT_DISCUSSIONS = 'Settlement Discussions',
  RESOLVED = 'Resolved',
  APPEAL = 'Appeal',
  CLOSED = 'Closed',
}

export enum ResolutionMethod {
  DIRECT_NEGOTIATION = 'Direct Negotiation',
  MEDIATION = 'Mediation',
  ARBITRATION = 'Arbitration',
  LITIGATION = 'Litigation',
  SETTLEMENT = 'Settlement',
  REGULATORY_RESOLUTION = 'Regulatory Resolution',
}

export enum RiskLevel {
  VERY_HIGH = 'Very High',
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low',
  VERY_LOW = 'Very Low',
}

export enum ResolutionType {
  SETTLEMENT = 'Settlement',
  JUDGMENT = 'Judgment',
  DISMISSAL = 'Dismissal',
  WITHDRAWAL = 'Withdrawal',
  OTHER = 'Other',
}

@TypeOrmEntity('disputes')
export class Dispute {
  @ApiProperty({
    description: 'Unique identifier for the dispute',
    example: 1,
  })
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id!: number;

  @ApiPropertyOptional({
    description: 'Links the dispute to a related legal matter if applicable',
    example: 'Matter instance',
  })
  @ManyToOne(() => Matter, { nullable: true })
  @JoinColumn({ name: 'matter_id' })
  matter?: Matter;

  @ApiProperty({
    description: 'Descriptive name of the dispute',
    example: 'Late Delivery Penalty Dispute with Acme Corp',
  })
  @Column()
  title!: string;

  @ApiProperty({
    description: 'Broad category of the dispute',
    example: DisputeType.LITIGATION,
    enum: DisputeType,
    enumName: 'DisputeType',
  })
  @Column({ type: 'enum', enum: DisputeType })
  type!: DisputeType;

  @ApiProperty({
    description: 'Current status of the dispute',
    example: DisputeStatus.PRE_FILING,
    enum: DisputeStatus,
    enumName: 'DisputeStatus',
  })
  @Column({
    type: 'enum',
    enum: DisputeStatus,
    default: DisputeStatus.PRE_FILING,
  })
  status!: DisputeStatus;

  @ApiPropertyOptional({
    description: 'Detailed explanation of the dispute and its background',
    example:
      'Dispute regarding the interpretation of delivery timeline in section 3.2 of the contract',
  })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiPropertyOptional({
    description: 'The company that initiated this dispute',
    example: 'Company instance',
  })
  @ManyToOne(() => Company, { nullable: true })
  @JoinColumn({ name: 'initiating_company_id' })
  initiatingCompany?: Company;

  @ApiProperty({
    description: 'List of parties involved in the dispute',
    example: [
      { company_id: '1', role: 'Plaintiff', representative: 'John Doe' },
    ],
    isArray: true,
  })
  @OneToMany(() => DisputeParty, party => party.dispute)
  parties!: DisputeParty[];

  @ApiPropertyOptional({
    description: 'Lead attorney overseeing the dispute',
    example: 'User instance',
  })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'lead_attorney_id' })
  leadAttorney?: User;

  @ApiPropertyOptional({
    description: 'Jurisdiction where the dispute is being handled',
    example: 'New York Supreme Court',
  })
  @Column({ nullable: true })
  jurisdiction?: string;

  @ApiPropertyOptional({
    description: 'Date when the dispute was formally filed',
    example: '2023-01-01',
  })
  @Column({ type: 'date', nullable: true })
  filingDate?: Date;

  @ApiPropertyOptional({
    description: 'Key dates and deadlines related to the dispute',
    example: { discoveryDeadline: '2023-03-01', trialDate: '2023-06-15' },
  })
  @Column({ type: 'jsonb', nullable: true })
  keyDates?: Record<string, string>;

  @ApiProperty({
    description: 'List of specific claims associated with the dispute',
    type: () => [DisputeClaim],
    isArray: true,
  })
  @OneToMany(() => DisputeClaim, claim => claim.dispute)
  claims!: DisputeClaim[];

  @ApiPropertyOptional({
    description: 'Monetary amount claimed in the dispute',
    example: 100000.0,
  })
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  amountClaimed?: number;

  @ApiPropertyOptional({
    description: 'Currency code for amount_claimed',
    example: 'USD',
  })
  @Column({ length: 10, nullable: true })
  currency?: string;

  @ApiPropertyOptional({
    description: 'Estimated cost of resolving the dispute',
    example: 50000.0,
  })
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  estimatedCost?: number;

  @ApiPropertyOptional({
    description: 'Actual cost incurred in resolving the dispute',
    example: 45000.0,
  })
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  actualCost?: number;

  @ApiPropertyOptional({
    description: 'Overall risk rating for the dispute',
    example: RiskLevel.HIGH,
    enum: RiskLevel,
    enumName: 'RiskLevel',
  })
  @Column({ type: 'enum', enum: RiskLevel, nullable: true })
  riskAssessment?: RiskLevel;

  @ApiPropertyOptional({
    description: 'The type of resolution achieved',
    example: ResolutionType.SETTLEMENT,
    enum: ResolutionType,
    enumName: 'ResolutionType',
  })
  @Column({ type: 'enum', enum: ResolutionType, nullable: true })
  resolutionType?: ResolutionType;

  @ApiPropertyOptional({
    description: 'Date when the dispute was resolved',
    example: '2023-05-15',
  })
  @Column({ type: 'date', nullable: true })
  resolutionDate?: Date;

  @ApiPropertyOptional({
    description: 'Summary of the resolution outcome',
    example: 'Settled for 75% of claimed amount with confidentiality clause',
  })
  @Column({ type: 'text', nullable: true })
  resolutionSummary?: string;

  @ApiPropertyOptional({
    description: 'General internal notes or comments',
    example: 'Weekly status updates required for executive team',
  })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiPropertyOptional({
    description: 'User who created the dispute record',
    example: 'User instance',
  })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User;

  @ApiProperty({
    description: 'The date and time the dispute was created',
    example: '2023-01-01T00:00:00.000Z',
  })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'The date and time the dispute was last updated',
    example: '2023-01-10T00:00:00.000Z',
  })
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;

  @ApiPropertyOptional({
    description: 'The date and time the dispute was deleted',
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
