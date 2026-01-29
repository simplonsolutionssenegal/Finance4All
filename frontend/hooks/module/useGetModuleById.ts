import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import type { Module } from '@/types/modules/module';

type GetModuleByIdResponse = {
  success: boolean;
  data: Module;
  message?: string;
};

export const useGetModuleById = (id: string) => {
  const { getToken } = useAuth();

  const query = useQuery({
    queryKey: ['module', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const token = await getToken();
      return apiClient<GetModuleByIdResponse>(`modules/${id}`, 'GET', token);
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    module: query.data?.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
