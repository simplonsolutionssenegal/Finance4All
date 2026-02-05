import { useAuth } from '@clerk/nextjs';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import type { QuizAttemptResult, SubmittedAnswer } from '@/types/learning/quiz-progress';

type SubmitQuizAttemptResponse = {
  success: boolean;
  data: QuizAttemptResult;
  message?: string;
};

export const useSubmitQuizAttempt = (quizId: string) => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (answers: SubmittedAnswer[]) => {
      const token = await getToken();
      return apiClient<SubmitQuizAttemptResponse>(`quizzes/${quizId}/attempts`, 'POST', token, {
        answers,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-progress', quizId] });
    },
  });

  return {
    submitAttempt: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error as Error | null,
  };
};
