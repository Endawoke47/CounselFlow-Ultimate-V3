import { ICountry } from './country.interfaces';
import { ICity } from './city.interfaces';
import { ICompany } from '../companies';
import { IUser } from '../users';

export interface IState {
  id: number;
  name: string;
  country: ICountry;
  cities: ICity[];
  companies: ICompany[];
  users: IUser[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

