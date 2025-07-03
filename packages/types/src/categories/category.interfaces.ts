import { ICompany } from '../companies';

export interface ICategory {
  id: number;
  name: string;
  companies: ICompany[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
