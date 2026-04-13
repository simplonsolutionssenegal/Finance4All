import { useCallback, useEffect, useState } from 'react';

export interface DemographicStats {
  total: number;
  women: number;
  youth: number;
  inTraining: number;
}

interface UseBeneficiaryStatsReturn {
  stats: DemographicStats | null;
  isLoading: boolean;
  error: string | null;
}

export function useBeneficiaryStats(orgId?: string): UseBeneficiaryStatsReturn {
  const [stats, setStats] = useState<DemographicStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = orgId ? `?orgId=${encodeURIComponent(orgId)}` : '';
      const response = await fetch(`/api/beneficiaries/stats${params}`, {
        credentials: 'same-origin',
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `Erreur ${response.status}`);
      }

      const result = await response.json();
      setStats(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setIsLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error };
}
