import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'react-toastify';
import { disputesClient } from '@/entities/disputes/api/disputes.client';

export const useUpdateDispute = (disputeId: number) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (data: any) =>
      disputesClient.updateDispute(disputeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: ({ queryKey }) => queryKey?.includes?.('disputes'),
      });
      navigate({ to: '/disputes' });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
