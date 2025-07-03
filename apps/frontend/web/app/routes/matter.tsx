import { createRoute } from '@tanstack/react-router';

import { Route as rootRoute } from '@/app/routes/__root';
import { AddMatterPage } from '@/pages/Matters/AddMatterPage';
import { MattersPage } from '@/pages/Matters/MattersPage';
import { UpdateMatterPage } from '@/pages/Matters/UpdateMatterPage';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/matters',
  component: MattersPage,
});

export const addMatterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/addMatter',
  component: AddMatterPage,
});

export const editMatterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'matters/$matterId/edit',
  component: UpdateMatterPage,
});
