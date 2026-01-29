import { useAuth } from '@clerk/nextjs';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useLoader } from '@/contexts/LoaderContext';
import { apiClient } from '@/lib/api-client';
import type { QuizStatus } from '@/types/modules/Quiz';
import type { QuestionDTO } from '@/types/modules/Question';

type CreateQuizPayload = {
  title: string;
  description: string;
  status: QuizStatus;
  scoreMinimum: number;
  duree?: number; // undefined => illimité
  nombreTentatives: number;
  questions: QuestionDTO[];
};

interface BackendResponse {
  success: boolean;
  message?: string;
  data?: any;
}

const createQuiz = async (
  moduleId: string,
  payload: CreateQuizPayload,
  token: string | null
): Promise<BackendResponse> => {
  return apiClient<BackendResponse>(`modules/${moduleId}/quizzes`, 'PUT', token, payload);
};

export const useCreateQuiz = (options?: { onSuccess?: () => void }) => {
  const { getToken } = useAuth();
  const { showLoader, hideLoader } = useLoader();

  const mutation = useMutation({
    mutationFn: async ({ moduleId, payload }: { moduleId: string; payload: CreateQuizPayload }) => {
      showLoader();
      const token = await getToken();
      return createQuiz(moduleId, payload, token);
    },
    onSuccess: data => {
      hideLoader();
      if (data.success === true) {
        toast.success('Quiz créé avec succès !');
        options?.onSuccess?.();
      } else {
        toast.error('La création a échoué', { description: data.message });
      }
    },
    onError: (error: Error) => {
      hideLoader();
      toast.error('La création a échoué', {
        description: error.message || 'An unexpected error occurred.',
      });
    },
  });

  return {
    createQuiz: mutation.mutate,
    isCreating: mutation.isPending,
    ...mutation,
  };
};
