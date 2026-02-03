import { useAuth } from '@clerk/nextjs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useLoader } from '@/contexts/LoaderContext';
import { apiClient } from '@/lib/api-client';

interface DeleteMediaResponse {
  success: boolean;
  message?: string;
}

type DeleteMediaParams = {
  mediaId: string;
};

export const useDeleteMedia = (options?: { onSuccess?: () => void }) => {
  const { getToken } = useAuth();
  const { showLoader, hideLoader } = useLoader();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ mediaId }: DeleteMediaParams) => {
      showLoader();
      const token = await getToken();
      return apiClient<DeleteMediaResponse>(`media/${mediaId}`, 'DELETE', token);
    },

    onSuccess: data => {
      hideLoader();

      if (data?.success === true) {
        toast.success('Ressource supprimée avec succès');
        queryClient.invalidateQueries({ queryKey: ['media'] });
        queryClient.invalidateQueries({ queryKey: ['modules'] });

        options?.onSuccess?.();
      } else {
        toast.error('Suppression de la ressource échouée', {
          description: data?.message ?? 'Une erreur est survenue.',
        });
      }
    },

    onError: (error: Error) => {
      hideLoader();
      toast.error('Suppression de la ressource échouée', {
        description: error.message || 'Une erreur inattendue est survenue.',
      });
    },
  });

  return {
    deleteMedia: mutation.mutate,
    deleteMediaAsync: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  };
};
