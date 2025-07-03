import * as yup from 'yup';

export const createCompanySchema = yup.object({
  name: yup.string().required('Company Name is required'),
  /*countryId: yup.number().required('Country is required'),
  type: yup.string().required('Company Type is required'),
  accountId: yup.number().required('Account is required'),
  categoryIds: yup.array().of(yup.number()).required('At least one category is required'),
  sectorIds: yup.array().of(yup.number()).required('At least one sector is required'),
  regulatoryBodies: yup.array().of(yup.string()).required('At least one regulatory body is required'),*/
  description: yup.string().nullable().optional(),
 /* email: yup.string().nullable().optional(),
  phone: yup.string().nullable().optional(),
  website: yup.string().nullable().optional(),
  address: yup.string().nullable().optional(),
  number: yup.string().nullable().optional(),
  cityId: yup.number().nullable().optional(),
  stateId: yup.number().nullable().optional(),
  contact: yup.string().nullable().optional(),
  shareholdersInfo: yup.array().of(
    yup.object({
      shareholder_name: yup.string().nullable().optional(),
      ownership_percentage: yup.number().nullable().optional(),
      share_class: yup.string().nullable().optional(),
    })
  ),
  directorsInfo: yup.array().of(
    yup.object({
      name: yup.string().nullable().optional(),
      title: yup.string().nullable().optional(),
      start_date: yup.string().nullable().optional(),
    })
  ),
  status: yup.string().nullable().optional(),
  jurisdictionOfIncorporation: yup.string().nullable().optional(),
  incorporationDate: yup.date().nullable().optional(),
  taxId: yup.string().nullable().optional(),
  businessRegNumber: yup.string().nullable().optional(),
  registeredAddress: yup.string().nullable().optional(),
  industrySector: yup.string().nullable().optional(),
  fiscalYearEnd: yup.date().nullable().optional(),
  reportingCurrency: yup.string().nullable().optional(),
  notes: yup.string().nullable().optional(),
  createdById: yup.number().nullable().optional(),*/
  parentId: yup.number().nullable().optional(),
  childrenIds: yup.array().of(yup.number()).nullable().optional()
});
