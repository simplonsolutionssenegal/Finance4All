'use client';

import { useAuth } from '@clerk/nextjs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useLoader } from '@/contexts/LoaderContext';
import { apiClient } from '@/lib/api-client';

interface DeleteLessonResponse {
  success?: boolean;
  status?: 'success' | 'error';
  message?: string;
}

type DeleteLessonParams = {
  lessonId: string;
  moduleId?: string;
};

export const useDeleteLesson = (options?: { onSuccess?: () => void }) => {
  const { getToken } = useAuth();
  const { showLoader, hideLoader } = useLoader();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ lessonId }: DeleteLessonParams) => {
      showLoader();
      const token = await getToken();
      return apiClient<DeleteLessonResponse>(`lessons/${lessonId}`, 'DELETE', token);
    },
    onSuccess: (data, variables) => {
      hideLoader();

      const ok = data == null || data.success === true || data.status === 'success';
      if (!ok) {
        toast.error('Echec de la suppression de la lecon', {
          description: data?.message ?? 'Une erreur est survenue.',
        });
        return;
      }

      toast.success('Lecon supprimee avec succes');
      if (variables?.moduleId) {
        queryClient.invalidateQueries({ queryKey: ['module', variables.moduleId] });
      }
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      hideLoader();
      toast.error('Echec de la suppression de la lecon', {
        description: error.message || 'Une erreur inattendue est survenue.',
      });
    },
  });

  return {
    deleteLesson: mutation.mutate,
    deleteLessonAsync: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    ...mutation,
  };
};
