'use client';

import { useAuth } from '@clerk/nextjs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useLoader } from '@/contexts/LoaderContext';
import { apiClient } from '@/lib/api-client';

interface DeleteQuizResponse {
  success?: boolean;
  status?: 'success' | 'error';
  message?: string;
}

type DeleteQuizParams = {
  quizId: string;
  moduleId?: string;
};

export const useDeleteQuiz = (options?: { onSuccess?: () => void }) => {
  const { getToken } = useAuth();
  const { showLoader, hideLoader } = useLoader();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ quizId }: DeleteQuizParams) => {
      showLoader();
      const token = await getToken();
      return apiClient<DeleteQuizResponse>(`quizzes/${quizId}`, 'DELETE', token);
    },
    onSuccess: (data, variables) => {
      hideLoader();

      const ok = data == null || data.success === true || data.status === 'success';
      if (!ok) {
        toast.error('Echec de la suppression du quiz', {
          description: data?.message ?? 'Une erreur est survenue.',
        });
        return;
      }

      toast.success('Quiz supprime avec succes');
      if (variables?.moduleId) {
        queryClient.invalidateQueries({ queryKey: ['module', variables.moduleId] });
      }
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      hideLoader();
      toast.error('Echec de la suppression du quiz', {
        description: error.message || 'Une erreur inattendue est survenue.',
      });
    },
  });

  return {
    deleteQuiz: mutation.mutate,
    deleteQuizAsync: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    ...mutation,
  };
};
