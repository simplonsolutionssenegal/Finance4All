import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import type { Institution } from '@/types/Institution';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface GetInstitutionsResponse {
  success: boolean;
  data: Institution[];
  pagination: PaginationInfo;
}

interface GetInstitutionsParams {
  page?: number;
  limit?: number;
}

const getInstitutions = async (
  params: GetInstitutionsParams,
  token: string | null
): Promise<GetInstitutionsResponse> => {
  const { page = 1, limit = 10 } = params;
  return apiClient<GetInstitutionsResponse>(
    `institutions?page=${page}&limit=${limit}`,
    'GET',
    token
  );
};

export const useGetInstitutions = (params: GetInstitutionsParams = {}) => {
  const { getToken } = useAuth();

  const query = useQuery({
    queryKey: ['institutions', params.page, params.limit],
    queryFn: async () => {
      const token = await getToken();
      return getInstitutions(params, token);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    institutions: query.data?.data || [],
    pagination: query.data?.pagination,
    ...query,
  };
};
