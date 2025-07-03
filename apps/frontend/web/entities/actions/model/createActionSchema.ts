import * as yup from 'yup';

export const createActionSchema = yup.object({
  matterId: yup.number().required('Matter is required'),
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  type: yup.string().required('Action Type is required'),
  status: yup.string().required('Action Status is required'),
  priority: yup.string().required('Priority is required'),
  assignedToId: yup.number().nullable().optional(),
  startDate: yup.date().required('Start Date is required'),
  dueDate: yup.date().required('Due Date is required'),
  completionDate: yup.date().nullable().optional(),
  dependencyIds: yup.array().required('At least one dependency is required'),
  recurring: yup.boolean().required('Recurring is required'),
  recurrencePattern: yup.string().nullable().optional(),
  notes: yup.string().nullable().optional(),
  attachments: yup.array().of(
    yup.object({
      name: yup.string().nullable().optional(),
      path: yup.string().nullable().optional(),
    })
  ),
  reminderSettings: yup.object({
    reminder_offset_days: yup.number().nullable().optional(),
    reminder_type: yup.string().nullable().optional(),
  }),
  parentId: yup.number().nullable().optional(),
});
