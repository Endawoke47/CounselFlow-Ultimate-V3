import { ICompany } from '../companies';
import { ICity, ICountry, IState } from '../geo';

export interface IUser {
  id: number;
  uuid: string;
  email: string;
  company: ICompany;
  title: string;
  firstName: string;
  middleName: string | undefined;
  lastName: string;
  department: string;
  phone: string;
  bestWayToContact: string | null;
  notes?: string | null;
  city?: ICity;
  country: ICountry;
  state: IState;
  createdBy?: IUser;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
