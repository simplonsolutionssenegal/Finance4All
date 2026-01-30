'use client';

import { useEffect, useState } from 'react';

import { getMediaById } from '@/lib/api/media';

export function useMediaUrl(mediaId?: string | null) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!mediaId) {
        setUrl(null);
        return;
      }

      setLoading(true);
      try {
        const media = await getMediaById(mediaId);
        if (!cancelled) setUrl(media?.url ?? null);
      } catch {
        if (!cancelled) setUrl(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [mediaId]);

  return { url, loading };
}
