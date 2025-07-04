import { IMatter } from '@counselflow/types';

export const matterToForm = (matter: IMatter) => {
  return {
    companyId: matter.company.id,
    description: matter.description,
    keyDates: matter.keyDates,
    name: matter.name,
    priority: matter.priority,
    status: matter.status,
    subtype: matter.subtype,
    type: matter.type,
  }
};
