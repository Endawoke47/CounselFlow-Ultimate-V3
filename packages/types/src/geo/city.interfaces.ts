import { ICompany } from '../companies';
import { IState } from './state.interfaces';
import { IUser } from '../users';

export interface ICity {
  id: number;
  name: string;
  state: IState;
  companies: ICompany[];
  users: IUser[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
