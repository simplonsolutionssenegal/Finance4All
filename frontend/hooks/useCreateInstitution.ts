import { useAuth } from '@clerk/nextjs';
import { useMutation } from '@tanstack/react-query';
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
  const { showLoader, hideLoader } = useLoader();

  const mutation = useMutation({
    mutationFn: async (institutionData: CreateInstitutionDto) => {
      showLoader();
      const token = await getToken();
      return createInstitution(institutionData, token);
    },
    onSuccess: data => {
      hideLoader();
      if (data.success === true) {
        toast.success('Institution créée avec succès!');
        options?.onSuccess?.();
      } else {
        toast.error('La création a échoué', {
          description: data.message,
        });
      }
    },
    onError: (error: Error) => {
      hideLoader();
      toast.error('La création a échoué', {
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
