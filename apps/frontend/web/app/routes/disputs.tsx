import { createRoute } from '@tanstack/react-router';

import { Route as rootRoute } from '@/app/routes/__root';
import { DisputesPage } from '@/pages/Disputes/DisputesPage';
import { AddDisputePage } from '@/pages/Disputes/AddDisputePage';
import { UpdateDisputePage } from '@/pages/Disputes/UpdateDisputePage';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/disputes',
  component: DisputesPage,
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