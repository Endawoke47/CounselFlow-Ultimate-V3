import { ICompany } from '1pd-types';

export const companyToForm = (company: ICompany) => {
  return {
    name: company.name,
    description: company.description,
/*    countryId: company.country.id,
    type: company.type, // TODO fix this
    accountId: company.account.id, // TODO: fix this
    categoryIds: company.categories.map(category=>category.id),
    sectorIds: company.sectors.map(sector=>sector.id),
    regulatoryBodies: company.regulatoryBodies,
    description: company.description,
    email: company.email,
    phone: company.phone,
    website: company.website,
    address: company.address,
    number: company.number,
    cityId: company.city.id,
    stateId: company.state.id,
    contact: company.contact,
    shareholdersInfo: company.shareholdersInfo,
    directorsInfo: company.directorsInfo,
    status: company.status,
    jurisdictionOfIncorporation: company.jurisdictionOfIncorporation,
    incorporationDate: company.incorporationDate,
    taxId: company.taxId,
    businessRegNumber: company.businessRegNumber,
    registeredAddress: company.registeredAddress,
    industrySector: company.industrySector,
    fiscalYearEnd: company.fiscalYearEnd,
    reportingCurrency: company.reportingCurrency,
    notes: company.notes,
    createdById: company.createdById, // TODO: fix this*/
    parentId: company.parent?.id,
    childrenIds: company.children?.map(child=>child.id),
  }
};
