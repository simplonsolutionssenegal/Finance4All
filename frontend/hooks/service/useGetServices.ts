// src/hooks/service/useGetServices.ts
import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import type { ServiceDTO } from '@/types/Service';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface GetServicesResponse {
  success: boolean;
  data: ServiceDTO[];
  pagination: PaginationInfo;
}

interface GetServicesParams {
  page?: number;
  limit?: number;
  type?: string;
}

const getServices = async (
  params: GetServicesParams,
  token: string | null
): Promise<GetServicesResponse> => {
  const { page = 1, limit = 50, type } = params;

  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (type && type !== 'ALL') {
    query.append('type', type);
  }

  // apiClient rajoute déjà /api/v1 comme pour institutions
  return apiClient<GetServicesResponse>(`services?${query.toString()}`, 'GET', token);
};

export const useGetServices = (params: GetServicesParams = {}) => {
  const { getToken } = useAuth();

  const query = useQuery({
    queryKey: ['services', params.page, params.limit, params.type],
    queryFn: async () => {
      const token = await getToken();
      return getServices(params, token);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    services: query.data?.data || [],
    pagination: query.data?.pagination,
    ...query,
  };
};
