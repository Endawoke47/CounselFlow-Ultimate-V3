export const disputeToForm = (dispute: any) => {
  return {
    title: dispute?.title,
    description: dispute?.description,
    type: dispute?.type,
    status: dispute?.status,
    parties: dispute?.parties.map((party: any) => ({
      companyId: party.company.id,
      role: party.role,
    })),
    claims: dispute?.claims,
  };
};
