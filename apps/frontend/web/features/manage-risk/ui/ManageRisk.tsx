import { TCreateRiskRequest, TUpdateRiskRequest } from '@counselflow/types';
import { Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

import RiskForm from './RiskForm';

import {
  useCreateRisk,
  useFetchRisk,
  useUpdateRisk,
} from '@/entities/risks/hooks';
import { Button } from '@/shared/ui';

interface ManageRiskProps {
  riskId?: number;
}

export default function ManageRisk({ riskId }: ManageRiskProps) {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<string[]>([]);
  const isEditing = !!riskId;

  const { data: risk, isLoading: isLoadingRisk } = useFetchRisk(riskId ?? 0);
  const createRiskMutation = useCreateRisk();
  const updateRiskMutation = useUpdateRisk(riskId ?? 0);

  const handleSubmit = (data: TCreateRiskRequest | TUpdateRiskRequest) => {
    // Clear any previous errors
    setErrors([]);

    if (isEditing) {
      updateRiskMutation.mutate(data as TUpdateRiskRequest, {
        onSuccess: () => {
          navigate({ to: `/risks/${riskId}` });
        },
        onError: (error: Error) => {
          setErrors([error.message]);
        },
      });
    } else {
      createRiskMutation.mutate(data as TCreateRiskRequest, {
        onSuccess: (newRisk) => {
          navigate({ to: `/risks/${newRisk.id}` });
        },
        onError: (error: Error) => {
          setErrors([error.message]);
        },
      });
    }
  };

  if (isEditing && isLoadingRisk) {
    return <div className="text-center text-xl">Loading risk details...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {isEditing ? `Edit Risk: ${risk?.name}` : 'Create New Risk'}
        </h1>
        <div className="flex gap-4">
          {isEditing && (
            <Link to={`/risks/${riskId}`}>
              <Button variant="outline">
                View Risk
              </Button>
            </Link>
          )}
          <Link to="/risks">
            <Button className="bg-gray-500 text-white px-4 py-2 rounded">
              Back to Risks
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <RiskForm
          riskId={riskId}
          onSubmit={handleSubmit}
          isSubmitting={
            createRiskMutation.isPending || updateRiskMutation.isPending
          }
          errors={errors}
        />
      </div>
    </div>
  );
}
