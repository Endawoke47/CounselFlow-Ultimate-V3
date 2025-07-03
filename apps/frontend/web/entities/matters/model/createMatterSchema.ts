import * as yup from 'yup';

export const createMatterSchema = yup.object({
  name: yup
    .string()
    .required('Matter Name is required')
    .min(5, 'Matter Name must be at least 5 characters'),
  type: yup.string().required('Matter Type is required'),
  status: yup.string().required('Matter Status is required'),
  companyId: yup.string().required('Company is required'),
  priority: yup.string().required('Priority is required'),
  matterOwnerId: yup.string().nullable().optional(),
  leadAttorneyId: yup.string().nullable().optional(),
  storageLink: yup.string().nullable().optional(),
  tags: yup.array().nullable().optional(),
  riskId: yup.string().nullable().optional(),
  description: yup.string().nullable().optional(),
  keyDates: yup.array().of(
    yup.object({
      date: yup.string().nullable().optional(),
      description: yup.string().nullable().optional(),
    })
  ),
});
