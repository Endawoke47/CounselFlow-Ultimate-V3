import { createRoute } from '@tanstack/react-router';

import { Route as rootRoute } from '@/app/routes/__root';
import DisputesListPage from '@/pages/Disputes/DisputesListPage';
import { AddDisputePage } from '@/pages/Disputes/AddDisputePage';
import { UpdateDisputePage } from '@/pages/Disputes/UpdateDisputePage';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/disputes',
  component: DisputesListPage,
});

export const addDisputeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/addDispute',
  component: AddDisputePage,
});

export const editDisputeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'disputes/$disputeId/edit',
  component: UpdateDisputePage,
});