import { createRoute } from '@tanstack/react-router';

import {
  DeleteRiskPage,
  DisplayRiskPage,
  ListRiskPage,
  ManageRiskPage,
} from '../../pages/Risks';

import { Route as rootRoute } from '@/app/routes/__root';

// Main risks listing route
export const listRisksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/risks',
  component: ListRiskPage,
});

// Create new risk route
export const createRiskRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/addRisk',
  component: ManageRiskPage,
});

// View risk details route
export const viewRiskRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/risks/$riskId',
  component: DisplayRiskPage,
});

// Edit risk route
export const editRiskRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/risks/$riskId/edit',
  component: ManageRiskPage,
});

// Delete risk route
export const deleteRiskRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/risks/$riskId/delete',
  component: DeleteRiskPage,
});
