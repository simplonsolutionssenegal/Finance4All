import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';

import type { Institution } from '@/types/Institution';

interface GetInstitutionResponse {
  success: boolean;
  data: Institution;
}

const getInstitution = async (
  id: string,
  token: string | null
): Promise<GetInstitutionResponse> => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/institutions/${id}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(apiUrl, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    let errorData: { message?: string; errors?: { message: string }[] };
    try {
      errorData = await response.json();
    } catch (_parseError) {
      errorData = { message: `Error HTTP ${response.status}: ${response.statusText}` };
    }
    throw new Error(
      errorData.errors?.[0]?.message || errorData.message || 'Failed to fetch institution'
    );
  }

  return response.json();
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
