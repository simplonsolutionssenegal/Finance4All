import { useAuth } from '@clerk/nextjs';
import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import type { MediaProgressDTO } from '@/types/media';

type GetProgressResponse = {
  success: boolean;
  data: MediaProgressDTO;
  message?: string;
};

const normalizeIds = (ids: (string | undefined | null)[]): string[] => {
  const unique = new Set<string>();
  ids.forEach(id => {
    if (id) unique.add(id);
  });
  return Array.from(unique);
};

/**
 * Fetches MediaProgress for multiple media IDs in parallel.
 * Returns a Map<mediaId, MediaProgressDTO> to check completion status.
 */
export const useMediaProgressMap = (mediaIds: (string | undefined | null)[]) => {
  const { getToken } = useAuth();
  const stableIds = useMemo(() => normalizeIds(mediaIds), [mediaIds]);

  const queries = useQueries({
    queries: stableIds.map(mediaId => ({
      queryKey: ['media-progress', mediaId],
      enabled: Boolean(mediaId),
      queryFn: async (): Promise<GetProgressResponse> => {
        const token = await getToken();
        if (!token) {
          throw new Error('Missing auth');
        }
        return apiClient<GetProgressResponse>(`media/${mediaId}/progress`, 'GET', token);
      },
      staleTime: 30 * 1000,
      // Don't throw on 404 — user may not have started this media yet
      retry: false,
    })),
  });

  const progressMap = useMemo(() => {
    const map = new Map<string, MediaProgressDTO>();
    queries.forEach(query => {
      const data = query.data?.data;
      if (data?.mediaId) {
        map.set(data.mediaId, data);
      }
    });
    return map;
  }, [queries]);

  const isLoading = queries.some(query => query.isLoading);

  return { mediaProgressMap: progressMap, isLoading };
};
