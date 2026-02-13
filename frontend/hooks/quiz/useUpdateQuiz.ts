import { useAuth } from '@clerk/nextjs';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useLoader } from '@/contexts/LoaderContext';
import { apiClient } from '@/lib/api-client';
import type { QuizStatus } from '@/types/modules/Quiz';
import type { QuestionDTO } from '@/types/modules/Question';

type UpdateQuizPayload = {
  title: string;
  description: string;
  status: QuizStatus;
  scoreMinimum: number;
  duree?: number;
  nombreTentatives: number;
  questions: QuestionDTO[];
};

type BackendResponse = {
  success?: boolean;
  status?: 'success' | 'error';
  message?: string;
  data?: any;
};

const updateQuiz = async (
  quizId: string,
  payload: UpdateQuizPayload,
  token: string | null
): Promise<BackendResponse | undefined> => {
  return apiClient<BackendResponse>(`quizzes/${quizId}`, 'PUT', token, payload);
};

export const useUpdateQuiz = (options?: { onSuccess?: () => void }) => {
  const { getToken } = useAuth();
  const { showLoader, hideLoader } = useLoader();

  const mutation = useMutation({
    mutationFn: async ({ quizId, payload }: { quizId: string; payload: UpdateQuizPayload }) => {
      showLoader();
      const token = await getToken();
      return updateQuiz(quizId, payload, token);
    },

    onSuccess: data => {
      // Cas 204 => data = undefined
      const ok = data == null || data.success === true || data.status === 'success';

      if (ok) {
        toast.success('Quiz modifie avec succes !');
        options?.onSuccess?.();
      } else {
        toast.error('La modification a echoue', { description: data.message });
      }
    },

    onError: (error: Error) => {
      toast.error('La modification a echoue', {
        description: error.message || 'An unexpected error occurred.',
      });
    },

    onSettled: () => {
      hideLoader();
    },
  });

  return {
    updateQuiz: mutation.mutate,
    isUpdating: mutation.isPending,
    ...mutation,
  };
};
