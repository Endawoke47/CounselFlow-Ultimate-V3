import { createRoute } from '@tanstack/react-router';

import { Route as rootRoute } from '@/app/routes/__root';
import ActionsPage from '@/pages/Actions/ActionsPage';
import { AddActionPage } from '@/pages/Actions/AddActionPage';
import { UpdateActionPage } from '@/pages/Actions/UpdateActionPage';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/actions',
  component: ActionsPage,
});

export const addActionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/addAction',
  component: AddActionPage,
});

export const editActionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'actions/$id/edit',
  component: UpdateActionPage,
});
