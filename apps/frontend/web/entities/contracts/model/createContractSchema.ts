import * as yup from 'yup';

export const createContractSchema = yup.object({
  matterId: yup.number().nullable().optional(),
  owningCompanyId: yup.string().required('Owning Company is required'),
  title: yup
    .string()
    .required('Title is required')
    .min(5, 'Title must be at least 5 characters'),
  type: yup.string().required('Contract Type is required'),
  description: yup.string().nullable().optional(),
  status: yup.string().required('Contract Status is required'),
  priority: yup.string().nullable().optional(),
  partiesInvolved: yup.array().of(
    yup.object({
      companyId: yup.string().nullable().optional(),
      role: yup.string().nullable().optional(),
      signatory: yup.string().nullable().optional(),
    })
  ),
  counterpartyId: yup.string().nullable().optional(),
  counterpartyName:yup.string().nullable().optional(),
  effectiveDate: yup.date().nullable().optional(),
  executionDate: yup.date().nullable().optional(),
  expirationDate: yup.date().nullable().optional(),
  valueAmount: yup.number().nullable().optional(),
  valueCurrency: yup.string().nullable().optional(),
  paymentTerms: yup.string().nullable().optional(),
  internalLegalOwnerId: yup.string().nullable().optional(),
  documentId: yup.number().nullable().optional(),
  notes: yup.string().nullable().optional(),
});
