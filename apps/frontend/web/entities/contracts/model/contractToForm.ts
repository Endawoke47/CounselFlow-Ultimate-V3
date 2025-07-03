import { IContract } from '1pd-types';

export const contractToForm = (contract: IContract) => {
  return {
    matterId: contract.matter?.id,
    owningCompanyId: contract.owningCompany?.id,
    title: contract.title,
    type: contract.type,
    description: contract.description,
    status: contract.status,
    priority: contract.priority,
    partiesInvolved: contract.parties,
    counterpartyId: contract.counterparty?.id,
    counterpartyName: contract.counterpartyName,
    effectiveDate: contract.effectiveDate,
    executionDate: contract.executionDate,
    expirationDate: contract.expirationDate,
    valueAmount: contract.valueAmount,
    valueCurrency: contract.valueCurrency,
    paymentTerms: contract.paymentTerms,
    internalLegalOwnerId: contract.internalLegalOwner?.id,
    documentId: contract.documentId,
    notes: contract.notes,
  }
};
