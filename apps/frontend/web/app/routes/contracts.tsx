import { createRoute } from '@tanstack/react-router';

import { Route as rootRoute } from '@/app/routes/__root';
import { AddContractPage } from '@/pages/Contracts/AddContractPage';
import ContractsListPage from '@/pages/Contracts/ContractsListPage';
import { UpdateContractPage } from '@/pages/Contracts/UpdateContractPage';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contracts',
  component: ContractsListPage,
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
