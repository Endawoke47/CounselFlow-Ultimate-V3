import { createRoute, createRouter, redirect } from '@tanstack/react-router';

import { Route as rootRoute } from '@/app/routes/__root';
import { Route as loginRoute } from '@/app/routes/login';
import {
  Route as ActionsRoute,
  addActionsRoute,
  editActionsRoute,
} from '@/app/routes/actions';
import { addCompanyRoute, Route as CompanyRoute, editCompanyRoute } from '@/app/routes/company';
import {
  addContractRoute,
  Route as ContractRoute,
  editContractsRoute,
} from '@/app/routes/contracts';
import {
  addMatterRoute,
  editMatterRoute,
  Route as MatterRoute,
} from '@/app/routes/matter';
import {
  addDisputeRoute,
  editDisputeRoute,
  Route as DisputeRoute,
} from '@/app/routes/disputs';
import {
  createRiskRoute,
  deleteRiskRoute,
  editRiskRoute,
  listRisksRoute,
  viewRiskRoute
} from '@/app/routes/risks';
import { DashboardPage } from '@/pages/Dashboard';

// Create a root index route with redirect
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({
      to: '/dashboard',
    });
  },
});

// Create a dashboard redirect route
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  dashboardRoute,
  CompanyRoute,
  addCompanyRoute,
  editCompanyRoute,
  MatterRoute,
  addMatterRoute,
  editMatterRoute,
  ActionsRoute,
  addActionsRoute,
  editActionsRoute,
  listRisksRoute,
  viewRiskRoute,
  editRiskRoute,
  createRiskRoute,
  deleteRiskRoute,
  ContractRoute,
  addContractRoute,
  editContractsRoute,
  addDisputeRoute,
  editDisputeRoute,
  DisputeRoute,
]);

export const router = createRouter({ routeTree });
