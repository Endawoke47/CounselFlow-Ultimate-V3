import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

import { fetchWithAuth } from '@/entities/api/fetchWithAuth';
import { APP_ROUTES } from '@/entities/api/routes';

export const useDeleteCategory = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return fetchWithAuth(
        APP_ROUTES.CATEGORY(id),
        { method: 'DELETE' },
        navigate
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['category'] });
    },
    onError: (error) => {
      console.error('Error deleting category:', error);
    },
  });
};
