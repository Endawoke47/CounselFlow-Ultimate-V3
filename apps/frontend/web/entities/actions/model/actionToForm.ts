import { IAction } from '@counselflow/types';

export const actionToForm = (action: IAction) => {
  return {
    matterId: action.matter?.id,
    title: action.title,
    description: action.description,
    type: action.type,
    status: action.status,
    priority: action.priority,
    assignedToId: action.assignedTo?.id,
    startDate: action.startDate,
    dueDate: action.dueDate,
    completionDate: action.completionDate,
    dependencyIds: action.dependencies?.map((dependency) => dependency.id),
    recurring: action.recurring,
    recurrencePattern: action.recurrencePattern,
    notes: action.notes,
    attachments: action.attachments,
    reminderSettings: action.reminderSettings,
    parentId: action.parent?.id,
  };
};
