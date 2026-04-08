import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import type { Institution } from '@/types/Institution';

interface GetInstitutionResponse {
  success: boolean;
  data: Institution;
}

const getInstitution = async (
  id: string,
  token: string | null
): Promise<GetInstitutionResponse> => {
  return apiClient<GetInstitutionResponse>(`institutions/${id}`, 'GET', token);
};

export const useGetInstitution = (id: string) => {
  const { getToken } = useAuth();

  const query = useQuery({
    queryKey: ['institution', id],
    queryFn: async () => {
      const token = await getToken();
      return getInstitution(id, token);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    institution: query.data?.data,
    ...query,
  };
};
