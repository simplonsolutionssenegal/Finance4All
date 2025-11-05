// frontend/src/hooks/modules/useGetModules.ts

import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import type { Module } from '@/types/modules/module';

interface GetModulesParams {
  page?: number;
  limit?: number;
}

interface PaginatedModulesResponse {
  success: boolean;
  data: Module[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

export const useGetModules = (params: GetModulesParams = {}) => {
  const { getToken } = useAuth();

  const query = useQuery({
    queryKey: ['modules', params.page, params.limit],
    queryFn: async () => {
      const token = await getToken();
      const { page = 1, limit = 10 } = params;
      return apiClient<PaginatedModulesResponse>(
        `modules?page=${page}&limit=${limit}`,
        'GET',
        token
      );
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    modules: query.data?.data || [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
