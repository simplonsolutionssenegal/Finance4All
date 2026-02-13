import { useAuth } from '@clerk/nextjs';
import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import type { MediaProgressDTO } from '@/types/media';

type GetProgressResponse = {
  success: boolean;
  data: MediaProgressDTO;
  message?: string;
};

type UpdateProgressResponse = {
  success: boolean;
  data?: MediaProgressDTO;
  message?: string;
};

export const useMediaProgress = (mediaId?: string | null) => {
  const { getToken, orgId } = useAuth();

  const query = useQuery({
    queryKey: ['media-progress', mediaId, orgId],
    enabled: Boolean(mediaId && orgId),
    queryFn: async () => {
      const token = await getToken();
      if (!token || !mediaId || !orgId) {
        throw new Error('Missing auth or mediaId');
      }
      return apiClient<GetProgressResponse>(
        `media/${mediaId}/progress?organizationId=${orgId}`,
        'GET',
        token
      );
    },
    staleTime: 30 * 1000,
  });

  const updateProgress = useCallback(
    async (currentPosition: number, duration: number) => {
      if (!mediaId || !orgId) return;
      const token = await getToken();
      if (!token) return;
      try {
        await apiClient<UpdateProgressResponse>(`media/${mediaId}/progress`, 'POST', token, {
          organizationId: orgId,
          currentPosition,
          duration,
        });
      } catch {
        // silently ignore
      }
    },
    [getToken, mediaId, orgId]
  );

  return {
    progress: query.data?.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    updateProgress,
  };
};
