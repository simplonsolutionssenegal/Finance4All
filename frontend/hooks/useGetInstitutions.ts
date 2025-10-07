import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';

interface Institution {
  id: string;
  name: string;
  description: string;
  website: string;
  geographicZones: string[];
  logoUrl: string;
  status: InstitutionStatus;
  createdAt: string;
  updatedAt: string;
}

export enum InstitutionStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
}

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
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/institutions?page=${page}&limit=${limit}`;

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
      errorData.errors?.[0]?.message || errorData.message || 'Failed to fetch institutions'
    );
  }

  return response.json();
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
