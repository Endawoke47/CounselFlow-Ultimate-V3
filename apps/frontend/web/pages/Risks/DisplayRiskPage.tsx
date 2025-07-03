import { useParams } from '@tanstack/react-router';

import DisplayRisk from '@/features/manage-risk/ui/DisplayRisk';
import Layout from '@/widgets/layout/Layout';

export default function DisplayRiskPage() {
  const { riskId } = useParams({ from: '/risks/$riskId' });
  const id = parseInt(riskId);

  return (
    <Layout>
      <div className="p-10">
        <DisplayRisk riskId={id} />
      </div>
    </Layout>
  );
}
