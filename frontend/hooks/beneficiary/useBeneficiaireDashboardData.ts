// hooks/beneficiary/useBeneficiaireDashboardData.ts

import { useCallback, useEffect, useState } from 'react';

export interface BeneficiaireStats {
  modulesCompleted: { current: number; total: number };
  learningTime: string;
  quizzesPassed: { current: number; total: number };
  globalProgress: number;
  modulesCompletedTrend?: string;
  learningTimeTrend?: string;
  globalProgressTrend?: string;
  quizzesPassedTrend?: string;
}

export interface BeneficiaireModuleStats {
  completed: number;
  inProgress: number;
  notStarted: number;
  total: number;
}

export interface BeneficiaireMonthlyProgress {
  month: string;
  progress: number;
}

export interface BeneficiaireDashboardData {
  stats: BeneficiaireStats;
  moduleStats: BeneficiaireModuleStats;
  monthlyProgress: BeneficiaireMonthlyProgress[];
}

interface UseBeneficiaireDashboardDataReturn {
  data: BeneficiaireDashboardData | null;
  isLoading: boolean;
  error: string | null;
  isLoaded: boolean;
  refetch: () => Promise<void>;
  resetError: () => void;
}

export function useBeneficiaireDashboardData(userId?: string): UseBeneficiaireDashboardDataReturn {
  const [data, setData] = useState<BeneficiaireDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const getErrorMessage = useCallback((err: unknown): string => {
    if (err instanceof Error) {
      return err.message;
    }
    if (typeof err === 'string') {
      return err;
    }
    return 'Une erreur est survenue lors de la récupération des données';
  }, []);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const url = `/api/beneficiaire/dashboard/stats${userId ? `?userId=${userId}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
        };
        const msg =
          errorData.error ??
          errorData.message ??
          `Erreur ${response.status}: ${response.statusText}`;
        throw new Error(msg);
      }

      const result = await response.json();

      if (!result) {
        throw new Error('Aucune donnée reçue du serveur');
      }

      setData(result);
      setIsLoaded(true);
    } catch (err: unknown) {
      console.error('Erreur lors de la récupération des données du dashboard:', err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      setIsLoaded(true);
    } finally {
      setIsLoading(false);
    }
  }, [userId, getErrorMessage]);

  const refetch = useCallback(async () => {
    await fetchDashboardData();
  }, [fetchDashboardData]);
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    data,
    isLoading,
    error,
    isLoaded,
    refetch,
    resetError,
  };
}

export function useBeneficiaireDashboardDataRealtime(
  userId?: string,
  refreshInterval: number = 30000
): UseBeneficiaireDashboardDataReturn {
  const result = useBeneficiaireDashboardData(userId);

  useEffect(() => {
    if (refreshInterval <= 0) return;

    const interval = setInterval(() => {
      result.refetch();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, result]);

  return result;
}
