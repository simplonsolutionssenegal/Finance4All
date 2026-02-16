import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';

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
  const stableIds = useMemo(() => normalizeIds(quizIds), [quizIds]);

  const queries = useQueries({
    queries: stableIds.map(id => ({
      queryKey: ['quiz-progress', id],
      enabled: Boolean(id),
      queryFn: async (): Promise<GetQuizProgressResponse> => {
        const response = await fetch(`/api/quizzes/${id}/progress/me`, {
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
