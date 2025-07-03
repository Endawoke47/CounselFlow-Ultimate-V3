import { IMatter } from '../matters';
import { IUser } from '../users';
import { ActionPriority, ActionStatus, ActionType } from './action.enums';
export interface Attachment {
  name: string;
  path: string;
}

interface ReminderSettings {
  reminder_offset_days?: number;
  reminder_type?: string;
  [key: string]: any;
}

export interface IAction {
  id: number;
  matter: IMatter;
  title: string;
  description: string;
  type: ActionType;
  status: ActionStatus;
  priority: ActionPriority;
  assignedTo?: IUser;
  startDate: Date;
  dueDate: Date;
  completionDate?: Date;
  dependencies?: IAction[];
  recurring: boolean;
  recurrencePattern?: string;
  notes?: string;
  attachments?: Attachment[];
  reminderSettings?: ReminderSettings;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  children: IAction[];
  parent?: IAction;
}
