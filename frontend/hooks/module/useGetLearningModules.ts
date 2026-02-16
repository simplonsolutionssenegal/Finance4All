'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { learningModuleService } from '@/services/learning-module.service';

export const useGetLearningModules = () => {
  const { getToken, isLoaded } = useAuth();

  const query = useQuery({
    queryKey: ['learning-modules'],
    queryFn: async () => {
      const token = await getToken();
      return learningModuleService.getModules(token);
    },
    enabled: isLoaded,
    staleTime: 5 * 60 * 1000,
  });

  return {
    modules: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
