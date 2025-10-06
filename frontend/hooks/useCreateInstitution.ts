import { useAuth } from '@clerk/nextjs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useLoader } from '@/contexts/LoaderContext';

interface CreateInstitutionDto {
  name: string;
  description: string;
  website?: string;
  geographicZones: string[];
  logoUrl?: string;
}

interface BackendResponse {
  success: boolean;
  message?: string;
  data?: any;
}

interface BackendErrorResponse {
  message?: string;
  errors?: { message: string }[];
}

const createInstitution = async (
  institutionData: CreateInstitutionDto,
  token: string | null
): Promise<BackendResponse> => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/institutions`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(institutionData),
  });

  if (!response.ok) {
    let errorData: BackendErrorResponse;
    try {
      errorData = await response.json();
    } catch (_parseError) {
      errorData = { message: `Error HTTP ${response.status}: ${response.statusText}` };
    }
    throw new Error(
      errorData.errors?.[0]?.message || errorData.message || 'Failed to create institution'
    );
  }

  return response.json();
};

export const useCreateInstitution = (options?: { onSuccess?: () => void }) => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { showLoader, hideLoader } = useLoader();

  const mutation = useMutation({
    mutationFn: async (institutionData: CreateInstitutionDto) => {
      showLoader();
      const token = await getToken();
      return createInstitution(institutionData, token);
    },
    onSuccess: data => {
      hideLoader();
      if (data.success) {
        toast.success('Institution created successfully!');
        // Invalidate and refetch the institutions list
        queryClient.invalidateQueries({ queryKey: ['institutions'] });
        options?.onSuccess?.();
      } else {
        toast.error('Failed to create institution', {
          description: data.message,
        });
      }
    },
    onError: (error: Error) => {
      hideLoader();
      toast.error('Creation failed', {
        description: error.message || 'An unexpected error occurred.',
      });
    },
  });

  return {
    createInstitution: mutation.mutate,
    isCreating: mutation.isPending,
    ...mutation,
  };
};
