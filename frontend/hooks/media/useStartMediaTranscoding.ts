import { useAuth } from '@clerk/nextjs';
import { useCallback, useState } from 'react';

import { apiClient } from '@/lib/api-client';

type StartTranscodingResponse = {
  success: boolean;
  data?: {
    id: string;
    mediaId: string;
    status: string;
    progress: number;
  };
  message?: string;
  status?: string;
};

export const useStartMediaTranscoding = () => {
  const { getToken, orgId } = useAuth();
  const [isStarting, setIsStarting] = useState(false);

  const startTranscoding = useCallback(
    async (mediaId: string, qualities?: string[]) => {
      if (!mediaId || !orgId) return null;
      const token = await getToken();
      if (!token) return null;

      setIsStarting(true);
      try {
        const body: Record<string, unknown> = { organizationId: orgId };
        if (qualities && qualities.length > 0) {
          body.qualities = qualities;
        }
        return await apiClient<StartTranscodingResponse>(
          `media/${mediaId}/transcode`,
          'POST',
          token,
          body
        );
      } finally {
        setIsStarting(false);
      }
    },
    [getToken, orgId]
  );

  return {
    startTranscoding,
    isStarting,
  };
};
