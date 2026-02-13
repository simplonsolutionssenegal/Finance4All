import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import type { StreamManifestDTO } from '@/types/media';

type GetStreamManifestResponse = {
  success: boolean;
  data: StreamManifestDTO;
  message?: string;
  status?: string;
};

type UseGetMediaStreamOptions = {
  enabled?: boolean;
};

export const useGetMediaStream = (
  mediaId?: string | null,
  options: UseGetMediaStreamOptions = {}
) => {
  const { getToken, orgId } = useAuth();

  const query = useQuery({
    queryKey: ['media-stream', mediaId, orgId],
    enabled: Boolean(mediaId && orgId && (options.enabled ?? true)),
    queryFn: async () => {
      const token = await getToken();
      if (!token || !mediaId || !orgId) {
        throw new Error('Missing auth or mediaId');
      }
      const queryString = `organizationId=${encodeURIComponent(orgId)}`;
      return apiClient<GetStreamManifestResponse>(
        `media/${mediaId}/stream?${queryString}`,
        'GET',
        token
      );
    },
    staleTime: 30 * 1000,
  });

  return {
    stream: query.data?.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
