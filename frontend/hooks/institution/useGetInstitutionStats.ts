import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import type { InstitutionStats } from '@/types/Institution';

interface GetInstitutionStatsResponse {
  success: boolean;
  data: InstitutionStats;
}

const getInstitutionStats = async (token: string | null): Promise<GetInstitutionStatsResponse> => {
  return apiClient<GetInstitutionStatsResponse>('institutions/stats', 'GET', token);
};

export const useGetInstitutionStats = () => {
  const { getToken } = useAuth();

  const query = useQuery({
    queryKey: ['institutions', 'stats'],
    queryFn: async () => {
      const token = await getToken();
      return getInstitutionStats(token);
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    stats: query.data?.data,
    ...query,
  };
};
