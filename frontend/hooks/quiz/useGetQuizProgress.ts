import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import type { QuizProgressDTO } from '@/types/learning/quiz-progress';

type GetQuizProgressResponse = {
  success: boolean;
  data: QuizProgressDTO;
  message?: string;
};

export const useGetQuizProgress = (quizId: string) => {
  const { getToken } = useAuth();

  const query = useQuery({
    queryKey: ['quiz-progress', quizId],
    enabled: Boolean(quizId),
    queryFn: async () => {
      const token = await getToken();
      return apiClient<GetQuizProgressResponse>(`quizzes/${quizId}/progress/me`, 'GET', token);
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
