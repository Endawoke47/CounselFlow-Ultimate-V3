import { createRoute } from '@tanstack/react-router';

import { Route as rootRoute } from '@/app/routes/__root';
import { AddCompanyPage } from '@/pages/Companies/AddCompanyPage';
import { CompaniesPage } from '@/pages/Companies/CompaniesPage';
import { UpdateCompanyPage } from '@/pages/Companies/UpdateCompanyPage';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/companies',
  component: CompaniesPage,
});

export const addCompanyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/addCompany',
  component: AddCompanyPage,
});

export const editCompanyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'companies/$companyId/edit',
  component: UpdateCompanyPage,
});