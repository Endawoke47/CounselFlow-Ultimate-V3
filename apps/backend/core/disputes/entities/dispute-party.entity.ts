import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Company } from 'src/modules/companies/entities/company.entity';
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

export enum DisputePartyRole {
  PLAINTIFF = 'Plaintiff',
  DEFENDANT = 'Defendant',
  THIRD_PARTY = 'Third Party',
  WITNESS = 'Witness',
  EXPERT = 'Expert',
}

@TypeOrmEntity('dispute_parties')
export class DisputeParty {
  @ApiProperty({
    description: 'Unique identifier for the dispute party link',
    example: 1,
  })
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id!: number;

  @ApiProperty({
    description: 'The dispute this party is associated with',
    example: 'Dispute instance',
  })
  @ManyToOne(() => Dispute, dispute => dispute.parties, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dispute_id' })
  dispute!: Dispute;

  @ApiProperty({
    description: 'The company involved in the dispute',
    example: 'Company instance',
  })
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company!: Company;

  @ApiProperty({
    description: 'The role of this party in the dispute',
    example: DisputePartyRole.PLAINTIFF,
    enum: DisputePartyRole,
    enumName: 'DisputePartyRole',
  })
  @Column({ type: 'enum', enum: DisputePartyRole })
  role!: DisputePartyRole;

  @ApiPropertyOptional({
    description: 'User who added this party to the dispute',
    example: 'User instance',
  })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by_id' })
  createdBy?: User;

  @ApiProperty({
    description: 'The date and time the party link was created',
    example: '2023-01-01T00:00:00.000Z',
  })
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @ApiProperty({
    description: 'The date and time the party link was last updated',
    example: '2023-01-10T00:00:00.000Z',
  })
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ApiPropertyOptional({
    description: 'The date and time the party link was deleted',
    example: '2023-02-01T00:00:00.000Z',
    nullable: true,
  })
  @DeleteDateColumn({ name: 'deleted_at', nullable: true, type: 'timestamptz' })
  deletedAt?: Date | null;
}
