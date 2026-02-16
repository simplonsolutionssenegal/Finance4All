import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { QuizAttemptResult, SubmittedAnswer } from '@/types/learning/quiz-progress';

type SubmitQuizAttemptResponse = {
  success: boolean;
  data: QuizAttemptResult;
  message?: string;
};

export const useSubmitQuizAttempt = (quizId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (answers: SubmittedAnswer[]) => {
      const response = await fetch(`/api/quizzes/${quizId}/attempts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ answers }),
      });
      const data = (await response.json().catch(() => ({}))) as SubmitQuizAttemptResponse & {
        message?: string;
      };
      if (!response.ok) {
        throw new Error(data.message ?? `Erreur ${response.status}`);
      }
      return data;
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
