import { SetMetadata } from '@nestjs/common';
import { CompanyType } from './company-type.enum';

export const COMPANY_TYPE_KEY = 'companyType';
export const CompanyTypeAccess = (...types: CompanyType[]) =>
  SetMetadata(COMPANY_TYPE_KEY, types);
