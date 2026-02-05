import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import type { MediaDTO } from '@/types/media';

type GetMediaByIdResponse = {
  success: boolean;
  data: MediaDTO;
  message?: string;
};

export const useGetMediaById = (id: string) => {
  const { getToken } = useAuth();

  const query = useQuery({
    queryKey: ['media', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const token = await getToken();
      return apiClient<GetMediaByIdResponse>(`media/${id}`, 'GET', token);
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    media: query.data?.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
