import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { useState } from 'react';

import { useDeleteRisk } from '@/entities/risks/hooks';
import { Button } from '@/shared/ui';

export default function DeleteRisk() {
  const navigate = useNavigate();
  const { riskId } = useParams({ from: '/risks/$riskId/delete' });
  const id = parseInt(riskId);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteRiskMutation = useDeleteRisk();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteRiskMutation.mutateAsync(id);
      navigate({ to: '/risks' });
    } catch (error) {
      console.error('Failed to delete risk:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Delete Risk</h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-lg mb-4">
          Are you sure you want to delete this risk? This action cannot be
          undone.
        </p>

        <div className="flex justify-end space-x-4">
          <Link to={`/risks/${id}`}>
            <Button className="bg-gray-500 text-white px-4 py-2 rounded">
              Cancel
            </Button>
          </Link>
          <Button
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete Risk'}
          </Button>
        </div>
      </div>
    </div>
  );
}
