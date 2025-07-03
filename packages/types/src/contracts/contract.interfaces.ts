import { IMatter } from '../matters';
import { ContractStatus, ContractType, Priority } from './contract.enums';

export interface IContract {
  id: number;
  matter: IMatter;
  owningCompany?: any;
  title: string;
  type: ContractType;
  description?: string;
  status: ContractStatus;
  priority?: Priority;
  parties: ContractParty[];
  counterparty?: any;
  counterpartyName?: string;
  effectiveDate?: Date;
  executionDate?: Date;
  expirationDate?: Date;
  valueAmount?: number;
  valueCurrency?: string;
  paymentTerms?: string;
  internalLegalOwner?: any;
  createdBy?: any;
  documentId?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

interface ContractParty {
  id: number;
  contract: IContract;
  company: any;
  role: string;
  signatory: string;
  createdBy?: any;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

