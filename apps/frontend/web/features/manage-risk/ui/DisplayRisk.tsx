import { Link, useNavigate } from '@tanstack/react-router';

import { useDeleteRisk, useFetchRisk } from '@/entities/risks/hooks';
import { Button } from '@/shared/ui';

interface DisplayRiskProps {
  riskId: number;
}

export default function DisplayRisk({ riskId }: DisplayRiskProps) {
  const { data: risk, isLoading, error } = useFetchRisk(riskId);
  const deleteRiskMutation = useDeleteRisk();
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this risk?')) return;

    try {
      await deleteRiskMutation.mutateAsync(riskId);
      navigate({ to: '/risks' });
    } catch (error) {
      console.error('Error deleting risk:', error);
    }
  };

  if (isLoading) {
    return <div className="text-center text-xl">Loading risk details...</div>;
  }

  if (error || !risk) {
    return (
      <div>
        <div className="text-center text-xl text-red-500">
          Error loading risk details
        </div>
        <div className="text-center mt-4">
          <Link to="/risks">
            <Button className="bg-blue-500 text-white px-4 py-2 rounded">
              Back to Risks
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{risk.name}</h1>
        <div className="flex gap-4">
          <Link to={`/risks/${riskId}/edit`}>
            <Button className="bg-green-500 text-white px-4 py-2 rounded">
              Edit
            </Button>
          </Link>
          <Button
            onClick={handleDelete}
            className="bg-red-500 text-white px-4 py-2 rounded"
            disabled={deleteRiskMutation.isPending}
          >
            Delete
          </Button>
          <Link to="/risks">
            <Button className="bg-gray-500 text-white px-4 py-2 rounded">
              Back
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-lg shadow">
        <div className="col-span-2">
          <h2 className="text-xl font-semibold mb-4">Risk Information</h2>
        </div>

        <div>
          <h3 className="font-semibold">Category</h3>
          <p>{risk.category || 'N/A'}</p>
        </div>

        <div>
          <h3 className="font-semibold">Score</h3>
          <p>{risk.score ?? 'N/A'}</p>
        </div>

        <div>
          <h3 className="font-semibold">Status</h3>
          <p>{risk.status || 'N/A'}</p>
        </div>

        <div>
          <h3 className="font-semibold">Priority</h3>
          <p>{risk.priority || 'N/A'}</p>
        </div>

        <div>
          <h3 className="font-semibold">Likelihood</h3>
          <p>{risk.inherentLikelihood || 'N/A'}</p>
        </div>

        <div className="col-span-2">
          <h3 className="font-semibold">Description</h3>
          <p className="whitespace-pre-wrap">{risk.description || 'N/A'}</p>
        </div>

        {risk.financialImpactMin && risk.financialImpactMax ? (
          <div className="col-span-2">
            <h3 className="font-semibold">Financial Impact</h3>
            <p>
              {risk.financialImpactMin} - {risk.financialImpactMax}{' '}
              {risk.currency || 'USD'}
            </p>
          </div>
        ) : (
          <div className="col-span-2">
            <h3 className="font-semibold">Financial Impact</h3>
            <p>N/A</p>
          </div>
        )}

        <div>
          <h3 className="font-semibold">Tolerance</h3>
          <p>{risk.tolerance || 'N/A'}</p>
        </div>

        <div>
          <h3 className="font-semibold">Identification Date</h3>
          <p>
            {risk.identificationDate
              ? new Date(risk.identificationDate).toLocaleDateString()
              : 'N/A'}
          </p>
        </div>

        <div>
          <h3 className="font-semibold">Review Date</h3>
          <p>
            {risk.reviewDate
              ? new Date(risk.reviewDate).toLocaleDateString()
              : 'N/A'}
          </p>
        </div>

        <div>
          <h3 className="font-semibold">Resolution Date</h3>
          <p>
            {risk.resolutionDate
              ? new Date(risk.resolutionDate).toLocaleDateString()
              : 'N/A'}
          </p>
        </div>

        <div className="col-span-2">
          <h3 className="font-semibold">Mitigation Plan</h3>
          <p className="whitespace-pre-wrap">{risk.mitigationPlan || 'N/A'}</p>
        </div>

        <div>
          <h3 className="font-semibold">Mitigation Status</h3>
          <p>{risk.mitigationStatus || 'N/A'}</p>
        </div>

        <div>
          <h3 className="font-semibold">Regulatory Implications</h3>
          <p>
            {typeof risk.regulatoryImplications === 'boolean'
              ? risk.regulatoryImplications
                ? 'Yes'
                : 'No'
              : 'N/A'}
          </p>
        </div>

        <div className="col-span-2">
          <h3 className="font-semibold">Related Regulations</h3>
          {risk.relatedRegulations && risk.relatedRegulations.length > 0 ? (
            <ul className="list-disc list-inside">
              {risk.relatedRegulations.map(
                (regulation: string, index: number) => (
                  <li key={index}>{regulation}</li>
                )
              )}
            </ul>
          ) : (
            <p>N/A</p>
          )}
        </div>

        <div>
          <h3 className="font-semibold">Reputational Assessment</h3>
          <p>{risk.reputationalAssessment || 'N/A'}</p>
        </div>

        <div className="col-span-2">
          <h3 className="font-semibold">Notes</h3>
          <p className="whitespace-pre-wrap">{risk.notes || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}
