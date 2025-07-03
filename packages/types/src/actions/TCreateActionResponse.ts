import { ActionPriority, ActionStatus, ActionType } from './action.enums';
import { Attachment } from './action.interfaces';

export interface TCreateActionResponse {
  id: number;
  matterId: number;
  title: string;
  description: string;
  type: ActionType;
  status: ActionStatus;
  priority: ActionPriority;
  assignedToId?: number;
  startDate: Date;
  dueDate: Date;
  completionDate?: Date;
  dependencyIds?: number[];
  recurring: boolean;
  recurrencePattern?: string;
  notes?: string;
  attachments?: Attachment[];
  reminderSettings?: Record<string, any>;
  parentId?: number;
  createdAt: Date;
  updatedAt: Date;
}
