import { useParams } from '@tanstack/react-router';

import { DeleteRisk } from '@/features/manage-risk/ui';
import Layout from '@/widgets/layout/Layout';

export default function DeleteRiskPage() {
  const { riskId } = useParams({ from: '/risks/$riskId/delete' });

  return (
    <Layout>
      <div className="p-10">
        <DeleteRisk />
      </div>
    </Layout>
  );
}
