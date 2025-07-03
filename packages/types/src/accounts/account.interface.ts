import { ICompanyAccount } from '../companies';
import { IUser } from '../users';

export interface IAccount {
  id: number;
  organizationSize: string;
  isAdmin: boolean;
  companyAccounts: ICompanyAccount[];
  createdBy?: IUser | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
