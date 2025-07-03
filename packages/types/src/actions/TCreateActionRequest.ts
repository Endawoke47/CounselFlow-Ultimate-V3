import { ActionPriority, ActionStatus, ActionType } from './action.enums';
import { Attachment } from './action.interfaces';

export interface TCreateActionRequest {
  matterId: number;
  title: string;
  description: string;
  type: ActionType;
  status: ActionStatus;
  priority: ActionPriority;
  assignedToId?: number;
  startDate: string;
  dueDate: string;
  completionDate?: string;
  dependencyIds?: number[];
  recurring: boolean;
  recurrencePattern?: string;
  notes?: string;
  attachments?: Attachment[];
  reminderSettings?: Record<string, any>;
  parentId?: number;
}
