import { KeyDate } from './ICreateMatterRequest';

export interface IMatter {
  id: number;
  name: string;
  type: string;
  subtype?: string;
  status: string;
  priority?: string;
  description?: string;
  company: any;
  companyId: string;
  keyDates?: KeyDate[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}