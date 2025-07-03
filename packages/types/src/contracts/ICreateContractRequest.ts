import { ContractStatus, ContractType, Priority } from './contract.enums';

interface IContractPartyDto {
  companyId: string;
  role: string;
  signatory: string;
}

export interface ICreateContractRequest {
  matterId?: string;
  owningCompanyId?: string;
  title: string;
  type: ContractType;
  description?: string;
  status: ContractStatus;
  priority?: Priority;
  partiesInvolved?: IContractPartyDto[];
  counterpartyId?: string;
  counterpartyName?: string;
  effectiveDate?: Date;
  executionDate?: Date;
  expirationDate?: Date;
  valueAmount?: number;
  valueCurrency?: string;
  paymentTerms?: string;
  internalLegalOwnerId?: string;
  documentId?: number;
  notes?: string;
}