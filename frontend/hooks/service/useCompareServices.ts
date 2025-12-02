// src/hooks/service/useCompareServices.ts
import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { ServiceDTO } from '@/types/Service';

interface CompareServicesResponse {
  success: boolean;
  data: ServiceDTO[];
  message: string;
}

const compareServices = async (
  ids: string[],
  token: string | null
): Promise<CompareServicesResponse> => {
  if (ids.length < 2) {
    throw new Error('Au moins 2 services doivent être sélectionnés pour la comparaison');
  }

  const idsParam = ids.join(',');

  return apiClient<CompareServicesResponse>(`services/compare?ids=${idsParam}`, 'GET', token);
};

export const useCompareServices = (ids: string[] = []) => {
  const { getToken } = useAuth();

  const query = useQuery({
    queryKey: ['services', 'compare', ids.sort().join(',')],
    queryFn: async () => {
      const token = await getToken();
      return compareServices(ids, token);
    },
    enabled: ids.length >= 2, // Ne lance la requête que si au moins 2 services sont sélectionnés
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    services: query.data?.data || [],
    message: query.data?.message,
    ...query,
  };
};
