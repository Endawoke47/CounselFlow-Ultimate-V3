import { CompanyAccountType, CompanyStatus } from './company.enums';
import { ICity, ICountry, IState } from '../geo';
import { ICategory } from '../categories';
import { ISector } from '../sectors';
import { IAccount } from '../accounts';
import { IUser } from '../users';

export interface ShareholderInfo {
  shareholder_name: string;
  ownership_percentage: number;
  share_class?: string;

  [key: string]: any;
}

export interface DirectorInfo {
  name: string;
  title: string;
  start_date?: string;

  [key: string]: any;
}

export interface ICompany {
  id: number;
  name: string;
  description?: string | null;
  shareholdersInfo?: ShareholderInfo[];
  directorsInfo?: DirectorInfo[];
  status?: CompanyStatus;
  jurisdictionOfIncorporation?: string;
  incorporationDate?: Date;
  taxId?: string;
  businessRegNumber?: string;
  registeredAddress?: string;
  industrySector?: string;
  fiscalYearEnd?: Date | null;
  reportingCurrency?: string | null;
  regulatoryBodies?: string[];
  notes?: string | null;
  contact: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  number?: string | null;
  address?: string | null;
  city: ICity;
  country: ICountry;
  state: IState;
  categories: ICategory[];
  sectors: ISector[];
  children: ICompany[];
  parent?: ICompany;
  users: IUser[];
  companyAccounts: ICompanyAccount[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface ICompanyAccount {
  id: number;
  companyType: CompanyAccountType;
  companyId: number;
  accountId: number;
  company: ICompany;
  account: IAccount;
}

export interface IShareholderInfo {
  shareholder_name: string;
  ownership_percentage: number;
  share_class?: string;
}

export interface IDirectorInfo {
  name: string;
  title: string;
  start_date?: string;
}


