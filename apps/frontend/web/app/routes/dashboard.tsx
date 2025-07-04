import { createRoute } from '@tanstack/react-router';

import { Route as rootRoute } from './__root';

import EnhancedDashboard from '@/pages/Dashboard/EnhancedDashboard';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: EnhancedDashboard,
});
