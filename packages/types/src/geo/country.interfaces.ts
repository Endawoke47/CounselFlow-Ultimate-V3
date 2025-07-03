import { ICompany } from '../companies';
import { IState } from './state.interfaces';
import { IUser } from '../users';

export interface ICountry {
  id: number;
  name: string;
  shortname: string;
  states: IState[];
  companies: ICompany[];
  users: IUser[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
