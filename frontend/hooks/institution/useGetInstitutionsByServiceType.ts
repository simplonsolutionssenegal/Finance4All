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

interface GetInstitutionsByServiceTypeResponse {
  success: boolean;
  data: Institution[];
  pagination: PaginationInfo;
}

interface GetInstitutionsByServiceTypeParams {
  type: string;
  page?: number;
  limit?: number;
}

const getInstitutionsByServiceType = async (
  params: GetInstitutionsByServiceTypeParams,
  token: string | null
): Promise<GetInstitutionsByServiceTypeResponse> => {
  const { type, page = 1, limit = 10 } = params;
  return apiClient<GetInstitutionsByServiceTypeResponse>(
    `institutions/by-service-type?type=${type}&page=${page}&limit=${limit}`,
    'GET',
    token
  );
};

export const useGetInstitutionsByServiceType = (params: GetInstitutionsByServiceTypeParams) => {
  const { getToken } = useAuth();

  const query = useQuery({
    queryKey: ['institutions', 'by-service-type', params.type, params.page, params.limit],
    queryFn: async () => {
      const token = await getToken();
      return getInstitutionsByServiceType(params, token);
    },
    enabled: !!params.type, // Ne lance la requête que si le type est défini
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    institutions: query.data?.data || [],
    pagination: query.data?.pagination,
    ...query,
  };
};
