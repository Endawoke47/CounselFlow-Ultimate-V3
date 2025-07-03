import { TCreateActionResponse } from '1pd-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Matter } from 'src/modules/matters/entities/matter.entity';
import { Risk } from 'src/modules/risks/entities/risk.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
  Entity as TypeOrmEntity,
  UpdateDateColumn,
} from 'typeorm';

export enum ActionType {
  TASK = 'Task',
  APPROVAL = 'Approval',
  REVIEW = 'Review',
  MEETING = 'Meeting',
  DECISION = 'Decision',
  OTHER = 'Other',
}

export enum ActionStatus {
  NOT_STARTED = 'Not Started',
  IN_PROGRESS = 'In Progress',
  ON_HOLD = 'On Hold',
  COMPLETED = 'Completed',
  BLOCKED = 'Blocked',
  PENDING = 'Pending',
  OVERDUE = 'Overdue',
}

export enum ActionPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical',
}

export interface Attachment {
  name: string;
  path: string;
}

export interface ReminderSettings {
  reminder_offset_days?: number;
  reminder_type?: string;
  [key: string]: any;
}

@TypeOrmEntity('actions')
@Tree('closure-table', {
  closureTableName: 'action',
  ancestorColumnName: column => 'ancestor_' + column.propertyName,
  descendantColumnName: column => 'descendant_' + column.propertyName,
})
export class Action implements Omit<TCreateActionResponse, 'matterId'> {
  @ApiProperty({
    description: 'Unique identifier for the action item',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({
    description: 'Links this action item to a specific matter',
    example: 'Matter instance',
  })
  @ManyToOne(() => Matter, { nullable: false })
  @JoinColumn({ name: 'matter_id' })
  matter!: Matter;

  @ApiProperty({
    description: 'Short task title',
    example: 'File Motion to Dismiss',
  })
  @Column('text', { name: 'title' })
  title!: string;

  @ApiProperty({
    description: 'Detailed instructions or background for the action item',
    example:
      'Prepare and file a motion to dismiss based on lack of jurisdiction...',
  })
  @Column('text', { name: 'description' })
  description!: string;

  @ApiProperty({
    description: "Categorizes the action item's nature",
    example: ActionType.TASK,
    enum: ActionType,
    enumName: 'ActionType',
  })
  @Column({
    type: 'enum',
    enum: ActionType,
    name: 'type',
  })
  type!: ActionType;

  @ApiProperty({
    description: "Current status of the action item's lifecycle",
    example: ActionStatus.NOT_STARTED,
    enum: ActionStatus,
    enumName: 'ActionStatus',
  })
  @Column({
    type: 'enum',
    enum: ActionStatus,
    name: 'status',
  })
  status!: ActionStatus;

  @ApiProperty({
    description: 'Importance or urgency level',
    example: ActionPriority.MEDIUM,
    enum: ActionPriority,
    enumName: 'ActionPriority',
  })
  @Column({
    type: 'enum',
    enum: ActionPriority,
    name: 'priority',
  })
  priority!: ActionPriority;

  @ApiPropertyOptional({
    description:
      'The individual primarily responsible for completing this action',
    example: 'User instance',
  })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_to_id' })
  assignedTo?: User;

  @ApiProperty({
    description: 'When work should begin (planning start date)',
    example: '2023-01-01T09:00:00.000Z',
  })
  @Column('timestamptz', { name: 'start_date' })
  startDate!: Date;

  @ApiProperty({
    description: 'Final or target deadline for completion',
    example: '2023-01-15T17:00:00.000Z',
  })
  @Column('timestamptz', { name: 'due_date' })
  dueDate!: Date;

  @ApiPropertyOptional({
    description: 'Actual date/time when the action was completed',
    example: '2023-01-14T15:30:00.000Z',
  })
  @Column('timestamptz', { name: 'completion_date', nullable: true })
  completionDate?: Date;

  @ApiPropertyOptional({
    description:
      'List of Actions that must be completed before this action can start or finish',
    example: ['Action 1', 'Action 2'],
    isArray: true,
    type: () => Action,
  })
  @ManyToMany(() => Action)
  @JoinTable({
    name: 'action_dependencies',
    joinColumn: {
      name: 'action_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'dependency_id',
      referencedColumnName: 'id',
    },
  })
  dependencies?: Action[];

  @ApiProperty({
    description: 'Whether this action repeats periodically',
    example: false,
  })
  @Column('boolean', { name: 'recurring', default: false })
  recurring!: boolean;

  @ApiPropertyOptional({
    description: 'For recurring actions, describes the frequency',
    example: 'Every 30 days',
  })
  @Column('text', { name: 'recurrence_pattern', nullable: true })
  recurrencePattern?: string;

  @ApiPropertyOptional({
    description: 'Internal comments, updates, or collaboration notes',
    example: 'Discussed strategy with litigation team on 2023-01-05',
  })
  @Column('text', { name: 'notes', nullable: true })
  notes?: string;

  @ApiPropertyOptional({
    description: 'References or file paths to relevant documents',
    example: [
      { name: 'Draft Motion.docx', path: '/documents/12345' },
      { name: 'Reference Case.pdf', path: '/documents/67890' },
    ],
    isArray: true,
    type: 'array',
  })
  @Column('jsonb', { name: 'attachments', nullable: true })
  attachments?: Attachment[];

  @ApiPropertyOptional({
    description: 'Configuration for notifications',
    example: { reminder_offset_days: 7, reminder_type: 'email' },
  })
  @Column('jsonb', { name: 'reminder_settings', nullable: true })
  reminderSettings?: ReminderSettings;

  @ApiProperty({
    description: 'The date and time the action was created',
    example: '2023-01-01T00:00:00.000Z',
  })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'The date and time the action was last updated',
    example: '2023-01-02T00:00:00.000Z',
  })
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;

  @ApiPropertyOptional({
    description: 'The date and time the action was deleted',
    example: '2023-01-03T00:00:00.000Z',
    nullable: true,
  })
  @DeleteDateColumn({
    name: 'deleted_at',
    nullable: true,
    type: 'timestamptz',
  })
  deletedAt?: Date | null;

  @ApiProperty({
    description: 'Child actions (sub-actions) of this action',
    type: () => Action,
    isArray: true,
  })
  @TreeChildren()
  children!: Action[];

  @ApiPropertyOptional({
    description: 'Parent action of this action',
    type: () => Action,
  })
  @TreeParent()
  parent?: Action;

  @ApiPropertyOptional({
    description: 'Links this action to a specific risk',
    example: 'Risk instance',
    nullable: true,
  })
  @ManyToOne(() => Risk, risk => risk.actions, { nullable: true })
  @JoinColumn({ name: 'risk_id' })
  risk?: Risk;
}
