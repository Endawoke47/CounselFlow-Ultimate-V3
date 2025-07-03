import { useParams, useRouterState } from '@tanstack/react-router';

import ManageRisk from '@/features/manage-risk/ui/ManageRisk';
import Layout from '@/widgets/layout/Layout';

export default function ManageRiskPage() {
  const routerState = useRouterState();
  const routePath =
    routerState.matches[routerState.matches.length - 1]?.routeId;

  // Determine which route pattern to use based on the current route
  const isEditRoute = routePath?.includes('edit');

  let id: number | undefined;

  if (isEditRoute) {
    const { riskId } = useParams({ from: '/risks/$riskId/edit' });
    id = riskId ? parseInt(riskId) : undefined;
  }

  return (
    <Layout>
      <div className="p-10">
        <ManageRisk riskId={id} />
      </div>
    </Layout>
  );
}
