import { useQuery } from '@tanstack/react-query';

import type { QuizProgressDTO } from '@/types/learning/quiz-progress';

type GetQuizProgressResponse = {
  success: boolean;
  data: QuizProgressDTO;
  message?: string;
};

export const useGetQuizProgress = (quizId: string) => {
  const query = useQuery({
    queryKey: ['quiz-progress', quizId],
    enabled: Boolean(quizId),
    queryFn: async (): Promise<GetQuizProgressResponse> => {
      const response = await fetch(`/api/quizzes/${quizId}/progress/me`, {
        method: 'GET',
        credentials: 'same-origin',
      });
      const data = (await response.json().catch(() => ({}))) as GetQuizProgressResponse & {
        message?: string;
      };
      if (!response.ok) {
        throw new Error(data.message ?? `Erreur ${response.status}`);
      }
      return data;
    },
    staleTime: 30 * 1000,
  });

  return {
    progress: query.data?.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
