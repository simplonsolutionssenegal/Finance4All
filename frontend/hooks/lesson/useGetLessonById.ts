import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';

export type GetLessonByIdResponse<TLesson = any> = {
  success?: boolean;
  status?: 'success' | 'error';
  data?: TLesson;
  message?: string;
};

const isLessonSuccess = (response: GetLessonByIdResponse | undefined): boolean => {
  if (!response) return false;
  return response.success === true || response.status === 'success';
};

export const useGetLessonById = <TLesson = any>(id: string) => {
  const { getToken } = useAuth();

  const query = useQuery({
    queryKey: ['lesson', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const token = await getToken();
      const response = await apiClient<GetLessonByIdResponse<TLesson>>(
        `lessons/${id}`,
        'GET',
        token
      );
      if (!isLessonSuccess(response)) {
        throw new Error(response?.message ?? 'Failed to fetch lesson');
      }
      return response;
    },
    staleTime: 5 * 60 * 1000,
  });

  const lesson = isLessonSuccess(query.data) ? query.data?.data : undefined;

  return {
    lesson,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
