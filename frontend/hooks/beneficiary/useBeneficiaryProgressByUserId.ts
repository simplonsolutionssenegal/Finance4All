import { useCallback, useEffect, useState } from 'react';

import type { BeneficiaireDashboardData } from './useBeneficiaireDashboardData';

interface UseBeneficiaryProgressReturn {
  data: BeneficiaireDashboardData | null;
  isLoading: boolean;
  error: string | null;
}

export function useBeneficiaryProgressByUserId(
  clerkUserId: string | undefined
): UseBeneficiaryProgressReturn {
  const [data, setData] = useState<BeneficiaireDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!clerkUserId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/beneficiaries/dashboard?userId=${encodeURIComponent(clerkUserId)}`,
        { credentials: 'same-origin' }
      );

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
        };
        throw new Error(body.error ?? body.message ?? `Erreur ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors du chargement';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [clerkUserId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error };
}
