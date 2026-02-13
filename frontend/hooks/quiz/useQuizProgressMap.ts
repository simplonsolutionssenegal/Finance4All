import { useAuth } from '@clerk/nextjs';
import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import type { QuizProgressDTO } from '@/types/learning/quiz-progress';

type GetQuizProgressResponse = {
  success: boolean;
  data: QuizProgressDTO;
  message?: string;
};

const normalizeIds = (ids: string[]) => {
  const unique = new Set<string>();
  ids.forEach(id => {
    if (id) unique.add(id);
  });
  return Array.from(unique);
};

export const useQuizProgressMap = (quizIds: string[]) => {
  const { getToken } = useAuth();
  const stableIds = useMemo(() => normalizeIds(quizIds), [quizIds]);

  const queries = useQueries({
    queries: stableIds.map(id => ({
      queryKey: ['quiz-progress', id],
      enabled: Boolean(id),
      queryFn: async () => {
        const token = await getToken();
        return apiClient<GetQuizProgressResponse>(`quizzes/${id}/progress/me`, 'GET', token);
      },
      staleTime: 30 * 1000,
    })),
  });

  const progressMap = useMemo(() => {
    const map = new Map<string, QuizProgressDTO>();
    queries.forEach(query => {
      const data = query.data?.data;
      if (data?.quizId) {
        map.set(data.quizId, data);
      }
    });
    return map;
  }, [queries]);

  const isLoading = queries.some(query => query.isLoading);
  const isError = queries.some(query => query.isError);

  return { progressMap, isLoading, isError };
};
