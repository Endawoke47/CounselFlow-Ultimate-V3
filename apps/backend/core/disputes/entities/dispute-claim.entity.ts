import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
import { Dispute } from './dispute.entity';

export enum ClaimStatus {
  ACTIVE = 'Active',
  PENDING = 'Pending',
  RESOLVED = 'Resolved',
  DISMISSED = 'Dismissed',
}

@TypeOrmEntity('dispute_claims')
export class DisputeClaim {
  @ApiProperty({
    description: 'Unique identifier for the dispute claim',
    example: 1,
  })
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id!: number;

  @ApiProperty({
    description: 'The dispute this claim belongs to',
    example: 'Dispute instance',
  })
  @ManyToOne(() => Dispute, dispute => dispute.claims, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dispute_id' })
  dispute!: Dispute;

  @ApiProperty({
    description: 'Type or category of the claim',
    example: 'Breach of Contract',
  })
  @Column()
  claimType!: string;

  @ApiProperty({
    description: 'Current status of the claim',
    example: ClaimStatus.ACTIVE,
    enum: ClaimStatus,
    enumName: 'ClaimStatus',
  })
  @Column({ type: 'enum', enum: ClaimStatus, default: ClaimStatus.PENDING })
  status!: ClaimStatus;

  @ApiPropertyOptional({
    description: 'User who created this claim record',
    example: 'User instance',
  })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by_id' })
  createdBy?: User;

  @ApiProperty({
    description: 'The date and time the claim was created',
    example: '2023-01-01T00:00:00.000Z',
  })
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @ApiProperty({
    description: 'The date and time the claim was last updated',
    example: '2023-01-10T00:00:00.000Z',
  })
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ApiPropertyOptional({
    description: 'The date and time the claim was deleted',
    example: '2023-02-01T00:00:00.000Z',
    nullable: true,
  })
  @DeleteDateColumn({ name: 'deleted_at', nullable: true, type: 'timestamptz' })
  deletedAt?: Date | null;
}
