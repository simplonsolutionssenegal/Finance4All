import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import { Quiz } from '@/types/modules/Quiz';

type GetQuizByIdResponse = {
  success: boolean;
  data: Quiz;
  message?: string;
};

export const useGetQuizById = (id: string) => {
  const { getToken } = useAuth();

  const query = useQuery({
    queryKey: ['quiz', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const token = await getToken();
      return apiClient<GetQuizByIdResponse>(`quizzes/${id}`, 'GET', token);
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    quiz: query.data?.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
