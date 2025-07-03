import { CompanyAccountType, CompanyStatus } from './company.enums';
import { IDirectorInfo, IShareholderInfo } from './company.interfaces';

export interface ICreateCompanyRequest {
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  number?: string;
  cityId?: number;
  countryId: number;
  stateId?: number;
  type: CompanyAccountType;
  accountId: number;
  categoryIds?: number[];
  sectorIds?: number[];
  contact?: string;
  shareholdersInfo?: IShareholderInfo[];
  directorsInfo?: IDirectorInfo[];
  status?: CompanyStatus;
  jurisdictionOfIncorporation?: string;
  incorporationDate?: string;
  taxId?: string;
  businessRegNumber?: string;
  registeredAddress?: string;
  industrySector?: string;
  fiscalYearEnd?: string | null;
  reportingCurrency?: string | null;
  regulatoryBodies?: string[];
  notes?: string | null;
  createdById?: number;
  parentId?: number;
  childrenIds?: number[];
}
