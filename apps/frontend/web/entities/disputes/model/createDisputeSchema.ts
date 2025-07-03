import * as yup from 'yup';

export const createDisputeSchema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  /*type: yup.string().required('Dispute Type is required'),
  status: yup.string().required('Dispute Status is required'),
  parties: yup.array().required('At least one party is required'),
  claims: yup.array().required('At least one claim is required'),
  createdAt: yup.date().required('Created At is required'),
  updatedAt: yup.date().required('Updated At is required'),*/
});
