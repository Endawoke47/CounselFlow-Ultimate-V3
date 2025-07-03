import {
  ActionPriority,
  ActionStatus,
  ActionType,
  Attachment as AttachmentType,
  TCreateActionRequest,
} from '1pd-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class Attachment implements AttachmentType {
  @ApiProperty({
    description: 'The name of the attachment',
    example: 'Draft Motion.docx',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'The path to the attachment',
    example: '/documents/12345',
  })
  @IsString()
  @IsNotEmpty()
  path!: string;
}

export class CreateActionDto implements TCreateActionRequest {
  @ApiProperty({
    description: 'Links this action item to a specific matter',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  matterId!: number;

  @ApiProperty({
    description: 'Short task title',
    example: 'File Motion to Dismiss',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    description: 'Detailed instructions or background for the action item',
    example:
      'Prepare and file a motion to dismiss based on lack of jurisdiction...',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    description: "Categorizes the action item's nature",
    example: ActionType.TASK,
    enum: ActionType,
    enumName: 'ActionType',
  })
  @IsEnum(ActionType)
  @IsNotEmpty()
  type!: ActionType;

  @ApiProperty({
    description: "Current status of the action item's lifecycle",
    example: ActionStatus.NOT_STARTED,
    enum: ActionStatus,
    enumName: 'ActionStatus',
  })
  @IsEnum(ActionStatus)
  @IsNotEmpty()
  status!: ActionStatus;

  @ApiProperty({
    description: 'Importance or urgency level',
    example: ActionPriority.MEDIUM,
    enum: ActionPriority,
    enumName: 'ActionPriority',
  })
  @IsEnum(ActionPriority)
  @IsNotEmpty()
  priority!: ActionPriority;

  @ApiPropertyOptional({
    description:
      'ID of the user primarily responsible for completing this action',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  assignedToId?: number;

  @ApiProperty({
    description: 'When work should begin (planning start date)',
    example: '2023-01-01T09:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate!: string;

  @ApiProperty({
    description: 'Final or target deadline for completion',
    example: '2023-01-15T17:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  dueDate!: string;

  @ApiPropertyOptional({
    description: 'Actual date/time when the action was completed',
    example: '2023-01-14T15:30:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  completionDate?: string;

  @ApiPropertyOptional({
    description:
      'List of Action IDs that must be completed before this action can start or finish',
    example: [1, 2],
    isArray: true,
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  dependencyIds?: number[];

  @ApiProperty({
    description: 'Whether this action repeats periodically',
    example: false,
    default: false,
  })
  @IsBoolean()
  recurring: boolean = false;

  @ApiPropertyOptional({
    description: 'For recurring actions, describes the frequency',
    example: 'Every 30 days',
  })
  @IsString()
  @IsOptional()
  recurrencePattern?: string;

  @ApiPropertyOptional({
    description: 'Internal comments, updates, or collaboration notes',
    example: 'Discussed strategy with litigation team on 2023-01-05',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description: 'References or file paths to relevant documents',
    example: [
      { name: 'Draft Motion.docx', path: '/documents/12345' },
      { name: 'Reference Case.pdf', path: '/documents/67890' },
    ],
    type: [Attachment],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Attachment)
  attachments?: Attachment[];

  @ApiPropertyOptional({
    description: 'Configuration for notifications',
    example: { reminder_offset_days: 7, reminder_type: 'email' },
  })
  @IsOptional()
  @IsObject()
  reminderSettings?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'ID of the parent action (if this is a sub-action)',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  parentId?: number;
}
