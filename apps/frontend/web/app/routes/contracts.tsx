import { createRoute } from '@tanstack/react-router';

import { Route as rootRoute } from '@/app/routes/__root';
import { AddContractPage } from '@/pages/Contracts/AddContractPage';
import { ContractsPage } from '@/pages/Contracts/ContractsPage';
import { UpdateContractPage } from '@/pages/Contracts/UpdateContractPage';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contracts',
  component: ContractsPage,
});

export const addContractRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/addContract',
  component: AddContractPage,
});

export const editContractsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contracts/$contractId/edit',
  component: UpdateContractPage,
});
